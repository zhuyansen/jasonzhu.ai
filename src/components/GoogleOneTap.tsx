"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  prompt: () => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

/**
 * Google One Tap：读浏览器已有的 Google 登录态，免跳转弹窗一键登录。
 * 只在未登录、且当前页不是 dashboard/login/admin（避免和主动登录流程/后台冲突）时弹。
 */
export default function GoogleOneTap() {
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current || !GOOGLE_CLIENT_ID) return;
    if (/\/(dashboard|login|admin)(\/|$)/.test(window.location.pathname)) return;
    attempted.current = true;

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) return; // 已登录不弹

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async (response) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });
            if (!error) window.location.reload();
          },
        });
        window.google.accounts.id.prompt();
      };
      document.head.appendChild(script);
    });
  }, []);

  return null;
}
