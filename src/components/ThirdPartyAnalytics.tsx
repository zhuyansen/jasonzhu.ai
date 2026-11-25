import Script from "next/script";
import { CLARITY_ID, GA_ID } from "@/lib/track";
import { CONSENT_KEY, IN_EUROPE_JS, REGIONS } from "@/lib/consent";
import ConsentBanner from "@/components/ConsentBanner";

// 服务端组件，只输出 <Script>，不影响全站静态渲染。
// Script 的 id 不能叫 clarity / gtag：带 id 的元素会挂到 window 上，window.clarity 变成 <script> 元素，Clarity 初始化直接跳过。
// GA 国内不翻墙加载不了，总量以 Vercel Analytics 为准，GA 看来源和转化。
// 同意：欧洲经济区、英国、瑞士默认不写统计 Cookie，访客点同意后才写（src/lib/consent.ts）。本站不投广告，广告类一律 denied。
const stored = `(function(){try{return localStorage.getItem('${CONSENT_KEY}')}catch(e){return null}})()`;

// AI 引用的原句（2026-11-24 起）：Gemini App、Google 搜索等的链接把要高亮的那句原文放在 #:~:text= 里（开头,结尾）。
// Chrome 会把它从 location.href / location.hash 里去掉，只有导航记录的 name 还留着，所以从那里读；一次页面加载只发一次。
// GA4 参数值最多 100 个字符，长句会被截断。要在报表里看到原句，GA4 后台得把 fragment_text、fragment_ref 注册成事件范围的自定义维度。
// 面板那一半（AI 引用本站时指向哪句话）在 ops/geo/fanout_actions.py 的第四张表。
const TEXT_FRAGMENT =
  `try{var n=performance.getEntriesByType('navigation')[0],u=(n&&n.name)||'',i=u.indexOf(':~:');` +
  `if(i>-1){var t=u.slice(i+3).split('&').filter(function(p){return p.indexOf('text=')===0})[0];` +
  `if(t){var b=t.slice(5).split(',').filter(function(x){return x&&x.slice(-1)!=='-'&&x.charAt(0)!=='-'})` +
  `.map(function(x){return decodeURIComponent(x).replace(/\\s+/g,' ').trim()});` +
  `if(b[0]){var r='';try{r=document.referrer?new URL(document.referrer).hostname:''}catch(e){}` +
  `gtag('event','text_fragment',{fragment_text:(b[0]+(b[1]?' … '+b[1]:'')).slice(0,100),fragment_ref:r||'(none)'})}}}}catch(e){}`;

export default function ThirdPartyAnalytics() {
  return (
    <>
      {GA_ID && (
        <>
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;` +
              `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});` +
              `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',region:${JSON.stringify(REGIONS)}});` +
              `var c=${stored};if(c)gtag('consent','update',{analytics_storage:c});` +
              `gtag('js',new Date());gtag('config','${GA_ID}');` +
              TEXT_FRAGMENT}
          </Script>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        </>
      )}
      {CLARITY_ID && (
        <Script id="ms-clarity-init" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");` +
            `var s=${stored};var v=s||(${IN_EUROPE_JS}?'denied':'granted');window.clarity('consentv2',{ad_Storage:'denied',analytics_Storage:v});`}
        </Script>
      )}
      <ConsentBanner />
    </>
  );
}
