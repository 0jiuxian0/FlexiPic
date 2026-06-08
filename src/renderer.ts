import type { AppState, Background } from './state';

/**
 * 根据背景类型返回 Canvas 可用的填充样式。
 * 渐变时以画布中心为基准，沿 angle 方向贯穿对角线，确保渐变覆盖整个区域。
 */
function createBackgroundFill(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: Background,
): string | CanvasGradient {
  if (background.type === 'solid') {
    return background.color;
  }

  const radians = (background.angle * Math.PI) / 180;
  const centerX = width / 2;
  const centerY = height / 2;
  // 取对角线一半长度，使渐变线始终覆盖矩形四角
  const length = Math.hypot(width, height) / 2;

  const gradient = ctx.createLinearGradient(
    centerX - Math.cos(radians) * length,
    centerY - Math.sin(radians) * length,
    centerX + Math.cos(radians) * length,
    centerY + Math.sin(radians) * length,
  );
  gradient.addColorStop(0, background.colors[0]);
  gradient.addColorStop(1, background.colors[1]);
  return gradient;
}

/** 将当前状态绘制到 Canvas；先设真实像素尺寸，再绘制背景与居中文字 */
export function renderCanvas(canvas: HTMLCanvasElement, state: AppState): void {
  const { width, height, background, textColor, text } = state;
  // 重置 canvas 尺寸会清空内容，需在设置后重新绘制
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = createBackgroundFill(ctx, width, height, background);
  ctx.fillRect(0, 0, width, height);

  // 多行文字渲染：按换行符拆分，垂直居中绘制
  const lines = text.split('\n');
  const lineCount = lines.length;
  // 自动模式按短边比例计算并按行数均分；手动模式直接使用用户设定值
  const fontSize = state.fontSize > 0
    ? state.fontSize
    : Math.round(Math.min(width, height) / 4 / lineCount);
  const lineHeight = Math.round(fontSize * 1.2);
  const totalHeight = lineHeight * lineCount;
  const startY = (height - totalHeight) / 2 + lineHeight / 2;

  ctx.fillStyle = textColor;
  ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < lineCount; i++) {
    ctx.fillText(lines[i], width / 2, startY + i * lineHeight);
  }
}
