import Script from "next/script";
import { CLARITY_ID, GA_ID, POSTHOG_HOST, POSTHOG_KEY } from "@/lib/track";
import { CONSENT_KEY, IN_EUROPE_JS, REGIONS } from "@/lib/consent";
import ConsentBanner from "@/components/ConsentBanner";

// 服务端组件，只输出 <Script>，不影响全站静态渲染。
// Script 的 id 不能叫 clarity / gtag / posthog：带 id 的元素会挂到 window 上，覆盖全局同名对象导致初始化跳过。
// GA 国内不翻墙加载不了，总量以 Vercel Analytics 为准，GA + PostHog（Cloudflare 反代直连）看来源、漏斗和转化。
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
  `var ft=b[0]+(b[1]?' … '+b[1]:'');` +
  `gtag('event','text_fragment',{fragment_text:ft.slice(0,100),fragment_ref:r||'(none)'});` +
  `if(window.posthog&&window.posthog.capture)window.posthog.capture('text_fragment',{fragment_text:ft.slice(0,500),fragment_ref:r||'(none)'});}}}}catch(e){}`;

const posthogBootstrap = POSTHOG_KEY
  ? `(function(){` +
    `var k=${JSON.stringify(POSTHOG_KEY)},h=${JSON.stringify(POSTHOG_HOST.replace(/\/+$/, ""))};` +
    `if(!k||!h||(window.posthog&&window.posthog.__loaded))return;` +
    `var aiHosts={'chatgpt.com':1,'chat.openai.com':1,'perplexity.ai':1,'gemini.google.com':1,'claude.ai':1,'doubao.com':1,'kimi.com':1,'kimi.moonshot.cn':1,'deepseek.com':1,'chat.deepseek.com':1,'copilot.microsoft.com':1,'yuanbao.tencent.com':1,'metaso.cn':1,'grok.com':1,'you.com':1,'phind.com':1,'poe.com':1};` +
    `function pt(p){var s=(p||'/').replace(/^\\/(zh|en)(?=\\/|$)/,'')||'/';if(s==='/')return 'home';if(s.indexOf('/blog/')===0||s==='/blog')return 'blog';if(s.indexOf('/news')===0)return 'news';if(s.indexOf('/prompts/claude-animation')===0)return 'prompts_animation';if(s.indexOf('/prompts/chatgpt-images-2-6')===0)return 'prompts_images';if(s.indexOf('/prompts/gemini-4')===0)return 'prompts_gemini';if(s.indexOf('/prompts/claude')===0||s.indexOf('/opus-prompts')===0)return 'prompts_claude';if(s.indexOf('/prompts')===0)return 'prompts_hub';if(s.indexOf('/club')===0)return 'club';if(s.indexOf('/handbook')===0||s.indexOf('/ai-learning-guide')===0)return 'lead_magnet';if(s.indexOf('/go-global')===0)return 'go_global';if(s.indexOf('/services')===0||s.indexOf('/contact')===0)return 'services';return 'other';}` +
    `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(/\\/+$/,"")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);` +
    `var cs=${stored};var noStore=cs==='denied'||(!cs&&${IN_EUROPE_JS});` +
    `window.posthog.init(k,{api_host:h,ui_host:'https://us.posthog.com',person_profiles:'identified_only',persistence:noStore?'memory':'localStorage',opt_out_capturing_by_default:cs==='denied',capture_pageview:'history_change',capture_pageleave:true,autocapture:true,loaded:function(ph){var sp=new URLSearchParams(window.location.search),rh='';if(document.referrer){try{var u=new URL(document.referrer);if(u.hostname!==window.location.hostname)rh=u.hostname.replace(/^www\\./,'').toLowerCase()}catch(e){}}var ai=aiHosts[rh]?rh:'';ph.register_once({entry_page_type:pt(window.location.pathname),entry_path:window.location.pathname,entry_source:sp.get('utm_source')||rh||'(direct)',entry_medium:sp.get('utm_medium')||(ai?'ai_referral':(rh?'referral':'(none)')),entry_ai_engine:ai});var pi=window.__phPendingIdentify;if(pi&&pi.id&&ph.identify)ph.identify(pi.id,pi.props);},before_send:function(ev){if(!ev)return ev;ev.properties=ev.properties||{};if(!ev.properties.page_type)ev.properties.page_type=pt(window.location.pathname);if(!ev.properties.lang)ev.properties.lang=document.documentElement.lang||'en';return ev;}});` +
    `})();`
  : "";

export default function ThirdPartyAnalytics() {
  return (
    <>
      {POSTHOG_KEY && (
        <Script id="ph-analytics-init" strategy="afterInteractive">
          {posthogBootstrap}
        </Script>
      )}
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
