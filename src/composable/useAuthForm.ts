import { computed, nextTick, reactive, ref, Ref } from 'vue';
import {
  EMAIL_REGEXP,
  MOBILE_PHONE_REGEXP,
  PASSWORD_REGEXP,
  USERNAME_REGEXP,
  VCODE_REGEXP,
  tokenStorageRef,
  userDetailsStorageRef
} from '../utils';
import { ValidationRule } from 'ant-design-vue/lib/form/Form';
import { Form, message } from 'ant-design-vue';
import _ from 'underscore';
import { fusions } from '../fusions';
import { useRoute, useRouter } from 'vue-router';
import router from '../router';

/** 表单中可能发生的错误 */
export enum LoginRegisterFormError {
  USEREMAIL_FORMAT_INVALID = '邮箱格式不正确！',
  USEREMAIL_NOTFOUND = '该邮箱未注册！',
  USERNAME_FORMAT_INVALID = '用户名格式不正确！',
  PASSWORD_FORMAT_INVALID = '密码格式不正确！',
  PHONE_FORMAT_INVALID = '手机号码格式不正确！',
  PHONE_VERIFY_FORMAT_INVALID = '短信验证码格式不正确！',
  PASSWORD_NOTSAME = '两次密码输入不一致！',
  FORM_VALIDATE_FAILED = '表单有字段填写错误！',
  LOGIN_REQUEST_FAILED = '登录请求失败！',
  REGISTER_REQUEST_FAILED = '注册请求失败！',
  VCODE_FORMAT_INVALID = '验证码应为 6 位数字！'
}
/** 表单类型 */
export enum LoginFormType {
  NAME_FORM = 0,
  EMAIL_FORM = 1
}
/** 表单最终提交的数据模型 */
export interface LoginFormData {
  userName: string;
  password: string;
  formType: LoginFormType;
}

const authFormMessageKey = 'auth';
const $content = (content: string) => ({
  content,
  key: authFormMessageKey,
  duration: 1
});

export function useLoginForm() {
  const route = useRoute();

  // @States:
  const loginForm = reactive({
    userName: route.query.userName || '',
    userEmail: route.query.userEmail || '',
    password: '',
    formType:
      route.query.type === 'email'
        ? LoginFormType.EMAIL_FORM
        : LoginFormType.NAME_FORM,
    rememberMe: false
  });
  const loginFormRules: Ref<Record<string, ValidationRule[]>> = ref({
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
        trigger: 'change'
      }
    ],
    userEmail: [
      {
        validator: async (rule: unknown, value: string) => {
          if (
            loginForm.formType === LoginFormType.EMAIL_FORM
          ) {
            if (!EMAIL_REGEXP.test(value)) {
              return Promise.reject(
                LoginRegisterFormError.USEREMAIL_FORMAT_INVALID
              );
            }
            /** 查找当前邮箱账号是否存在，若存在取出它的用户名 */
          return (await seekByEmailFn(value))
            ? Promise.resolve()
            : Promise.reject(LoginRegisterFormError.USEREMAIL_NOTFOUND);
          }
        },
        trigger: 'change'
      }
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
        trigger: 'change'
      }
    ]
  });
  const { validate } = Form.useForm(loginForm, loginFormRules);

  const seekByEmailFn /** @Utils: */ = _.debounce(
    async (email: string) => {
      const res = await fusions.get('/user/seekByEmail?email=' + email);
      if (res.data.responseOk) {
        loginForm.userName = res.data.data.userName;
      }
      return res.data.responseOk;
    },
    2000,
    true
  );

  // @Methods:
  const clearForm = () => {
    loginForm.userName = '';
    loginForm.userEmail = '';
    loginForm.password = '';
    loginForm.rememberMe = false;
  };
  const handleChangeFormType = (_type: LoginFormType) => {
    loginForm.formType = _type;
    clearForm();
  };
  const handleSubmitLoginForm = _.debounce(
    async () => {
      // 首先验证各字段
      validate()
        .then(async (validateResult) => {
          if (!validateResult) {
            message.error(
              $content(LoginRegisterFormError.FORM_VALIDATE_FAILED)
            );
            return;
          }
          const res = await fusions.post(
            '/user/login',
            _.omit(loginForm, ['userEmail'])
          );
          if (res.data.responseOk) {
            message.success($content('登录成功！'));
            tokenStorageRef.value = res.data.data.token;
            nextTick(() => {
              router.push('/dashboard');
            });
          }
        })
        .catch(() => {
          message.error($content(LoginRegisterFormError.LOGIN_REQUEST_FAILED));
        });
    },
    2000,
    true
  );

  return {
    loginForm,
    loginFormRules,
    handleSubmitLoginForm,
    handleChangeFormType,
  };
}

export function useRegisterForm() {
  const router = useRouter();
  const route = useRoute();

  // @States:
  const registerForm = reactive({
    userName: route.query.userName ?? '',
    userEmail: '',
    userPhone: '',
    phoneVerify: '',
    password: '',
    confirmPassword: ''
  });
  const registerFormRules: Ref<Record<string, ValidationRule[]>> = ref({
    userName: [
      {
        validator: (rule, value) => {
          if (!USERNAME_REGEXP.test(value))
            return Promise.reject(
              LoginRegisterFormError.USERNAME_FORMAT_INVALID
            );
          return Promise.resolve();
        }
      }
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
        }
      }
    ],
    userPhone: [
      {
        validator: (rule, value) => {
          if (!MOBILE_PHONE_REGEXP.test(value)) {
            return Promise.reject(LoginRegisterFormError.PHONE_FORMAT_INVALID);
          }
          return Promise.resolve();
        }
      }
    ],
    phoneVerify: [
      {
        validator: (rule, value) => {
          if (!VCODE_REGEXP.test(value)) {
            return Promise.reject(
              LoginRegisterFormError.PHONE_VERIFY_FORMAT_INVALID
            );
          }
          return Promise.resolve();
        }
      }
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
        }
      }
    ],
    confirmPassword: [
      {
        validator: (rule, value) => {
          if (value !== registerForm.password) {
            return Promise.reject(LoginRegisterFormError.PASSWORD_NOTSAME);
          }
          return Promise.resolve();
        }
      }
    ]
  });
  const { validate } = Form.useForm(registerForm, registerFormRules);
  const isSendSmsCodeBtnDisabled = ref(false);
  const sendSmsCodeAgainPendingSeconds = ref(0);
  const sendSmsCodeCount = ref(0);
  const registerFormTRef = ref<InstanceType<typeof Form> | null>(null);

  // @Methods:
  const handleSubmitRegisterForm = _.debounce(
    async () => {
      validate()
        .then(async (validateResult) => {
          if (!validateResult) {
            message.error(
              $content(LoginRegisterFormError.FORM_VALIDATE_FAILED)
            );
            return;
          }

          const res = await fusions.post(
            '/user/register',
            _.omit(registerForm, ['confirmPassword'])
          );
          if (res.data.responseOk) {
            message.success($content('注册成功！'));
            router.push({
              path: '/login',
              query: {
                userName: registerForm.userName
              }
            });
          }
        })
        .catch(() => {
          message.error(
            $content(LoginRegisterFormError.REGISTER_REQUEST_FAILED)
          );
        });
    },
    2000,
    true
  );
  const sendSmsCode = async () => {
    if (!MOBILE_PHONE_REGEXP.test(registerForm.userPhone)) {
      message.warn('您输入的手机号码有误，请检查后再试！');
      return;
    }

    const smsSendRes = await fusions.post('/user/sendSmsCode', {
      userPhone: registerForm.userPhone
    });
    if (smsSendRes.data.responseOk) {
      message.success($content(smsSendRes.data.message));
      isSendSmsCodeBtnDisabled.value = true; // 刚发送，禁用按钮避免重复发送
      sendSmsCodeCount.value++;
      sendSmsCodeAgainPendingSeconds.value = 60 * sendSmsCodeCount.value;
      const pending = setInterval(() => {
        if (sendSmsCodeAgainPendingSeconds.value > 0) {
          sendSmsCodeAgainPendingSeconds.value--;
        } else if (sendSmsCodeAgainPendingSeconds.value === 0) {
          isSendSmsCodeBtnDisabled.value = false; // 结束倒计时
          clearInterval(pending);
        }
      }, 1000); // 一秒一次
    }
  };

  return {
    registerForm,
    registerFormTRef,
    registerFormRules,
    isSendSmsCodeBtnDisabled,
    sendSmsCodeAgainPendingSeconds,
    handleSubmitRegisterForm,
    sendSmsCode
  };
}

export function runLogout() {
  // 清理已存储的 token
  tokenStorageRef.value = null;
  // @ts-ignore 清理用户详细信息缓存
  userDetailsStorageRef.value = null;

  nextTick(() => {
    const logoutMsgCloser = message.loading({
      content: '正在退出登录...',
      duration: 1,
      key: 'logout-message-tip',
      onClose: () => {
        router.push('/login').then(() => {
          logoutMsgCloser();
        });
      }
    });
  });
}
