import Script from "next/script";
import { CLARITY_ID, GA_ID } from "@/lib/track";
import { CONSENT_KEY, IN_EUROPE_JS, REGIONS } from "@/lib/consent";
import ConsentBanner from "@/components/ConsentBanner";

// 服务端组件，只输出 <Script>，不影响全站静态渲染。
// Script 的 id 不能叫 clarity / gtag：带 id 的元素会挂到 window 上，window.clarity 变成 <script> 元素，Clarity 初始化直接跳过。
// GA 国内不翻墙加载不了，总量以 Vercel Analytics 为准，GA 看来源和转化。
// 同意：欧洲经济区、英国、瑞士默认不写统计 Cookie，访客点同意后才写（src/lib/consent.ts）。本站不投广告，广告类一律 denied。
const stored = `(function(){try{return localStorage.getItem('${CONSENT_KEY}')}catch(e){return null}})()`;

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
              `gtag('js',new Date());gtag('config','${GA_ID}');`}
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
