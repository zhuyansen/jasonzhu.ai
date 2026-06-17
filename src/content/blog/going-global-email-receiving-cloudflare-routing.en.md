---
title: "Receiving Emails for Your Product: Set It Up for Free with Cloudflare Email Routing"
excerpt: "Resend handles outbound email just fine, but what about incoming? Cloudflare Email Routing takes care of inbound email for your product — completely free."
---

If you're building a product for global users, you've probably run into this problem: your website lists support@yourdomain.com, but when a user actually sends an email, **you never receive it**.

That's because most people use Resend strictly for outbound — verification codes, notifications, newsletters — and never bother setting up inbound email.

## The Solution: Cloudflare Email Routing

Cloudflare offers a free feature called **Email Routing** that handles exactly this.

### Configuration Steps

1. Open the Cloudflare Dashboard and navigate to Email Routing
2. Add your custom domain email address (e.g., support@yourdomain.com)
3. Set a forwarding destination (your personal Gmail or any other inbox)
4. Verify the destination email address
5. Complete the DNS record configuration

Once set up, any email sent to support@yourdomain.com will be automatically forwarded to your personal inbox — completely free of charge.

### A Complete Outbound + Inbound Email Setup

- **Outbound**: Resend (sign-up verification, notifications, newsletters)
- **Inbound**: Cloudflare Email Routing (support requests, user feedback)

Together, these two tools give you a fully functional email solution for your product, at zero cost.

---

**Author**: [sitin](https://x.com/sitinme) | [Original Post](https://x.com/sitinme/status/2042492524720517127)