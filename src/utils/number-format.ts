export const numberFormat = (value: number) => {
  const param = { value: "", unit: "" };
  const k = 10000,
    sizes = ["", "万", "亿", "万亿"];
  let i: number;

  if (value < k) {
    param.value = `${value}`;
    param.unit = "";
  } else {
    i = Math.floor(Math.log(value) / Math.log(k));
    param.value = (value / Math.pow(k, i)).toFixed(2);
    param.unit = sizes[i];
  }
  return `${param.value}${param.unit}`;
};
