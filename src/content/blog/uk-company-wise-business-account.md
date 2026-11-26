---
title: "英国公司开 Wise 企业账户攻略：0 月费收款与 Stripe 绑定"
date: "2025-11-16"
updated: "2026-06-13"
category: "出海"
tags: ["Wise", "英国公司", "企业银行", "收款", "Stripe"]
excerpt: "国内董事注册英国 Ltd 后怎么开 Wise Business 企业账户？实测拆解 £45 一次性开户费（0 月费）、开户资格与所需材料清单、KYC 地址审核避坑，以及绑定英区企业版 Stripe 收款流程。"
---

**据饼干哥哥AGI 的英国公司银行开户实测（投稿，发布于 jasonzhu.ai）**：拿到英国 Ltd 注册证书（Certificate of Incorporation）后，凭 **中国大陆手机号 + 英国注册地址 + 实际经营地址 + £45 一次性开户费（0 月费）** 即可在线开通 **Wise Business 多币种企业账户**，获得英国本地 Sort Code、美元 Routing Number 与欧元 IBAN，并直接绑定开通英区企业版 Stripe（费率 `1.5% + 20p` 起）。

## 英国 Ltd + 国内董事开 Wise 资格与材料清单

| 核验项目 | 具体要求 | 国内远程董事实操要点 | 常见踩坑点 |
|---|---|---|---|
| **英国公司主体** | 已下证的 UK Ltd（Certificate of Incorporation） | 公司名称、编号与 Companies House 官网公开信息保持完全一致 | 刚注册尚未同步公开库时过早提交 |
| **验证手机号** | 用于注册与两步验证的手机号 | 实测**中国大陆手机号即可**完成短信验证 | 使用临时接码号导致后续无法收验证码 |
| **注册地址** | Registered Address（Companies House 法定登记地址） | 可直接填英国注册代理提供的法定地址 | 仅用于政府信件，**不可**冒充实际经营地址 |
| **实际经营地址** | Trading Address（公司/董事日常真实办公地址） | 如实填写国内真实办公或居家办公地址，并提前备好地址证明 | 把英国代理地址或虚拟办公室填进经营地址，导致 KYC 被拒 |
| **董事身份证明** | 有效护照等官方身份证件 + 人脸核验 | 提前备好清晰、无反光的证件原件 | 姓名拼音、出生日期或地址与后台资料对不上 |
| **开户激活费** | £45 一次性开户费（**0 月费**） | 一次性支付即可开通多币种本地收款账户细节（具体以 Wise 页面为准） | 误以为有按月管理费，或卡在支付方式准备不足 |

## 为什么选 Wise？

注册好英国公司后，直接去 Wise 官网注册企业银行账户即可，全程在线审核。

**Wise 企业版的优势：**

- **无月费**：日常维护零固定月租，适合刚起步的独立开发者和 SaaS 项目
- **一次性开户费**：仅需支付一次开户激活费用（实测 £45），即可解锁英镑 Sort Code、美元 Routing Number、欧元 IBAN 等多币种本地账户信息
- **全球多货币收款**：直接接收海外客户汇款及各平台结算，换汇透明
- **无缝衔接企业版 Stripe**：拿到英国本地银行账户后，即可开通英区企业版 Stripe，费率（`1.5% + 20p` 起）比 PayPal 等渠道更低

## 注册步骤

1. **手机号注册**：前往 Wise Business 官网创建企业账户，用**国内手机号**完成验证即可
2. **填写公司与双地址信息**：准确录入英国公司信息，将**英国注册地址（Registered Address）**与**实际经营地址（Trading Address）**分别如实填清楚
3. **身份与企业 KYC 审核**：按照页面指引上传董事身份证件及公司注册证书，完成身份核验
4. **支付一次性开户费**：审核通过后支付一次性开户费用，即可激活多币种本地收款账号

## Wise + Stripe 黄金收款组合

拿着 Wise 企业银行账户可以去开通英区企业版 Stripe，相对于 PayPal 等渠道，费率更低、结算更稳，且支持全球信用卡与 Apple Pay 收款。对独立开发者和跨境 SaaS 而言，**英国 Ltd + Wise Business + 英区 Stripe** 是成本最低、落地最快的出海收款黄金组合之一。

如果你还在对比美国 LLC（Mercury）与英国 Ltd（Wise）的整体搭建成本和路径，可以先看 [海外公司注册与银行开户总指南](/zh/go-global/open-account) 做整体选型。

## KYC 审核避坑与小贴士

- **准备好英国公司注册证书**：公司英文全称、注册号和成立日期务必与 Companies House 一字不差
- **区分注册地址与经营地址**：这是国内董事开 Wise 最容易卡住的环节——注册地址填英国代理地址没问题，但**实际经营地址必须填你能提供真实地址证明的物理地址**，不能填虚拟办公室或邮件转寄地址
- **提前备好地址证明与补充文件**：开户过程中或收款后可能触发地址验证或额外身份核验，建议提前备好 3 个月内带姓名与一致地址的银行/信用卡对账单；若已经触发审核或被拒，直接按这篇实测排查：[英国公司 Wise 地址验证怎么过？接受的对账单清单与被拒排查指南](/zh/blog/uk-company-wise-address-verification)

---

## 常见问题

### 中国大陆董事远程注册的英国公司，能开 Wise 企业账户吗？

可以。拿到英国 Ltd 注册证书（Certificate of Incorporation）后即可在线申请 Wise Business，实测用中国大陆手机号即可完成验证，无需亲赴英国，只要如实填写公司信息、英国注册地址与国内实际经营地址并通过身份核验即可。

### Wise Business 企业账户收费吗？一次性开户费是多少？

Wise Business **无月费**，只需支付一笔**一次性开户费**（英国主体实测约 £45，以申请页面实时显示为准）即可开通英镑、美元、欧元等多币种本地收款账户细节，是出海独立开发者维护成本最低的企业银行方案之一。

### Wise 开户审核时，注册地址和实际经营地址怎么填才不会被拒？

注册地址（Registered Address）填写登记在 Companies House 的英国代理地址；实际经营地址（Trading Address）必须填写你真实办公的物理地址（例如国内居家办公地址），严禁拿代理地址或虚拟办公室充当经营地址。具体可接受的对账单清单与被拒排查见 [Wise 地址验证完整指南](/zh/blog/uk-company-wise-address-verification)。

### 开通 Wise 企业账户后，怎么配合 Stripe 做海外收款？

拿到 Wise Business 提供的英国本地账户信息（Sort Code 与 Account Number）后，即可用同一家英国 Ltd 主体申请英区企业版 Stripe，将 Wise 设为结算银行账户。英区企业版 Stripe 费率 `1.5% + 20p` 起，显著低于 PayPal 等渠道，是出海 SaaS 收款的常用黄金组合。

## 延伸阅读

### 英国公司出海系列

独立开发者从注册到年审的完整实操路径，每篇都是第一手记录：

- [2 小时注册英国公司，只需 £50](/zh/blog/uk-company-registration-2hours)
- [Wise 地址验证：证明文件要含公司名](/zh/blog/uk-company-wise-address-verification)
- [数据保护费：SaaS 出海合规必缴 £52/年](/zh/blog/uk-company-data-protection-fee)
- [£148 搞定年审：DIY vs 淘宝同口径对比](/zh/blog/uk-company-annual-review-diy-guide)
- [年审 + 零申报：自己办省一半费用](/zh/blog/uk-company-annual-review-tax-filing)
- [年审实战 Timeline：£228 全程 + 省税信息差](/zh/blog/uk-company-annual-review-timeline-checklist)

### 更多出海收款与社群资源

- 🏦 **[海外公司注册与银行开户总指南](/zh/go-global/open-account)**：英国 Ltd + Wise 与美国 LLC + Mercury 方案一站式对比
- 🚀 **[出海实战社群（JasonZhu.AI Club）](/zh/club)**：和已经跑通英国公司、Wise、Stripe 的开发者直接交流避坑经验

---

**撰稿人**: [饼干哥哥AGI](https://x.com/bggg_ai) | [原文链接](https://x.com/bggg_ai/status/1989944484680155356)
