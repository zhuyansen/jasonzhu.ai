"use client";

import { useState } from "react";
import Link from "next/link";

export default function HandbookPage() {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "handbook-gate" }),
      });
      const data = await res.json();
      if (res.ok) {
        setUnlocked(true);
      } else {
        setStatus("error");
        setErrorMsg(data.error);
      }
    } catch {
      setStatus("error");
      setErrorMsg("网络错误，请稍后重试");
    }
  };

  // Gate: show subscribe form if not unlocked
  if (!unlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">📘</span>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            AIP 出海自媒体实战手册
          </h1>
          <p className="text-gray-500">
            从入门到精通，14天打造X平台写作技能及变现闭环
          </p>
        </div>

        {/* Preview of what's inside */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            手册包含 8 大章节：
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "第一章：出海AIP基础准备工作",
              "第二章：出海AIP的定位",
              "第三章：X平台的基础认知",
              "第四章：如何运营图文短内容",
              "第五章：出海AIP实战",
              "第六章：多元化变现模式",
              "第七章：内容运营方法论",
              "第八章：常见问题答疑",
            ].map((ch) => (
              <div key={ch} className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {ch}
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe to unlock */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
            免费订阅，立即解锁完整手册
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            输入邮箱即可阅读全部内容，同时获取每周AI精选推送
          </p>
          <form onSubmit={handleUnlock}>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {status === "loading" ? "解锁中..." : "解锁手册"}
              </button>
            </div>
            {status === "error" && (
              <p className="text-sm text-red-500 mt-2 text-center">{errorMsg}</p>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">
              不会发送垃圾邮件，可随时退订
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Unlocked: show full handbook content
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="text-sm font-medium text-green-800">订阅成功！完整手册已解锁</p>
          <p className="text-xs text-green-600">记得收藏本页，随时回来查看</p>
        </div>
      </div>

      <article className="prose">
        <h1>AIP 出海自媒体实战手册（图文博主）</h1>
        <p>
          <strong>适用人群：</strong>想学习出海 AIP 及变现的人群<br />
          <strong>Slogan：</strong>从入门到精通，14天打造 AIP 写作技能及变现闭环
        </p>

        <blockquote>
          <strong>带队教练：</strong>Jason Zhu — 曾任职唯品会/喜马拉雅等名企，AI博主和AI赛道创业者，授权发明专利4项。
          更多信息请查看 <Link href="/about" className="text-[var(--primary)]">关于我</Link>。
        </blockquote>

        <hr />

        <h2>前言：为什么现在是"AIP出海"的黄金时代？</h2>
        <p>AIP = AI + IP（个人品牌）。三大红利正在汇聚：</p>
        <p><strong>红利分析：</strong>从内卷的中文互联网到广阔的全球市场（英语区、日语区等），增量空间巨大。</p>
        <p><strong>AI的杠杆作用：</strong>消除语言障碍、内容生产效率提升100倍、24小时自动化运营。</p>
        <p><strong>为什么首选X平台？</strong></p>
        <ul>
          <li>全球高质量信息圈层的核心发源地</li>
          <li>高客单价用户聚集地（SaaS、Web3、科技圈）</li>
          <li>文字为主+图片辅助，最适合AI辅助生成的媒介形式</li>
          <li>对个体超级节点最友好的算法机制</li>
        </ul>
        <p><strong>外部环境：</strong>经济下行，企业/个人纷纷出海寻找增量市场；AI爆发，各企业启动攻防战，潜在商单很多。</p>

        <h3>课程核心目标</h3>
        <ul>
          <li><strong>学习路径：</strong>冷启动期（0→100粉）+ 加速期（AIP出海自媒体成长）</li>
          <li><strong>实操平台：</strong>以 X（Twitter）为主，内容可同步朋友圈、公众号及即刻</li>
          <li><strong>冷启动完成标准：</strong>X粉丝数≥100，账号无限流/冻结</li>
        </ul>

        <hr />

        <h2>第一章：出海AIP基础准备工作</h2>

        <h3>1.1 基础准备</h3>
        <p>出海AIP需要准备以下基础设施：</p>
        <ul>
          <li><strong>科学上网工具：</strong>稳定的代理服务，建议选择支持多地区节点的服务商</li>
          <li><strong>X账号注册：</strong>使用海外手机号或邮箱注册，避免使用国内手机号</li>
          <li><strong>AI工具准备：</strong>ChatGPT/Claude 用于内容创作，Midjourney/DALL-E 用于图片生成</li>
          <li><strong>浏览器环境：</strong>建议使用 Chrome 无痕模式或独立浏览器配置文件</li>
        </ul>

        <h3>1.2 心理建设</h3>
        <p>做海外自媒体需要的心态准备：</p>
        <ul>
          <li><strong>耐心：</strong>初期数据不好是正常的，大部分人在前3个月都会经历低谷期</li>
          <li><strong>持续输出：</strong>保持每天至少1-2条推文的更新频率</li>
          <li><strong>不要过早放弃：</strong>很多账号是在3-6个月后才开始起飞</li>
          <li><strong>关注价值而非数据：</strong>初期关注"我能为读者提供什么价值"，而非粉丝数</li>
        </ul>

        <hr />

        <h2>第二章：出海AIP的定位</h2>

        <h3>2.1 自媒体不可能三角</h3>
        <p>自媒体存在一个"不可能三角"——流量、变现、可持续性，你需要在三个维度中做出取舍和平衡。</p>
        <p><strong>为什么泛流量不值钱？</strong></p>
        <ul>
          <li>没有精准定位的流量难以变现</li>
          <li>泛流量的用户忠诚度低，取关率高</li>
          <li>广告主更看重精准人群而非泛流量</li>
        </ul>
        <p><strong>为什么要走IP路线？</strong></p>
        <ul>
          <li>IP能建立信任，信任能带来高客单转化</li>
          <li>IP有溢价能力，不会陷入低价竞争</li>
          <li>IP是可积累的资产，越做越值钱</li>
        </ul>

        <h3>2.2 适合出海AIP的黄金赛道</h3>
        <p><strong>推特人群画像：</strong></p>
        <ul>
          <li>科技从业者、创业者、投资人、开发者</li>
          <li>年龄集中在25-45岁，收入水平较高</li>
          <li>信息获取习惯：碎片化阅读，偏好干货内容</li>
        </ul>
        <p><strong>推特人群需求：</strong></p>
        <ul>
          <li>AI工具推荐和评测</li>
          <li>编程教程和技术分享</li>
          <li>创业经验和增长策略</li>
          <li>效率提升和工作流优化</li>
        </ul>

        <h3>2.3 如何找对自己的方向</h3>
        <p>找到三个圆的交集：</p>
        <ol>
          <li><strong>你擅长的：</strong>你的专业技能、工作经验、独特视角</li>
          <li><strong>市场需要的：</strong>目标人群真正关心和愿意付费的问题</li>
          <li><strong>能变现的：</strong>有清晰的变现路径（课程、咨询、产品等）</li>
        </ol>

        <hr />

        <h2>第三章：核心阵地X平台的基础认知</h2>

        <h3>3.1 X平台解读</h3>
        <p><strong>中推和英推的区别：</strong></p>
        <ul>
          <li><strong>中推：</strong>华人圈层，竞争激烈但变现路径清晰（知识付费、社群）</li>
          <li><strong>英推：</strong>全球市场，体量更大但需要英文内容能力（AI可解决）</li>
          <li>建议：先做中推建立基础，再拓展英推扩大影响力</li>
        </ul>

        <p><strong>2025 X平台算法规则：</strong></p>
        <ul>
          <li>Blue付费用户的内容获得更多推荐权重</li>
          <li>图文内容比纯文字获得更高的展示优先级</li>
          <li>互动率（回复、转发、点赞）是核心排序指标</li>
          <li>长推文的完读率影响后续推荐</li>
          <li>外链会被降权，建议将链接放在评论区</li>
        </ul>

        <h3>3.2 内容运营红线</h3>
        <p><strong>国内红线：</strong>注意不要触及政治敏感话题，避免跨境合规问题。</p>
        <p><strong>国外红线：</strong></p>
        <ul>
          <li>不要发布仇恨言论、歧视性内容</li>
          <li>避免抄袭他人内容（AI改写也要注意原创度）</li>
          <li>不要使用机器人刷互动数据</li>
          <li>注意版权问题，使用图片注意授权</li>
        </ul>

        <h3>3.3 做IP账号，就像"开一家店"</h3>
        <p>账号装修四要素——这些是你的"店面门头"：</p>
        <ol>
          <li><strong>头像：</strong>真人照片或高辨识度的品牌logo，避免风景/动物等通用图</li>
          <li><strong>昵称：</strong>简短易记，体现定位，中英文皆可</li>
          <li><strong>Bio：</strong>一句话说清你是谁、做什么、能提供什么价值</li>
          <li><strong>置顶推文：</strong>你最好的内容名片，建议放最佳作品或自我介绍长推</li>
        </ol>

        <hr />

        <h2>第四章：如何运营图文短内容</h2>

        <h3>4.1 四种常见的图文短内容</h3>

        <h4>1. 故事型</h4>
        <ul>
          <li><strong>特点：</strong>用真实经历引发共鸣，开头要有冲突或悬念</li>
          <li><strong>结构：</strong>背景铺垫 → 冲突/转折 → 解决/感悟</li>
          <li><strong>适用：</strong>个人经历分享、创业故事、成长复盘</li>
          <li><strong>技巧：</strong>第一句话决定80%的阅读率，要制造好奇心</li>
        </ul>

        <h4>2. 列表型</h4>
        <ul>
          <li><strong>特点：</strong>数字开头，结构清晰，信息密度高</li>
          <li><strong>结构：</strong>"X个方法/工具/技巧" → 逐条列举 → 总结/CTA</li>
          <li><strong>适用：</strong>工具推荐、方法汇总、资源合集</li>
          <li><strong>技巧：</strong>奇数比偶数效果好，7和10是黄金数字</li>
        </ul>

        <h4>3. 观点型</h4>
        <ul>
          <li><strong>特点：</strong>立场鲜明，有理有据，引发讨论</li>
          <li><strong>结构：</strong>抛出观点 → 论证/案例 → 引导讨论</li>
          <li><strong>适用：</strong>行业洞察、趋势判断、争议话题</li>
          <li><strong>技巧：</strong>不要怕争议，有争议的观点传播力更强</li>
        </ul>

        <h4>4. 教程型</h4>
        <ul>
          <li><strong>特点：</strong>步骤清晰，截图辅助，实操性强</li>
          <li><strong>结构：</strong>问题/需求 → 步骤分解 → 效果展示</li>
          <li><strong>适用：</strong>技术教学、操作指南、工具使用</li>
          <li><strong>技巧：</strong>配图/GIF能大幅提升效果，步骤不宜超过5步</li>
        </ul>

        <h3>4.2 内容二创提示词</h3>
        <p>利用AI工具将已有素材改写、翻译、扩展，实现一鱼多吃：</p>
        <ul>
          <li>将长文拆解为多条推文系列</li>
          <li>将中文内容AI翻译为英文版本</li>
          <li>将教程内容改写为故事型分享</li>
          <li>从评论区高赞回复中提炼新选题</li>
        </ul>

        <hr />

        <h2>第五章：出海AIP实战</h2>

        <h3>5.1 X初期冷启动</h3>

        <h4>冷启动五步走</h4>
        <p><strong>Step 1：账号检查</strong></p>
        <ul>
          <li>确保账号状态正常，没有被限流或冻结</li>
          <li>检查是否能正常发布内容和互动</li>
        </ul>

        <p><strong>Step 2：账号养号</strong></p>
        <ul>
          <li>前1-2周模拟正常用户行为：浏览、点赞、回复</li>
          <li>关注50-100个同领域账号，每天互动5-10次</li>
          <li>不要一上来就疯狂发内容或关注大量账号</li>
        </ul>

        <p><strong>Step 3：账号装修四要素</strong></p>
        <ul>
          <li>头像、昵称、Bio、置顶推文（参考第三章3.3节）</li>
        </ul>

        <p><strong>Step 4：开蓝标</strong></p>
        <ul>
          <li>建议长期做的话开通Premium（$8/月）</li>
          <li>蓝标用户获得更多算法推荐权重</li>
          <li>可以发布更长的推文和视频</li>
          <li>不确定的也可以先开一个月体验</li>
        </ul>

        <p><strong>Step 5：初期内容策略</strong></p>
        <ul>
          <li>每天发布1-2条高质量推文</li>
          <li>主动在大V评论区留下有价值的回复</li>
          <li>加入相关话题讨论，增加曝光</li>
          <li>前100个粉丝靠互动，不靠内容爆款</li>
        </ul>

        <h3>5.2 涨粉路径分析</h3>
        <p>用户从看到你到关注你，需要经历四个转化步骤：</p>

        <p><strong>Step 1：了解（Aware）</strong>— 推文出现在用户信息流</p>
        <ul>
          <li>优化：标题/首句要有冲击力，配图要有吸引力</li>
        </ul>

        <p><strong>Step 2：吸引（Appeal）</strong>— 展开长推文/读完短推文</p>
        <ul>
          <li>优化：内容要有干货，信息密度要高</li>
        </ul>

        <p><strong>Step 3：兴趣（Long-term Interest）</strong>— 进入Profile页面</p>
        <ul>
          <li>优化：确保你的Profile四要素足够吸引人</li>
        </ul>

        <p><strong>Step 4：行动（Action）</strong>— 点击关注</p>
        <ul>
          <li>优化：置顶推文要展示你的最大价值</li>
        </ul>

        <hr />

        <h2>第六章：AIP出海的多元化变现模式</h2>

        <h3>1. 平台内变现</h3>
        <p>X Premium创作者收益：满足条件后可获得广告分成收入。要求：Premium订阅用户 + 近3个月推文展示量≥500万。</p>

        <h3>2. 产品与服务变现（主流模式）</h3>
        <ul>
          <li><strong>付费课程：</strong>录制视频课程或直播培训</li>
          <li><strong>付费社群：</strong>创建Discord/Telegram付费社群</li>
          <li><strong>SaaS产品：</strong>开发AI工具或效率工具</li>
          <li><strong>电子书/手册：</strong>将专业知识打包为付费内容</li>
        </ul>

        <h3>3. 分销别人产品 / 联盟营销</h3>
        <ul>
          <li>推广AI工具赚取佣金（如推广Cursor、Claude等）</li>
          <li>联盟营销平台：Impact、PartnerStack等</li>
          <li>关键：真实使用后的推荐比硬广效果好10倍</li>
        </ul>

        <h3>4. 咨询与顾问</h3>
        <ul>
          <li>一对一咨询：按小时收费，$100-500/小时</li>
          <li>企业顾问：为企业提供AI落地方案</li>
          <li>建立咨询品牌，通过内容展示专业度</li>
        </ul>

        <h3>5. 商单</h3>
        <ul>
          <li>品牌合作推广、软广植入</li>
          <li>粉丝量1000+即可开始接商单</li>
          <li>定价参考：CPM（千次展示）$5-20</li>
        </ul>

        <hr />

        <h2>第七章：出海AIP内容运营方法论</h2>

        <h3>7.1 灵感与选题</h3>
        <p><strong>1. 看对标：从爆款里挖"可复用的需求"</strong></p>
        <ul>
          <li>找10个同领域对标账号，分析他们近30天的爆款</li>
          <li>记录爆款的主题、格式、发布时间</li>
          <li>提炼可复用的选题方向，用自己的视角重新创作</li>
        </ul>

        <p><strong>2. 看热搜：让热点为你的领域"供血"</strong></p>
        <ul>
          <li>关注AI领域的热点事件和产品发布</li>
          <li>第一时间发布评测/解读，抢占信息差</li>
          <li>将热点与你的专业领域结合</li>
        </ul>

        <p><strong>3. 问工具：用AI放大选题效率</strong></p>
        <ul>
          <li>用ChatGPT/Claude生成选题清单</li>
          <li>用Perplexity做快速调研</li>
          <li>用Twitter Analytics分析哪些内容表现好</li>
        </ul>

        <h3>7.2 素材库搭建</h3>
        <p>建立系统化的素材库，包括：</p>
        <ul>
          <li><strong>行业动态：</strong>每天花15分钟刷信息流，收藏有价值的内容</li>
          <li><strong>工具更新：</strong>关注AI工具的更新日志和新功能</li>
          <li><strong>个人经验：</strong>记录工作中的有趣发现和踩坑经历</li>
          <li><strong>用户反馈：</strong>评论区的问题就是最好的选题来源</li>
        </ul>
        <p>推荐工具：Notion、Obsidian、飞书文档</p>

        <h3>7.3 内容数据复盘</h3>
        <p><strong>数据复盘工具：</strong>X Analytics、第三方分析工具</p>
        <p><strong>复盘思路：</strong></p>
        <ul>
          <li>每周回顾：哪条内容数据最好？为什么？</li>
          <li>分析维度：展示量、互动率、涨粉数、Profile访问量</li>
          <li>总结规律：什么时间发布效果好？什么类型内容受欢迎？</li>
          <li>迭代优化：基于数据调整内容策略，放大有效动作</li>
        </ul>

        <hr />

        <h2>第八章：常见问题答疑</h2>

        <h3>1. 账号问题</h3>
        <ul>
          <li><strong>Q：账号被限流怎么办？</strong> A：停止一切操作3-7天，恢复正常使用行为后逐步增加发布频率</li>
          <li><strong>Q：需要多少个账号？</strong> A：建议专注1个主账号，做到1000粉后再考虑矩阵</li>
          <li><strong>Q：被封号了怎么办？</strong> A：可以申诉，同时准备备用账号</li>
        </ul>

        <h3>2. 内容问题</h3>
        <ul>
          <li><strong>Q：不知道写什么？</strong> A：从回答别人的问题开始，评论区就是最好的选题库</li>
          <li><strong>Q：AI写的内容有没有问题？</strong> A：AI生成后必须人工润色和加入个人观点，纯AI内容容易被识别</li>
          <li><strong>Q：中文还是英文？</strong> A：建议先中文起步，稳定后用AI翻译拓展英文内容</li>
        </ul>

        <h3>3. 变现问题</h3>
        <ul>
          <li><strong>Q：多少粉丝可以开始变现？</strong> A：500+精准粉丝就可以尝试，不需要等到万粉</li>
          <li><strong>Q：什么变现方式最适合新手？</strong> A：咨询和付费社群门槛最低，课程和产品需要更多积累</li>
        </ul>

        <h3>4. 引流问题</h3>
        <ul>
          <li><strong>Q：如何从X引流到私域？</strong> A：Bio放链接，内容中自然引导，避免硬广</li>
          <li><strong>Q：可以同步到其他平台吗？</strong> A：可以，内容改写后同步到即刻、公众号、LinkedIn等</li>
        </ul>

        <hr />

        <div className="not-prose mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">想要更多实战指导？</h2>
          <p className="text-blue-100 mb-6">
            关注我获取更多AI出海实战内容，或了解企业培训服务
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href="https://x.com/GoSailGlobal"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              关注我的 X
            </a>
            <Link
              href="/services"
              className="px-5 py-2.5 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              企业培训服务
            </Link>
            <Link
              href="/blog"
              className="px-5 py-2.5 border border-white/30 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
            >
              更多文章
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
