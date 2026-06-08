/** 支持的语言标识，与 messages 顶层键一一对应 */
export type Lang = 'zh' | 'en';

/** 中英文文案表；HTML 中通过 data-i18n 属性键名关联 */
const messages: Record<Lang, Record<string, string>> = {
  zh: {
    dimensions: '尺寸',
    width: '宽度',
    height: '高度',
    background: '背景',
    bgSolid: '纯色',
    bgGradient: '渐变',
    gradientStart: '起始色',
    gradientEnd: '结束色',
    gradientAngle: '角度',
    currentRatio: '当前比例',
    random: '随机',
    randomColor: '随机色',
    randomGradient: '随机渐变色',
    text: '文字',
    textColor: '文字颜色',
    inverseColorMode: '完全反色模式',
    fontSize: '字号',
    auto: '自动',
    textContent: '文字内容',
    format: '格式',
    quality: '质量',
    download: '生成并下载',
    preview: '预览',
    webpFallback: '当前浏览器不支持 WebP，已回退为 PNG。',
  },
  en: {
    dimensions: 'Dimensions',
    width: 'Width',
    height: 'Height',
    background: 'Background',
    bgSolid: 'Solid',
    bgGradient: 'Gradient',
    gradientStart: 'Start Color',
    gradientEnd: 'End Color',
    gradientAngle: 'Angle',
    currentRatio: 'Current Ratio',
    random: 'Random',
    randomColor: 'Random Color',
    randomGradient: 'Random Gradient',
    text: 'Text',
    textColor: 'Text Color',
    inverseColorMode: 'Full Inverse Color',
    fontSize: 'Font Size',
    auto: 'Auto',
    textContent: 'Text Content',
    format: 'Format',
    quality: 'Quality',
    download: 'Generate & Download',
    preview: 'Preview',
    webpFallback: 'WebP is not supported in this browser. Falling back to PNG.',
  },
};

// 默认中文；由 setLang 在切换时更新，供 t() 与外部读取
let currentLang: Lang = 'zh';

/** 返回当前激活语言，供导出回退提示等需要区分语言的逻辑使用 */
export function getLang(): Lang {
  return currentLang;
}

/** 切换语言并批量更新所有带 data-i18n 标记的 DOM 节点文本 */
export function setLang(lang: Lang): void {
  currentLang = lang;
  // 同步 <html lang>，便于浏览器与辅助技术识别页面语言
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    // 键缺失或目标语言无对应翻译时跳过，保留节点原有文本
    if (key && messages[lang][key]) {
      el.textContent = messages[lang][key];
    }
  });
}

/** 按当前语言取文案；键不存在时原样返回 key，避免运行时崩溃 */
export function t(key: string): string {
  // 用于 alert 等 JS 动态文案；未定义键时回退为 key 本身，便于开发期发现遗漏
  return messages[currentLang][key] ?? key;
}
