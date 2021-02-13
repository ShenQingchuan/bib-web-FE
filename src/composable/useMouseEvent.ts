import { onUnmounted } from "vue";

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IMouseEvent {
  (event: MouseEvent): void;
}

const useMouseEvent = (move: IMouseEvent, leave: IMouseEvent) => {
  const initEvent = () => {
    document.addEventListener("mousemove", move, false);
    document.addEventListener("mouseup", leave, false);
  };

  onUnmounted(() => {
    document.removeEventListener("mousemove", move, false);
    document.removeEventListener("mouseup", leave, false);
  });

  return { initEvent };
};

export default useMouseEvent;
