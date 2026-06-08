import { averageColor, computeInverseColor, computeTextColor, isValidHex, normalizeHex, randomGradient, randomHexColor } from './colors';
import { exportCanvas } from './exporter';
import { setLang, t, type Lang } from './i18n';
import { renderCanvas } from './renderer';
import { createDefaultState, defaultText, type AppState } from './state';

const state = createDefaultState();
// 用户手动编辑文字后，尺寸变更不再自动覆盖文字内容
let textManuallyEdited = false;
// 用户手动改文字色后，背景切换不再自动覆盖文字色
let textColorManuallyEdited = false;

const canvas = document.getElementById('preview-canvas') as HTMLCanvasElement;
const widthInput = document.getElementById('width') as HTMLInputElement;
const heightInput = document.getElementById('height') as HTMLInputElement;
const ratioDisplay = document.getElementById('ratio-display') as HTMLParagraphElement;
const solidBgPanel = document.getElementById('solid-bg-panel') as HTMLDivElement;
const gradientBgPanel = document.getElementById('gradient-bg-panel') as HTMLDivElement;
const bgTypeInputs = document.querySelectorAll<HTMLInputElement>('input[name="bg-type"]');
const bgColorInput = document.getElementById('bg-color') as HTMLInputElement;
const bgHexInput = document.getElementById('bg-hex') as HTMLInputElement;
const gradColor1 = document.getElementById('grad-color-1') as HTMLInputElement;
const gradHex1 = document.getElementById('grad-hex-1') as HTMLInputElement;
const gradColor2 = document.getElementById('grad-color-2') as HTMLInputElement;
const gradHex2 = document.getElementById('grad-hex-2') as HTMLInputElement;
const gradAngle = document.getElementById('grad-angle') as HTMLInputElement;
const gradAngleValue = document.getElementById('grad-angle-value') as HTMLSpanElement;
const gradientPreview = document.getElementById('gradient-preview') as HTMLDivElement;
const textColorInput = document.getElementById('text-color') as HTMLInputElement;
const textHexInput = document.getElementById('text-hex') as HTMLInputElement;
const textInput = document.getElementById('text-input') as HTMLTextAreaElement;
const qualityRow = document.getElementById('quality-row') as HTMLLabelElement;
const qualityInput = document.getElementById('quality') as HTMLInputElement;
const qualityValue = document.getElementById('quality-value') as HTMLSpanElement;
const previewInfo = document.getElementById('preview-info') as HTMLParagraphElement;
const downloadBtn = document.getElementById('btn-download') as HTMLButtonElement;
const textInverseMode = document.getElementById('text-inverse-mode') as HTMLInputElement;
const fontSizeInput = document.getElementById('font-size') as HTMLInputElement;
const fontSizeValue = document.getElementById('font-size-value') as HTMLSpanElement;
const fontSizeAuto = document.getElementById('font-size-auto') as HTMLInputElement;
const formatInputs = document.querySelectorAll<HTMLInputElement>('input[name="format"]');
const presetButtons = document.querySelectorAll<HTMLButtonElement>('.preset-btn');
const ratioButtons = document.querySelectorAll<HTMLButtonElement>('.ratio-btn');
const langZh = document.getElementById('lang-zh') as HTMLButtonElement;
const langEn = document.getElementById('lang-en') as HTMLButtonElement;

// ── 尺寸工具 ──────────────────────────────────────────────

/** 将尺寸限制在 1–10000 范围内并取整 */
function clampDimension(value: number): number {
  return Math.min(10000, Math.max(1, Math.round(value)));
}

/** 校验宽高输入是否合法 */
function isDimensionValid(): boolean {
  const width = Number(widthInput.value);
  const height = Number(heightInput.value);
  return Number.isFinite(width) && Number.isFinite(height) && width >= 1 && width <= 10000 && height >= 1 && height <= 10000;
}

/** 最大公约数 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** 计算最简整数比标签 */
function computeRatioLabel(w: number, h: number): string {
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

/** 更新比例显示与高亮比例按钮 */
function updateRatioDisplay(): void {
  if (!isDimensionValid()) {
    ratioDisplay.textContent = '';
    ratioButtons.forEach((btn) => btn.classList.remove('active'));
    return;
  }
  const label = computeRatioLabel(state.width, state.height);
  ratioDisplay.textContent = label;
  // 高亮匹配的比例按钮
  ratioButtons.forEach((btn) => {
    const rw = Number(btn.dataset.rw);
    const rh = Number(btn.dataset.rh);
    const btnLabel = computeRatioLabel(rw, rh);
    btn.classList.toggle('active', btnLabel === label);
  });
}

// ── 渐变 / 纯色 UI 同步 ──────────────────────────────────

function updateGradientPreview(colors: [string, string], angle: number): void {
  gradientPreview.style.background = `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
}

/** 同步渐变控件与预览条到 state */
function syncGradientInputs(colors: [string, string], angle: number): void {
  gradColor1.value = colors[0];
  gradHex1.value = colors[0];
  gradColor2.value = colors[1];
  gradHex2.value = colors[1];
  gradAngle.value = String(angle);
  gradAngleValue.textContent = `${angle}°`;
  updateGradientPreview(colors, angle);
}

/** 根据背景类型切换纯色/渐变面板显示 */
function syncBackgroundModeUI(): void {
  const isGradient = state.background.type === 'gradient';
  solidBgPanel.hidden = isGradient;
  gradientBgPanel.hidden = !isGradient;

  const selectedType = document.querySelector<HTMLInputElement>(
    `input[name="bg-type"][value="${isGradient ? 'gradient' : 'solid'}"]`,
  );
  if (selectedType) selectedType.checked = true;

  if (state.background.type === 'gradient') {
    syncGradientInputs(state.background.colors, state.background.angle);
  } else {
    bgColorInput.value = state.background.color;
    bgHexInput.value = state.background.color;
  }
}

/** 根据画布尺寸计算自动字号，用于 slider 提示 */
function autoFontSize(): number {
  const base = Math.round(Math.min(state.width, state.height) / 4);
  const lineCount = state.text.split('\n').length || 1;
  return Math.round(base / lineCount);
}

/** 同步字号 UI 控件到 state */
function syncFontSizeUI(): void {
  const isAuto = state.fontSize === 0;
  fontSizeAuto.checked = isAuto;
  fontSizeInput.disabled = isAuto;
  fontSizeValue.textContent = isAuto ? `${autoFontSize()} (${t('auto')})` : String(state.fontSize);
  if (isAuto) {
    fontSizeInput.value = String(autoFontSize());
  } else {
    fontSizeInput.value = String(state.fontSize);
  }
}

/** 获取当前背景的参考色（纯色取自身，渐变取平均色） */
function getBackgroundRefColor(): string {
  return state.background.type === 'solid'
    ? state.background.color
    : averageColor(state.background.colors[0], state.background.colors[1]);
}

/** 根据背景色自动计算对比文字色并同步到 UI */
function updateTextColorFromBackground(): void {
  if (textColorManuallyEdited) return;
  const bgColor = getBackgroundRefColor();
  const color = textInverseMode.checked ? computeInverseColor(bgColor) : computeTextColor(bgColor);
  state.textColor = color;
  textColorInput.value = color;
  textHexInput.value = color;
}

/** 设置渐变背景并切换到渐变模式 */
function setGradientBackground(colors: [string, string], angle: number): void {
  state.background = { type: 'gradient', colors, angle };
  textColorManuallyEdited = false;
  syncBackgroundModeUI();
  updateTextColorFromBackground();
}

/** 设置纯色背景并切换到纯色模式 */
function setSolidBackground(color: string): void {
  state.background = { type: 'solid', color };
  textColorManuallyEdited = false;
  syncBackgroundModeUI();
  updateTextColorFromBackground();
}

// ── 预览 / 下载 ──────────────────────────────────────────

function updatePreviewInfo(): void {
  previewInfo.textContent = `${state.width} × ${state.height}`;
}

function updateDownloadButton(): void {
  downloadBtn.disabled = !isDimensionValid();
}

/** 重绘预览并同步底部尺寸信息与下载按钮状态 */
function renderPreview(): void {
  renderCanvas(canvas, state);
  updatePreviewInfo();
  updateDownloadButton();
  updateRatioDisplay();
  syncFontSizeUI();
}

/** 应用新尺寸；未手动编辑文字时同步更新默认文案 */
function applyDimensions(width: number, height: number): void {
  state.width = clampDimension(width);
  state.height = clampDimension(height);
  widthInput.value = String(state.width);
  heightInput.value = String(state.height);

  updateDefaultTextIfNeeded();
  renderPreview();
}

/** 未手动编辑文字时，按当前尺寸与格式同步默认文案 */
function updateDefaultTextIfNeeded(): void {
  if (!textManuallyEdited) {
    state.text = defaultText(state.width, state.height, state.format);
    textInput.value = state.text;
  }
}

/** 绑定取色器与十六进制输入的双向同步 */
function bindColorPair(
  colorInput: HTMLInputElement,
  hexInput: HTMLInputElement,
  onChange: (color: string) => void,
): void {
  colorInput.addEventListener('input', () => {
    hexInput.value = colorInput.value;
    onChange(colorInput.value);
  });

  hexInput.addEventListener('input', () => {
    const normalized = normalizeHex(hexInput.value);
    if (isValidHex(normalized)) {
      colorInput.value = normalized;
      onChange(normalized);
    }
  });

  hexInput.addEventListener('blur', () => {
    const normalized = normalizeHex(hexInput.value);
    if (isValidHex(normalized)) {
      colorInput.value = normalized;
      onChange(normalized);
    } else {
      hexInput.value = colorInput.value;
    }
  });
}

/** 从表单控件读取最新值写入 state，供下载前做一次最终同步 */
function syncStateFromForm(): void {
  if (isDimensionValid()) {
    state.width = clampDimension(Number(widthInput.value));
    state.height = clampDimension(Number(heightInput.value));
  }

  state.text = textInput.value;
  state.textColor = textColorInput.value;
  state.quality = Number(qualityInput.value);

  const selectedFormat = document.querySelector<HTMLInputElement>('input[name="format"]:checked');
  if (selectedFormat) {
    state.format = selectedFormat.value as AppState['format'];
  }

  if (state.background.type === 'gradient') {
    state.background.angle = Number(gradAngle.value);
  }
}

// ── 事件绑定 ──────────────────────────────────────────────

widthInput.addEventListener('input', () => {
  if (!isDimensionValid()) {
    updateDownloadButton();
    updateRatioDisplay();
    return;
  }
  syncStateFromForm();
  updateDefaultTextIfNeeded();
  renderPreview();
});

heightInput.addEventListener('input', () => {
  if (!isDimensionValid()) {
    updateDownloadButton();
    updateRatioDisplay();
    return;
  }
  syncStateFromForm();
  updateDefaultTextIfNeeded();
  renderPreview();
});

/** 宽高对调按钮 */
document.getElementById('btn-swap')!.addEventListener('click', () => {
  if (!isDimensionValid()) return;
  applyDimensions(state.height, state.width);
});

presetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    applyDimensions(Number(btn.dataset.w), Number(btn.dataset.h));
  });
});

/** 比例按钮：以宽度为基准自动计算高度 */
ratioButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const rw = Number(btn.dataset.rw);
    const rh = Number(btn.dataset.rh);
    if (isDimensionValid()) {
      applyDimensions(state.width, Math.round(state.width * rh / rw));
    }
  });
});

bgTypeInputs.forEach((input) => {
  input.addEventListener('change', () => {
    if (input.value === 'solid' && state.background.type !== 'solid') {
      const color = state.background.type === 'gradient' ? state.background.colors[0] : '#4a90d9';
      setSolidBackground(color);
    } else if (input.value === 'gradient' && state.background.type !== 'gradient') {
      const color = state.background.type === 'solid' ? state.background.color : '#4a90d9';
      setGradientBackground([color, '#9b59b6'], 135);
    }
    renderPreview();
  });
});

bindColorPair(bgColorInput, bgHexInput, (color) => {
  setSolidBackground(color);
  renderPreview();
});

bindColorPair(gradColor1, gradHex1, (color) => {
  if (state.background.type !== 'gradient') {
    setGradientBackground([color, gradColor2.value], Number(gradAngle.value));
  } else {
    state.background.colors[0] = color;
    updateGradientPreview(state.background.colors, state.background.angle);
    updateTextColorFromBackground();
  }
  renderPreview();
});

bindColorPair(gradColor2, gradHex2, (color) => {
  if (state.background.type !== 'gradient') {
    setGradientBackground([gradColor1.value, color], Number(gradAngle.value));
  } else {
    state.background.colors[1] = color;
    updateGradientPreview(state.background.colors, state.background.angle);
    updateTextColorFromBackground();
  }
  renderPreview();
});

gradAngle.addEventListener('input', () => {
  const angle = Number(gradAngle.value);
  gradAngleValue.textContent = `${angle}°`;
  if (state.background.type === 'gradient') {
    state.background.angle = angle;
    updateGradientPreview(state.background.colors, angle);
    renderPreview();
  }
});

/** 字号滑块：手动模式下实时调整 */
fontSizeInput.addEventListener('input', () => {
  if (state.fontSize === 0) return; // 自动模式下忽略滑块
  state.fontSize = Number(fontSizeInput.value);
  fontSizeValue.textContent = String(state.fontSize);
  renderPreview();
});

/** 自动字号勾选框 */
fontSizeAuto.addEventListener('change', () => {
  state.fontSize = fontSizeAuto.checked ? 0 : autoFontSize();
  syncFontSizeUI();
  renderPreview();
});

/** 反色模式勾选框：切换黑白/完全反色，重新计算文字色 */
textInverseMode.addEventListener('change', () => {
  textColorManuallyEdited = false;
  updateTextColorFromBackground();
  renderPreview();
});

/** 合并后的随机按钮：按当前背景模式生成随机色或随机渐变 */
document.getElementById('btn-random')!.addEventListener('click', () => {
  if (state.background.type === 'solid') {
    setSolidBackground(randomHexColor());
  } else {
    const { colors, angle } = randomGradient();
    setGradientBackground(colors, angle);
  }
  renderPreview();
});

textColorInput.addEventListener('input', () => {
  textColorManuallyEdited = true;
  state.textColor = textColorInput.value;
  textHexInput.value = textColorInput.value;
  renderPreview();
});

textHexInput.addEventListener('input', () => {
  const normalized = normalizeHex(textHexInput.value);
  if (isValidHex(normalized)) {
    textColorManuallyEdited = true;
    state.textColor = normalized;
    textColorInput.value = normalized;
    renderPreview();
  }
});

textHexInput.addEventListener('blur', () => {
  const normalized = normalizeHex(textHexInput.value);
  if (isValidHex(normalized)) {
    textColorManuallyEdited = true;
    state.textColor = normalized;
    textColorInput.value = normalized;
  } else {
    textHexInput.value = state.textColor;
  }
  renderPreview();
});

textInput.addEventListener('input', () => {
  textManuallyEdited = true;
  state.text = textInput.value;
  renderPreview();
});

formatInputs.forEach((input) => {
  input.addEventListener('change', () => {
    state.format = input.value as AppState['format'];
    const showQuality = state.format !== 'png';
    qualityRow.hidden = !showQuality;
    updateDefaultTextIfNeeded();
    renderPreview();
  });
});

qualityInput.addEventListener('input', () => {
  state.quality = Number(qualityInput.value);
  qualityValue.textContent = state.quality.toFixed(2);
});

downloadBtn.addEventListener('click', () => {
  syncStateFromForm();
  if (!isDimensionValid()) return;
  renderPreview();
  exportCanvas(canvas, state, () => {
    alert(t('webpFallback'));
  });
});

function switchLang(lang: Lang): void {
  setLang(lang);
  langZh.classList.toggle('active', lang === 'zh');
  langEn.classList.toggle('active', lang === 'en');
}

langZh.addEventListener('click', () => switchLang('zh'));
langEn.addEventListener('click', () => switchLang('en'));

setLang('zh');
syncBackgroundModeUI();
updateTextColorFromBackground();
syncFontSizeUI();
renderPreview();
