import { randomGradient } from './colors';

/** 纯色背景 */
export type SolidBackground = {
  type: 'solid';
  color: string;
};

/** 线性渐变背景：双色 + 角度（0–360°） */
export type GradientBackground = {
  type: 'gradient';
  colors: [string, string];
  angle: number;
};

/** 背景联合类型，渲染时按 type 分支处理 */
export type Background = SolidBackground | GradientBackground;

export type ImageFormat = 'png' | 'jpeg' | 'webp';

/** 应用全局状态，与表单控件和 Canvas 渲染一一对应 */
export type AppState = {
  width: number;
  height: number;
  background: Background;
  textColor: string;
  text: string;
  fontSize: number; // 0 表示自动按画布比例计算
  format: ImageFormat;
  quality: number;
};

/** 导出格式对应的文件扩展名标签（jpeg 显示为 jpg） */
export function formatLabel(format: ImageFormat): string {
  const labels: Record<ImageFormat, string> = { png: 'png', jpeg: 'jpg', webp: 'webp' };
  return labels[format];
}

/** 根据宽高与格式生成默认居中文字，三行显示 */
export function defaultText(width: number, height: number, format: ImageFormat): string {
  return `${width}\n${height}\n${formatLabel(format)}`;
}

/** 创建初始状态；尺寸默认 1920×1080，背景为每次打开都不同的随机渐变 */
export function createDefaultState(): AppState {
  const width = 1920;
  const height = 1080;
  const { colors, angle } = randomGradient();
  return {
    width,
    height,
    background: { type: 'gradient', colors, angle },
    textColor: '#ffffff',
    text: defaultText(width, height, 'png'),
    fontSize: 0,
    format: 'png',
    quality: 0.92,
  };
}
