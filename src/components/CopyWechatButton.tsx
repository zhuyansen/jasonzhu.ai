"use client";

import { useState } from "react";

interface Props {
  wechatId: string;
  isZh: boolean;
}

export default function CopyWechatButton({ wechatId, isZh }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wechatId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
      title={isZh ? "点击复制微信号" : "Click to copy WeChat ID"}
    >
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05a6.127 6.127 0 01-.253-1.736c0-3.74 3.568-6.768 7.964-6.768.308 0 .608.019.908.044C17.701 4.648 13.558 2.188 8.691 2.188zm-2.15 4.03a1.12 1.12 0 110 2.24 1.12 1.12 0 010-2.24zm4.918 0a1.12 1.12 0 110 2.24 1.12 1.12 0 010-2.24zM16.213 8.78c-3.857 0-6.987 2.68-6.987 5.986 0 3.306 3.13 5.986 6.987 5.986.778 0 1.527-.118 2.228-.33a.716.716 0 01.592.08l1.486.872a.27.27 0 00.138.045c.133 0 .24-.108.24-.243 0-.06-.024-.118-.04-.176l-.305-1.158a.488.488 0 01.177-.55C22.337 18.147 23.2 16.48 23.2 14.766c0-3.306-3.13-5.986-6.987-5.986z" />
      </svg>
      {copied
        ? (isZh ? "✓ 已复制" : "✓ Copied")
        : (isZh ? `微信 ${wechatId}` : `WeChat: ${wechatId}`)}
    </button>
  );
}
