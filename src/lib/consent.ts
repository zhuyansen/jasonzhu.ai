// 统计同意：欧洲经济区、英国、瑞士的访客要先同意，GA4 和 Clarity 才写 Cookie。
// GA4 用 Google 自己按 IP 判断的地区（REGIONS）；Clarity 和横幅没有 IP，用浏览器时区判断。
// 选择存在 localStorage 的 CONSENT_KEY 里："granted" 或 "denied"。

export const CONSENT_KEY = "analytics-consent";

// 欧洲经济区 + 英国 + 瑞士（ISO 3166-1 alpha-2）
export const REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT",
  "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
];

// 浏览器里跑的判断，原样拼进内联脚本，所以写成字符串
export const IN_EUROPE_JS =
  "(function(){try{var z=Intl.DateTimeFormat().resolvedOptions().timeZone||'';return z.indexOf('Europe/')===0||z==='Atlantic/Reykjavik'||z==='Atlantic/Canary'||z==='Atlantic/Madeira'||z==='Atlantic/Azores'||z==='Atlantic/Faroe'}catch(e){return false}})()";

export function storedConsent(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setConsent(granted: boolean) {
  const v = granted ? "granted" : "denied";
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* 隐私模式写不进去也照常工作，只是下次还会问 */
  }
  try {
    window.gtag?.("consent", "update", { analytics_storage: v });
    window.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: v });
  } catch {
    /* 统计失败不能影响页面 */
  }
}
