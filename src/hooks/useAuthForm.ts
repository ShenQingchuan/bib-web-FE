import { computed, reactive, ref } from "vue";
import {
  EMAIL_REGEXP,
  PASSWORD_REGEXP,
  USERNAME_REGEXP,
} from "../utils/commonly-used-regexp";
import { ValidationRule } from "ant-design-vue/lib/form/Form";
import { Form, message } from "ant-design-vue";
import * as _ from "underscore";
import fusions from "../fusions";
import { useRouter } from "vue-router";
import { tokenStorageRef } from "../utils/user-token-validation";
import router from "../router";

/** 表单中可能发生的错误 */
export enum LoginRegisterFormError {
  USEREMAIL_FORMAT_INVALID = "邮箱格式不正确！",
  USEREMAIL_NOTFOUND = "该邮箱未注册！",
  USERNAME_FORMAT_INVALID = "用户名格式不正确！",
  PASSWORD_FORMAT_INVALID = "密码格式不正确！",
  PASSWORD_NOTSAME = "两次密码输入不一致！",
  FORM_VALIDATE_FAILED = "表单有字段填写错误！",
}
/** 表单类型 */
export enum LoginFormType {
  NAME_FORM = 0,
  EMAIL_FORM = 1,
}
/** 表单最终提交的数据模型 */
export interface LoginFormData {
  userName: string;
  password: string;
  formType: LoginFormType;
}

export function useLoginForm() {
  // @States:
  const loginForm = reactive({
    userName: "",
    userEmail: "",
    password: "",
    formType: LoginFormType.NAME_FORM,
    rememberMe: false,
  });
  const loginFormTRef = ref<InstanceType<typeof Form> | null>(null);

  const seekByEmailFn /** @Utils: */ = _.debounce(
    async (email: string) => {
      const res = await fusions.get("/auth/seekByEmail?email=" + email);
      if (res.data.isResponseOk) {
        loginForm.userName = res.data.data.userName;
      }
      return res.data.isResponseOk;
    },
    2000,
    true
  );
  const loginFormRules: Record<string, ValidationRule[]> = {
    userName: [
      {
        validator: async (rule, value) => {
          if (
            loginForm.formType === LoginFormType.NAME_FORM &&
            !USERNAME_REGEXP.test(value)
          ) {
            return Promise.reject(
              LoginRegisterFormError.USERNAME_FORMAT_INVALID
            );
          }

          return Promise.resolve();
        },
        trigger: "change",
      },
    ],
    userEmail: [
      {
        validator: async (rule: unknown, value: string) => {
          if (
            loginForm.formType === LoginFormType.EMAIL_FORM &&
            !EMAIL_REGEXP.test(value)
          ) {
            return Promise.reject(
              LoginRegisterFormError.USEREMAIL_FORMAT_INVALID
            );
          }

          /** 查找当前邮箱账号是否存在，若存在取出它的用户名 */
          return (await seekByEmailFn(value))
            ? Promise.resolve()
            : Promise.reject(LoginRegisterFormError.USEREMAIL_NOTFOUND);
        },
        trigger: "change",
      },
    ],
    password: [
      {
        validator: async (rule, value) => {
          if (!PASSWORD_REGEXP.test(value)) {
            return Promise.reject(
              LoginRegisterFormError.PASSWORD_FORMAT_INVALID
            );
          }

          return Promise.resolve();
        },
        trigger: "change",
      },
    ],
  };

  // @Computed:
  const submitable = computed(
    () =>
      loginFormTRef.value?.fields.reduce((p, c) => p + c.errors.length, 0) ===
        0 &&
      loginFormTRef.value?.fields.every((field) => field.fieldValue !== "")
  );

  // @Methods:
  const clearForm = () => {
    loginForm.userName = "";
    loginForm.userEmail = "";
    loginForm.password = "";
    loginForm.rememberMe = false;
  };
  const handleChangeFormType = (_type: LoginFormType) => {
    loginForm.formType = _type;
    clearForm();
  };
  const handleSubmitLoginForm = _.debounce(
    async () => {
      // 首先验证各字段
      loginFormTRef.value
        ?.validate()
        .then(async (validateResult) => {
          if (!validateResult) {
            message.error(LoginRegisterFormError.FORM_VALIDATE_FAILED, 1);
            return;
          }
          const res = await fusions.post(
            "/auth/login",
            _.omit(loginForm, ["userEmail"])
          );
          if (res.data.isResponseOk) {
            message.success("登录成功！");
            tokenStorageRef.value = res.data.data.token;
            router.push("/dashboard");
          }
        })
        .catch(() => {
          message.error(LoginRegisterFormError.FORM_VALIDATE_FAILED, 1);
        });
    },
    2000,
    true
  );

  return {
    loginForm,
    loginFormTRef,
    loginFormRules,
    handleSubmitLoginForm,
    handleChangeFormType,
    submitable,
  };
}

export function useRegisterForm() {
  const router = useRouter();

  // @States:
  const registerForm = reactive({
    userName: "",
    userEmail: "",
    password: "",
    confirmPassword: "",
  });
  const registerFormTRef = ref<InstanceType<typeof Form> | null>(null);
  const registerFormRules: Record<string, ValidationRule[]> = {
    userName: [
      {
        validator: (rule, value) => {
          if (!USERNAME_REGEXP.test(value))
            return Promise.reject(
              LoginRegisterFormError.USERNAME_FORMAT_INVALID
            );
          return Promise.resolve();
        },
      },
    ],
    userEmail: [
      {
        validator: (rule, value) => {
          if (!EMAIL_REGEXP.test(value)) {
            return Promise.reject(
              LoginRegisterFormError.USEREMAIL_FORMAT_INVALID
            );
          }
          return Promise.resolve();
        },
      },
    ],
    password: [
      {
        validator: (rule, value) => {
          if (!PASSWORD_REGEXP.test(value)) {
            return Promise.reject(
              LoginRegisterFormError.PASSWORD_FORMAT_INVALID
            );
          }
          return Promise.resolve();
        },
      },
    ],
    confirmPassword: [
      {
        validator: (rule, value) => {
          if (value !== registerForm.password) {
            return Promise.reject(LoginRegisterFormError.PASSWORD_NOTSAME);
          }
          return Promise.resolve();
        },
      },
    ],
  };

  // @Computed:
  const submitable = computed(
    () =>
      registerFormTRef.value?.fields.reduce(
        (p, c) => p + c.errors.length,
        0
      ) === 0 &&
      registerFormTRef.value?.fields.every((field) => field.fieldValue !== "")
  );

  // @Methods:
  const handleSubmitRegisterForm = _.debounce(
    async () => {
      registerFormTRef.value
        ?.validate()
        .then(async (validateResult) => {
          if (!validateResult) {
            message.error(LoginRegisterFormError.FORM_VALIDATE_FAILED, 1);
            return;
          }

          const res = await fusions.post(
            "/auth/register",
            _.omit(registerForm, ["confirmPassword"])
          );
          if (res.data.isResponseOk) {
            message.success("注册成功！");
            router.push("/login");
          }
        })
        .catch(() => {
          message.error(LoginRegisterFormError.FORM_VALIDATE_FAILED, 1);
        });
    },
    2000,
    true
  );

  return {
    registerForm,
    registerFormTRef,
    registerFormRules,
    handleSubmitRegisterForm,
    submitable,
  };
}

export function runLogout() {
  tokenStorageRef.value = null;
  const logoutMsgCloser = message.loading("正在退出登录...", 1, () => {
    router.push("/login").then(() => {
      logoutMsgCloser();
    });
  });
}
