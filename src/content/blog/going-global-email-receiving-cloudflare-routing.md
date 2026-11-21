---
title: "出海产品收邮件：用Cloudflare Email Routing免费搞定"
date: "2026-04-10"
category: "出海"
tags: ["出海", "邮件", "Cloudflare", "Email Routing", "Resend", "收件"]
excerpt: "用Resend解决了发件，但收件怎么办？Cloudflare Email Routing免费搞定出海产品的收件问题。"
---

做出海产品的应该都遇到过这个问题：网站上写了个 support@yourdomain.com，但用户真发邮件过来，**你收不到**。

因为大部分人用 Resend 只解决了发件（验证码、通知、Newsletter），但收件这块一直没搞。

## 解决方案：Cloudflare Email Routing

其实 Cloudflare 有个免费功能叫 **Email Routing**，专门干这个事。

### 配置步骤

1. 在 Cloudflare Dashboard 中找到 Email Routing
2. 添加你的自定义域名邮箱地址（如 support@yourdomain.com）
3. 设置转发目标（你的个人 Gmail 或其他邮箱）
4. 验证转发目标邮箱
5. 完成 DNS 记录配置

配置完成后，发到 support@yourdomain.com 的邮件会自动转发到你的个人邮箱，完全免费。

### 发件 + 收件完整方案

- **发件**：Resend（注册验证、通知、Newsletter）
- **收件**：Cloudflare Email Routing（客服邮件、用户反馈）

这样你就有了一套完整的出海产品邮件解决方案，成本为零。

---

**撰稿人**: [sitin](https://x.com/sitinme) | [原文链接](https://x.com/sitinme/status/2042492524720517127)
