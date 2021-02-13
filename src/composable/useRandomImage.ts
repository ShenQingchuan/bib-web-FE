export const createRandomRange = (start: number, end: number) => {
  return Math.round(Math.random() * (end - start) + start);
};

export const calculate = (x: number, y: number) => x + y;

export const square = (x: number) => Math.pow(x, 2);

// 获取随机图片
const createRandomImageOnline = (width: number, height: number) => {
  return `https://picsum.photos/${width}/${height}/?image=${createRandomRange(
    0,
    1024
  )}`;
};

const useImage = (width: number, height: number) => {
  const onImageCreate = (
    load: ((this: GlobalEventHandlers, ev: Event) => unknown) | null
  ) => {
    const image = document.createElement("img");
    image.crossOrigin = "Anonymous";
    image.onload = load;
    image.onerror = () => (image.src = createRandomImageOnline(width, height));
    image.src = createRandomImageOnline(width, height);
    return image;
  };

  return { onImageCreate, createRandomImageOnline };
};

export default useImage;
