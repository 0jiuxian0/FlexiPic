/** 生成随机十六进制颜色，范围 #000000–#ffffff */
export function randomHexColor(): string {
  const value = Math.floor(Math.random() * 0xffffff);
  // padStart 保证始终输出 6 位，避免 #abc 这类短格式
  return `#${value.toString(16).padStart(6, '0')}`;
}

/** 生成随机双色线性渐变参数，角度均匀分布在 0–359° */
export function randomGradient(): { colors: [string, string]; angle: number } {
  return {
    colors: [randomHexColor(), randomHexColor()],
    angle: Math.floor(Math.random() * 360),
  };
}

/** 校验是否为合法的 6 位十六进制颜色（必须带 # 前缀） */
export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

/**
 * 规范化十六进制输入：支持带/不带 #，统一为小写 #rrggbb。
 * 无法识别时返回空字符串，由调用方决定是否回退到上次有效值。
 */
export function normalizeHex(hex: string): string {
  const trimmed = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  return '';
}

/** 将 #rrggbb 转为 RGB 分量 */
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/** W3C 相对亮度公式，返回 0–1 */
function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** 根据背景色亮度选择对比文字色（黑或白） */
export function computeTextColor(bgColor: string): string {
  const [r, g, b] = hexToRgb(bgColor);
  return relativeLuminance(r, g, b) > 0.179 ? '#000000' : '#ffffff';
}

/** 完全反色：每个通道取 255 的补值 */
export function computeInverseColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const toHex = (n: number) => (255 - n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** 两个颜色的线性平均 RGB */
export function averageColor(c1: string, c2: string): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex((r1 + r2) / 2)}${toHex((g1 + g2) / 2)}${toHex((b1 + b2) / 2)}`;
}
