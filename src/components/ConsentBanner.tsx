"use client";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { setConsent, storedConsent } from "@/lib/consent";

function inEurope(): boolean {
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    return (
      z.startsWith("Europe/") ||
      z === "Atlantic/Reykjavik" ||
      z === "Atlantic/Canary" ||
      z === "Atlantic/Madeira" ||
      z === "Atlantic/Azores" ||
      z === "Atlantic/Faroe"
    );
  } catch {
    return false;
  }
}

const subscribeNoop = () => () => {};
const getNeedsConsent = () => !storedConsent() && inEurope();
const getServerNeedsConsent = () => false;

export default function ConsentBanner() {
  const needsConsent = useSyncExternalStore(subscribeNoop, getNeedsConsent, getServerNeedsConsent);
  const [dismissed, setDismissed] = useState(false);
  const zh = (usePathname() || "").startsWith("/zh");

  if (!needsConsent || dismissed) return null;
  const choose = (granted: boolean) => {
    setConsent(granted);
    setDismissed(true);
  };

  return (
    <div role="dialog" aria-label={zh ? "统计 Cookie" : "Analytics cookies"} className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:items-center">
        <p className="flex-1">
          {zh
            ? "本站用 Google Analytics、PostHog 和 Microsoft Clarity（含匿名操作录屏）了解访问情况，需要你同意才写入统计 Cookie 或本地标识。拒绝也能正常浏览。"
            : "This site uses Google Analytics, PostHog and Microsoft Clarity (including session replays) to understand visits. Analytics identifiers are stored only if you agree. Declining doesn't affect browsing."}{" "}
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
