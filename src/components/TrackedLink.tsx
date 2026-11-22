"use client";

import type { AnchorHTMLAttributes } from "react";
import { githubRepo, track, type TrackEvent, type TrackParams } from "@/lib/track";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "onClick" | "onAuxClick"> & {
  href: string;
  /** 不传时：去 github.com/zhuyansen 的链接自动记 github_click（参数 repo），别的链接不记 */
  event?: TrackEvent;
  params?: TrackParams;
};

/**
 * 服务端组件里要记点击的链接：渲染成普通 <a>，点击时发 track()，不拦跳转。
 * 页面本身还是服务端组件，只有这个链接在浏览器端带点击处理。
 */
export default function TrackedLink({ event, params, ...props }: Props) {
  const repo = githubRepo(props.href);
  const name = event ?? (repo ? "github_click" : undefined);
  const send = () => {
    if (name) track(name, name === "github_click" && repo ? { repo, ...params } : params);
  };
  return (
    <a
      {...props}
      onClick={send}
      // 中键点开新标签只触发 auxclick，不触发 click
      onAuxClick={(e) => {
        if (e.button === 1) send();
      }}
    />
  );
}
