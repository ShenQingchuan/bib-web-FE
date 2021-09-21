export function getIframeSrc(html: string): string {
  const d = document.createElement("div");
  d.innerHTML = html;
  // d 元素中将有唯一子节点
  const src = (d.firstElementChild as HTMLIFrameElement)!.src;

  return src;
}
