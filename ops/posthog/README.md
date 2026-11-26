# jasonzhu.ai PostHog Free Tier + Cloudflare Worker Reverse Proxy

对齐 `agentskillshub.top` 的反拦截第一方代理架构，且**不占用 Vercel 免费版 Edge Requests 额度**：
- 浏览器端走 `https://jasonzhu-posthog-proxy.m17551076169.workers.dev`（Cloudflare Worker 免费档 10 万次/天，自动剥离 Cookie 并透传 `CF-Connecting-IP` 做国家归因，URL 不含 `posthog` 字样防 uBlock / Brave 拦截，国内直连可达）。
- `person_profiles: "identified_only"`：匿名浏览按无画像事件计费，免费档 **100 万事件/月** 可承载数十万 PV。
- 严格对齐 `src/lib/consent.ts`：欧洲经济区 / 英国 / 瑞士访客未点同意前用 `persistence: "memory"`（零 Cookie、零 localStorage），点拒绝即 `opt_out_capturing()`；`src/lib/track.ts` 的 13 个业务事件自动同步上报 PostHog。

## 为什么建议新建第二个免费 Organization（1 分钟，零绑卡）
你当前的 PostHog 账号下 `GoSailGlobal LLC` 组织处于未绑卡免费档（单组织限 1 个项目 `746122`，已被 `agentskillshub.top` 使用，且那边日报 SQL 未加 `$host` 过滤）。
PostHog 允许**同一账号免费创建多个 Organization**，每个免费 Org 各自独享 **100 万事件/月 + 5,000 录屏/月**：

1. 打开 <https://us.posthog.com>，点左上角组织名 `GoSailGlobal LLC` → **New organization**（命名为 `JasonZhu.AI`）。
2. 进入新项目的 **Project Settings → General**，复制 `phc_...`（Project API Key）和数字 `Project ID`。
3. 填入 Vercel 环境变量（或在 `src/lib/track.ts` 填入公开的 `phc_...`）：
   ```bash
   vercel env add NEXT_PUBLIC_POSTHOG_KEY production
   ```
4. 如需本地 / GitHub Actions 跑 HogQL 日报（`ops/posthog/fetch_posthog.py`）：
   - Personal API Key（`phx_...`，`query:read` 权限）账号通用，可直接复用；
   - 存入 `ops/posthog/.api_key` 与 `ops/posthog/.project_id`（已 gitignore）或 GitHub Secrets `POSTHOG_API_KEY` / `POSTHOG_PROJECT_ID`。
