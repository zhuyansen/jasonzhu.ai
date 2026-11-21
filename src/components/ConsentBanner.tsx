"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { setConsent, storedConsent } from "@/lib/consent";

// 只对时区在欧洲的访客显示；选过一次就不再出现。
function inEurope() {
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return z.startsWith("Europe/") || ["Atlantic/Reykjavik", "Atlantic/Canary", "Atlantic/Madeira", "Atlantic/Azores", "Atlantic/Faroe"].includes(z);
  } catch {
    return false;
  }
}

export default function ConsentBanner() {
  const [show, setShow] = useState(false);
  const zh = (usePathname() || "").startsWith("/zh");

  useEffect(() => {
    if (!storedConsent() && inEurope()) setShow(true);
  }, []);

  if (!show) return null;
  const choose = (granted: boolean) => {
    setConsent(granted);
    setShow(false);
  };

  return (
    <div role="dialog" aria-label={zh ? "统计 Cookie" : "Analytics cookies"} className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:items-center">
        <p className="flex-1">
          {zh
            ? "本站用 Google Analytics 和 Microsoft Clarity（含匿名操作录屏）了解访问情况，需要你同意才写入统计 Cookie。拒绝也能正常浏览。"
            : "This site uses Google Analytics and Microsoft Clarity (including session replays) to understand visits. They set analytics cookies only if you agree. Declining doesn't affect browsing."}{" "}
          <a href={zh ? "/zh/privacy" : "/en/privacy"} className="text-blue-600 underline">
            {zh ? "隐私政策" : "Privacy policy"}
          </a>
        </p>
        <div className="flex gap-2">
          <button onClick={() => choose(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium hover:bg-gray-50">
            {zh ? "拒绝" : "Decline"}
          </button>
          <button onClick={() => choose(true)} className="rounded-lg bg-gray-900 px-3 py-1.5 font-medium text-white hover:bg-gray-700">
            {zh ? "同意" : "Accept"}
          </button>
        </div>
      </div>
    </div>
  );
}
