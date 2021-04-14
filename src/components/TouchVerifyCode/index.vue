<template>
  <div class="verify-code-wrap m-t-20">
    <div class="verify-canvas-container">
      <canvas :width="containerSize.width" :height="containerSize.height" ref="container" />
      <canvas
        :width="containerSize.width"
        :height="containerSize.height"
        ref="slide"
        class="verify-slide-block"
      />
      <a-button class="verify-refresh" shape="circle" @click="handleRefresh">
        <template #icon>
          <ReloadOutlined />
        </template>
      </a-button>
      <transition name="slide">
        <div class="verify-time" v-show="verifySuccess">验证成功~本次验证共计{{ verifyUse }}秒</div>
      </transition>
      <transition name="fade">
        <div v-if="!verifyImageLoaded" class="verify-loading-image">图片加载中...请稍等</div>
      </transition>
    </div>
    <div
      :class="[
        'touch-verify-bar',
        {
          'touch-verify-bar__progress': verifying,
          'touch-verify-bar__success': verifySuccess,
          'touch-verify-bar__failed': verifyFailed
        }
      ]"
    >
      <div class="touch-verify-slide-bar" :style="{ width: verifyProgressWidth }">
        <div
          class="touch-verify-slide-block"
          :style="{ left: blockLeftValue }"
          @mousedown="onBlockTouch"
        >
          <CheckOutlined v-if="verifySuccess" />
          <CloseOutlined v-else-if="verifyFailed" />
          <DoubleRightOutlined v-else />
        </div>
      </div>
      <p v-show="showVerifyBarText" v-html="barText" />
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  reactive,
  ref
} from "vue";
import useCanvasOnDraw from "@/composable/useCanvasOnDraw";
import useRandomImage, {
  calculate,
  createRandomRange,
  square
} from "@/composable/useRandomImage";
import useMouseEvent from "@/composable/useMouseEvent";
import {
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  DoubleRightOutlined
} from "@ant-design/icons-vue";

const BLOCK_SIZE = 48;

const TouchVerifyCode = defineComponent({
  name: "TouchVerifyCode",
  components: {
    ReloadOutlined,
    CheckOutlined,
    CloseOutlined,
    DoubleRightOutlined
  },
  props: {
    containerSize: {
      type: Object as PropType<{
        width: number;
        height: number;
      }>,
      default: {
        width: 300,
        height: 250
      }
    },
    slideSize: {
      type: Number,
      default: 56
    },
    slideRadius: {
      type: Number,
      default: 10
    },
    accuracy: {
      type: Number,
      default: 5
    },
    barText: {
      type: String,
      default: "按住滑块，向右拖动 >>"
    }
  },
  emits: ["success", "failed", "after-reset", "refresh"],
  setup(props, { emit }) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const {
      slideSize: size,
      slideRadius: radius,
      containerSize: { width, height }
    } = props;
    const onDraw = useCanvasOnDraw(size, radius);
    const { onImageCreate, createRandomImageOnline } = useRandomImage(
      width,
      height
    );

    // 容器
    const container = ref<HTMLCanvasElement | null>(null);
    const slide = ref<HTMLCanvasElement | null>(null);
    const containerContext = ref<CanvasRenderingContext2D | null>(null);
    const slideContext = ref<CanvasRenderingContext2D | null>(null);

    // 滑块验证相关
    const verifyImage = ref<HTMLImageElement | null>(null);
    const verifyImageLoaded = ref(false);
    const verifying = ref(false);
    const verifySuccess = ref(false);
    const verifyFailed = ref(false);
    const verifyProgressWidth = ref("0px");
    const verifyStart = ref(false);
    const verifyCoordinate = reactive({ x: 0, y: 0 });
    const verifyTimestamp = ref<number>(0);
    const verifyUse = computed(() => verifyTimestamp.value / 1000);
    const verifyTrailArr = ref<number[]>([]);
    const showVerifyBarText = computed(
      () => !verifyStart.value && !verifySuccess.value && !verifyFailed.value
    );

    const blockLeftValue = ref("0px");

    const slideSize = size + radius * 2 + 3;

    const slideOptions = reactive({
      x: 0,
      y: 0
    });

    const onDomInit = () => {
      containerContext.value = container.value?.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
      slideContext.value = slide.value?.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
    };

    // 重置所有滑块相关的状态
    const onReset = () => {
      verifyStart.value = false;
      verifyImageLoaded.value = false;
      verifying.value = false;
      verifySuccess.value = false;
      verifyFailed.value = false;
      verifyProgressWidth.value = "0px";
      slide.value!.style.left = "0px";
      blockLeftValue.value = "0px";
      containerContext.value?.clearRect(0, 0, width, height);
      slideContext.value?.clearRect(0, 0, width, height);
      slide.value!.width = width;

      const {
        containerSize: { width: cWidth, height: cHeight }
      } = props;
      verifyImage.value!.src = createRandomImageOnline(cWidth, cHeight);
      emit("after-reset");
    };

    // 验证逻辑
    const onVerify = () => {
      const verifyArr = verifyTrailArr.value.slice();
      // 计算平均值
      const avg = verifyArr.reduce(calculate) / verifyArr.length;
      // 计算偏差值
      const deviations = verifyArr.map(x => x - avg);
      // 标准偏差值
      const standardDeviations = Math.sqrt(
        deviations.map(square).reduce(calculate) / verifyArr.length
      );
      const blockMoveX = parseInt(slide.value!.style.left);
      const accuracy =
        props.accuracy <= 1 ? 1 : props.accuracy >= 10 ? 10 : props.accuracy;

      return {
        correct: Math.abs(blockMoveX - slideOptions.x) <= accuracy,
        userOperator: avg !== standardDeviations
      };
    };

    // 成功
    const onVerifySuccess = () => {
      verifySuccess.value = true;
      emit("success", verifyUse.value);
    };

    // 失败
    const onVerifyFailed = () => {
      verifyFailed.value = true;
      setTimeout(onReset, 1000);
      emit("failed");
    };

    const handleRefresh = () => {
      onReset();
      emit("refresh");
    };

    // 绘制卡片块
    const runSlideDrew = () => {
      const size = slideSize + 10;
      slideOptions.x = createRandomRange(size, width - size);
      slideOptions.y = createRandomRange(radius * 2 + 10, height - size);

      onDraw(containerContext.value!, slideOptions.x, slideOptions.y, "fill");
      onDraw(slideContext.value!, slideOptions.x, slideOptions.y, "clip");
    };

    const onImageInit = () => {
      const image = onImageCreate(() => {
        verifyImageLoaded.value = true;
        runSlideDrew();
        containerContext.value?.drawImage(image, 0, 0, width, height);
        slideContext.value?.drawImage(image, 0, 0, width, height);
        const _y = slideOptions.y - radius * 2 - 1;
        const ImageData = slideContext.value!.getImageData(
          slideOptions.x,
          _y,
          slideSize,
          slideSize
        );
        slide.value!.width = slideSize;
        slideContext.value?.putImageData(ImageData, 0, _y);
      });
      verifyImage.value = image;
    };

    // 设置状态，起始坐标
    const onBlockTouch = (event: MouseEvent) => {
      if (verifySuccess.value) return false;
      if (!verifyImageLoaded.value) return false;
      verifyCoordinate.x = event.clientX;
      verifyCoordinate.y = event.clientY;
      verifyTimestamp.value = +new Date();
      verifyStart.value = true;
    };

    const onBlockMove = (event: MouseEvent) => {
      if (!verifyStart.value) return false;
      const verifyMoveX = event.clientX - verifyCoordinate.x;
      // const verifyMoveY = event.clientY - verifyCoordinate.y;
      if (verifyMoveX < 0 || verifyMoveX + BLOCK_SIZE >= width) return false;
      const moveStr = verifyMoveX + "px";
      const leftValue =
        ((width - 50 - radius * 2) / (width - 50)) * verifyMoveX;
      verifying.value = true;
      slide.value!.style.left = leftValue + "px";
      blockLeftValue.value = verifyMoveX - 2 + "px";
      verifyProgressWidth.value = moveStr;
      verifyTrailArr.value.push(verifyMoveX);
    };

    // 当离开滑块时进行正确性的判断
    const onBlockTouchLeave = (event: MouseEvent) => {
      if (!verifyStart.value) return false;
      verifyStart.value = false;
      if (event.clientX === verifyCoordinate.x) return false;
      verifying.value = false;
      verifyTimestamp.value = +new Date() - verifyTimestamp.value!;

      const { correct, userOperator } = onVerify();

      if (correct) {
        // 跳过人机验证
        if (props.accuracy === -1) return onVerifySuccess();
        // 如果是人机 则需重新验证
        if (userOperator) return onVerifySuccess();
        else return onVerifyFailed();
      } else onVerifyFailed();
    };

    // 边界处理 防止鼠标拖动过程中移出滑块之外
    const onBlockOutside = () => {
      if (!verifyStart.value) return false;
      onVerifyFailed();
    };

    const { initEvent } = useMouseEvent(onBlockMove, onBlockTouchLeave);

    onMounted(() => {
      onDomInit();
      onImageInit();
      initEvent();
    });

    return {
      container,
      slide,
      verifying,
      verifyStart,
      verifySuccess,
      verifyFailed,
      verifyProgressWidth,
      verifyImageLoaded,
      verifyUse,
      showVerifyBarText,
      blockLeftValue,
      onBlockTouch,
      onBlockMove,
      onBlockTouchLeave,
      onBlockOutside,
      handleRefresh
    };
  }
});

export default TouchVerifyCode;
</script>

<style lang="less" scoped>
.verify-code-wrap {
  position: relative;
  font-size: 0;

  .verify-canvas-container {
    position: relative;
    border-radius: 4px;
    overflow: hidden;

    .verify-refresh {
      position: absolute;
      right: 5px;
      top: 5px;
      width: 30px;
      height: 30px;
      z-index: 99;

      i {
        font-size: 24px;
        color: #fff;
      }

      &__progress {
        i {
          animation: rotate 1s linear infinite;
        }
      }
    }

    .verify-time {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 35px;
      line-height: 35px;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      color: #fff;
      background: #52ccba;
    }

    .verify-loading-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      z-index: 999;
      color: #666;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .verify-slide-block {
    position: absolute;
    left: 0;
    top: 0;
  }

  .touch-verify-bar {
    margin-top: 10px;
    position: relative;
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: #45494c;
    box-sizing: border-box;
    border: 1px solid #e4e7eb;
    border-radius: 2px;
    background: #f7f9fa;
    text-align: center;

    .touch-verify-slide-bar {
      position: absolute;
      left: 0;
      top: 0;
      height: 50px;
      box-sizing: border-box;
      border: 0 solid #1991fa;
      background: #d1e9fe;
    }

    .touch-verify-slide-block {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 48px;
      height: 48px;
      background: #fff;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
      transition: background 0.2s linear;
      cursor: pointer;
      z-index: 99;

      display: flex;
      justify-content: center;
      align-items: center;

      i {
        font-size: 24px;
        font-weight: bold;
      }

      &:hover {
        background: #1991fa;

        i {
          color: #fff;
        }
      }
    }

    &__failed {
      .touch-verify-slide-block {
        top: -1px;
        border: 1px solid #f57a7a;
        background: #f57a7a;

        &:hover {
          background: #f57a7a;
        }

        i {
          color: #fff;
        }
      }

      .touch-verify-slide-bar {
        border-width: 1px;
        border-color: #f57a7a;
        background: #fce1e1;
      }
    }

    &__success {
      .touch-verify-slide-block {
        background: #52ccba;

        &:hover {
          background: #52ccba;
        }
      }

      .touch-verify-slide-bar {
        border-color: #52ccba;
        background: #d2f4ef;
      }
    }

    &__progress {
      .touch-verify-slide-block {
        background: #1991fa;
      }
    }

    p {
      user-select: none;
      margin: 0;
      line-height: 50px;
      font-size: 14px;
      color: #666;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-active {
  opacity: 0;
}

.slide-leave-active,
.slide-enter-active {
  transition: all 0.5s;
}

.slide-enter-from {
  transform: translateY(100%);
}

.slide-leave-to {
  transform: translateY(0%);
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
