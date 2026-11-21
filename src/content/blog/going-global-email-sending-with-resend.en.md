---
title: "Sending Emails for Global Products: Why You Should Use Resend Instead of Your Platform's Built-in SMTP"
excerpt: "Email is core infrastructure for any global product. Built-in platform SMTP has poor deliverability — use Resend instead to make sure your emails actually land."
---

Email is practically infrastructure for any product targeting a global audience. User registration verification, payment receipts, password resets, newsletters down the road — none of it works without reliable email.

Yet a lot of people start out with their platform's built-in SMTP (Supabase's free tier, for example), which honestly has **terrible deliverability** — especially with Gmail, where messages frequently never arrive at all.

## Recommended Solution: Resend

I recently switched to Resend and the experience has been refreshingly straightforward. The free tier gives you 3,000 emails per month, which is more than enough for an early-stage project.

### Key Steps

1. Sign up for a Resend account
2. Connect a custom domain
3. Configure DKIM/SPF records (takes about 10 minutes)
4. Integrate it into your project

Once DKIM and SPF are properly configured, deliverability improves dramatically — your emails stop ending up in spam folders.

### Community Tips

- On the receiving side, you can use Cloudflare to bind a custom domain
- Some people use Feishu's business email with a custom domain, which supports connecting multiple domains
- Lark's mail servers have a very clean reputation and almost never get flagged as spam

---

**Author**: [sitin](https://x.com/sitinme) | [Original post](https://x.com/sitinme/status/2032057264484348047)