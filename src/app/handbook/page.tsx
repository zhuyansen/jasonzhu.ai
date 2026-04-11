"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function HandbookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUnlocked = searchParams.get("unlocked") === "true";
  const [email, setEmail] = useState("");
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
        router.push("/handbook?unlocked=true");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "订阅失败，请稍后重试");
      }
    } catch {
      setStatus("error");
      setErrorMsg("网络错误，请稍后重试");
    }
  };

  // Gate: show subscribe form if not unlocked
  if (!isUnlocked) {
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
          <strong>适用人群：</strong>想学习出海 AIP 及变现人群<br />
          <strong>Slogan：</strong>从入门到精通，14天打造 AIP 写作技能及变现闭环
        </p>

        <blockquote>
          <strong>带队教练：</strong>Jason Zhu — 曾任职唯品会/喜马拉雅等名企，AI博主和AI赛道创业者，授权发明专利4项。
          更多信息请查看 <Link href="/about" className="text-[var(--primary)]">关于我</Link>。
        </blockquote>

        <hr />

        {/* ===== 前言 ===== */}
        <h2>前言：为什么现在是"AIP出海"的黄金时代？</h2>

        <h3>红利分析：从内卷的中文互联网到广阔的全球市场</h3>
        <p>
          中文互联网已经进入存量博弈阶段，各个赛道都已红海化。而全球市场（英语区、日语区、西班牙语区等）仍然有大量的增量空间。
          出海意味着从一个14亿人的内卷市场，走向一个50亿人的蓝海市场。
        </p>

        <h3>AI的杠杆作用</h3>
        <ul>
          <li><strong>消除语言障碍：</strong>AI翻译+润色让你可以用母语思考、用外语发布，内容质量几乎无损</li>
          <li><strong>内容生产效率提升100倍：</strong>从选题、写作、配图到发布，AI可以参与每一个环节，大幅降低创作门槛</li>
          <li><strong>24小时自动化运营：</strong>AI可以帮助你实现内容排期、自动回复、数据分析等运营动作的自动化</li>
        </ul>

        <h3>为什么首选X平台？</h3>
        <ul>
          <li><strong>全球高质量信息圈层的核心发源地：</strong>硅谷大佬、科技圈KOL、加密货币社区的第一信息源</li>
          <li><strong>高客单价用户聚集地：</strong>SaaS创始人、Web3从业者、科技投资人，这些人群的付费意愿和能力都很强</li>
          <li><strong>文字为主+图片辅助，最适合AI：</strong>相比视频平台，文字内容是AI目前最擅长的媒介形式，创作效率最高</li>
          <li><strong>对个体超级节点最友好的算法机制：</strong>X的For You推荐机制让优质内容有机会突破圈层，小账号也能出爆款</li>
        </ul>

        <h3>外部环境</h3>
        <p>
          <strong>经济下行，出海寻增量：</strong>国内经济增速放缓，越来越多的企业和个人开始向海外寻找新的增长点。
        </p>
        <p>
          <strong>AI爆发，潜在商单很多：</strong>AI行业正处于爆发期，各企业启动AI转型攻防战，对AI内容创作者的商业合作需求激增。
        </p>

        <hr />

        {/* ===== 课程核心目标 ===== */}
        <h2>课程核心目标</h2>
        <ul>
          <li><strong>学习路径：</strong>冷启动期（0→100粉）+ 加速期（持续成长与变现）</li>
          <li><strong>实操平台：</strong>以 X（Twitter）为主，内容可同步朋友圈、公众号及即刻</li>
          <li><strong>冷启动完成标准：</strong>X粉丝数≥100，账号无限流/冻结</li>
          <li><strong>加速期完成标准：</strong>培养出选题能力，找到对标账号，形成稳定的内容输出节奏</li>
        </ul>

        <hr />

        {/* ===== 课程准备工具 ===== */}
        <h2>课程准备工具</h2>

        <h3>必选项</h3>
        <ul>
          <li><strong>科学上网工具：</strong>稳定的代理服务，建议选择支持多地区节点的服务商</li>
          <li><strong>X账号：</strong>使用谷歌邮箱申请，避免使用国内手机号直接注册</li>
          <li><strong>脉脉账号：</strong>用于获取国内AI行业动态和人脉资源</li>
        </ul>

        <h3>可选项</h3>
        <ul>
          <li><strong>爱贝壳内容同步助手：</strong>一键将内容同步到多个平台</li>
          <li><strong>沉浸式翻译插件：</strong>浏览外文内容时实时翻译，提升信息获取效率</li>
          <li><strong>SuperX浏览器插件：</strong>X平台数据分析增强工具，查看详细的推文数据</li>
        </ul>

        <hr />

        {/* ===== 第一章 ===== */}
        <h2>第一章：出海AIP基础准备工作</h2>

        <h3>1.1 基础准备</h3>
        <p>出海AIP需要准备以下基础设施：</p>
        <ul>
          <li><strong>科学上网工具：</strong>稳定的代理服务，建议选择支持多地区节点的服务商，优先选择美国、日本节点</li>
          <li><strong>X账号：</strong>使用谷歌邮箱注册，注册过程中需要手机号验证时建议使用海外接码平台</li>
        </ul>

        <h3>1.2 心理建设</h3>
        <p><strong>为什么大多数人买了课却不做？</strong></p>
        <ul>
          <li><strong>缺乏监督：</strong>没有外部约束，自律很难维持。解决方案：加入学习社群，找到同行伙伴</li>
          <li><strong>没有即时反馈：</strong>前期数据差，看不到成果就容易放弃。解决方案：关注过程指标而非结果指标</li>
          <li><strong>没有执行系统：</strong>只有方法论没有SOP，不知道每天具体做什么。解决方案：跟着本手册的每日任务清单走</li>
        </ul>
        <p><strong>心理准备三原则：</strong></p>
        <ol>
          <li><strong>完成比完美更重要：</strong>先发出去，再迭代优化。不要追求完美而迟迟不动手</li>
          <li><strong>执行力比方法论更重要：</strong>知道100个技巧不如真正用好1个技巧</li>
          <li><strong>14天可以改变很多事：</strong>坚持14天，你会看到明显的进步和变化</li>
        </ol>

        <hr />

        {/* ===== 第二章 ===== */}
        <h2>第二章：出海AIP的定位</h2>

        <h3>2.1 自媒体不可能三角</h3>
        <p>自媒体存在一个"不可能三角"——<strong>内容深度</strong>、<strong>传播力</strong>、<strong>变现力</strong>，你很难三者兼得，需要在三个维度中做出取舍和平衡。</p>

        <h4>2.1.2 为什么泛流量不值钱</h4>
        <ul>
          <li><strong>与商业目标匹配度低：</strong>泛流量用户画像模糊，广告主无法精准触达目标人群</li>
          <li><strong>转化效率差：</strong>泛流量的用户忠诚度低，转化率通常不到精准流量的1/10</li>
        </ul>
        <p><strong>品牌方找博主的路径（4步）：</strong></p>
        <ol>
          <li>确定目标人群画像</li>
          <li>寻找该人群聚集的博主</li>
          <li>评估博主的粉丝质量和互动率</li>
          <li>对比CPM/CPA成本，选择性价比最高的合作对象</li>
        </ol>

        <h4>2.1.3 为什么要走IP路线</h4>
        <p><strong>抗周期（人格化表达）：</strong>IP是人格化的，不会因为平台算法变化而失去所有流量。</p>
        <p><strong>高商业化价值：</strong></p>
        <ul>
          <li><strong>信任溢价：</strong>用户因为信任你这个人而买单，愿意支付更高的价格</li>
          <li><strong>金字塔型变现结构：</strong>
            <ul>
              <li>底层：流量型变现（广告分成、平台激励）——覆盖面广，客单价低</li>
              <li>中层：产品型变现（课程、电子书、工具）——中等覆盖，中等客单价</li>
              <li>顶层：服务型变现（咨询、顾问、定制服务）——覆盖面窄，客单价高</li>
            </ul>
          </li>
        </ul>
        <p><strong>复利效应：</strong></p>
        <ul>
          <li><strong>内容复利：</strong>优质内容会被反复搜索和引用，长期带来流量</li>
          <li><strong>粉丝复利：</strong>忠实粉丝会主动传播你的内容，带来自然增长</li>
          <li><strong>影响力复利：</strong>影响力越大，获取资源和机会的成本越低</li>
        </ul>
        <blockquote>
          <strong>真实案例对比：</strong>8.4K粉的IP账号，通过咨询+课程月入人民币10000+；而5w粉的泛流量账号，因为粉丝画像模糊，几乎接不到商单。粉丝质量远比数量重要。
        </blockquote>

        <h3>2.2 适合出海AIP的黄金赛道</h3>
        <p><strong>推特人群画像：</strong></p>
        <ul>
          <li>男性偏多（科技、创业、投资领域尤为明显）</li>
          <li>中年为主（25-45岁，有一定经济基础和消费能力）</li>
          <li>偏理性（更关注数据、逻辑、实用价值，情绪化内容效果差）</li>
        </ul>
        <p><strong>推特人群需求（两大核心）：</strong></p>
        <ul>
          <li><strong>赚钱：</strong>副业机会、被动收入、投资理财、创业方法</li>
          <li><strong>干货：</strong>技术教程、工具推荐、行业洞察、效率提升</li>
        </ul>

        <p><strong>赚钱类案例账号：</strong></p>
        <ul>
          <li><code>@dontbesilent12</code> — 分享副业和被动收入方法，粉丝增长迅速</li>
          <li><code>@xingpt</code> — AI赚钱实战分享，内容变现路径清晰</li>
        </ul>

        <p><strong>干货类四个级别：</strong></p>
        <ol>
          <li><strong>第一级：纯搬运</strong> — 直接翻译/搬运海外内容，门槛最低但天花板也最低</li>
          <li><strong>第二级：搬运+整合资讯</strong> — 将多个信息源整合成结构化内容，有一定信息增量</li>
          <li><strong>第三级：原创</strong> — 基于自身经验和思考产出原创内容，有个人观点和视角</li>
          <li><strong>第四级：深层次干货</strong> — 系统性方法论、独家数据分析、行业深度研究，最有价值也最稀缺</li>
        </ol>

        <h3>2.3 如何找对自己的方向</h3>
        <p><strong>对标账号研究5步法：</strong></p>
        <ol>
          <li><strong>找3-5个对标账号：</strong>找到和你定位相似、粉丝量在1K-50K之间的账号作为参考</li>
          <li><strong>分析内容类型：</strong>他们主要发什么类型的内容？哪些内容数据最好？</li>
          <li><strong>学习互动策略：</strong>他们如何与粉丝互动？回复频率？评论区运营策略？</li>
          <li><strong>拆解变现模式：</strong>他们通过什么方式变现？定价多少？转化路径是什么？</li>
          <li><strong>找到差异化定位：</strong>在对标的基础上，找到你的独特角度和差异化价值</li>
        </ol>

        <hr />

        {/* ===== 第三章 ===== */}
        <h2>第三章：核心阵地X平台的基础认知</h2>

        <h3>3.1 X平台解读</h3>
        <p><strong>中推和英推的区别：</strong></p>
        <ul>
          <li><strong>内容结构：</strong>中推偏好长线程（Thread）和干货整理；英推更注重简洁有力的单条推文</li>
          <li><strong>情感表达：</strong>中推社区情感联结更强，英推更注重信息价值和观点输出</li>
          <li><strong>人群规模：</strong>中推用户量有限但变现路径清晰；英推市场体量大10倍以上</li>
          <li><strong>难易程度：</strong>中推入门简单但天花板较低；英推需要语言能力（AI可解决）但上限更高</li>
        </ul>

        <h4>3.1.2 2025 X平台算法规则</h4>
        <p><strong>For You信息流利好中小账号：</strong></p>
        <ul>
          <li>Out-of-Network内容占For You信息流的60-70%，意味着你的内容可以被非粉丝看到</li>
          <li>这对小账号是巨大的利好——只要内容质量高，就有机会获得大量曝光</li>
        </ul>
        <p><strong>取消主贴带link降权：</strong>2025年X调整了算法，主贴中包含外链不再被严重降权，但仍建议将链接放在评论区以获得最佳表现。</p>
        <p><strong>搜索优化：</strong>X的搜索功能越来越强大，关键词优化变得更加重要。在推文中自然嵌入目标关键词可以提升搜索可见度。</p>
        <p><strong>内容优先策略：</strong></p>
        <ul>
          <li><strong>视频优先级提升：</strong>视频内容获得更多的推荐权重，特别是短视频</li>
          <li><strong>正面内容推广：</strong>算法更倾向于推荐正面、有建设性的内容，减少负面和争议性内容的推荐</li>
          <li><strong>回复排名改进：</strong>高质量的回复会被优先展示，评论区互动的价值进一步提升</li>
        </ul>

        <h3>3.2 内容运营红线</h3>
        <p><strong>国内红线：</strong></p>
        <ul>
          <li><strong>政治敏感：</strong>不要触及两岸关系、领土争议等敏感话题</li>
          <li><strong>虚假信息：</strong>不要传播未经证实的消息，特别是涉及国内企业和人物的</li>
          <li><strong>科学上网风险：</strong>注意保护个人隐私，不要在公开平台暴露自己的真实身份和所在地</li>
        </ul>
        <p><strong>国外红线：</strong></p>
        <ul>
          <li><strong>仇恨言论：</strong>不要发布针对种族、性别、宗教等群体的歧视性内容</li>
          <li><strong>虚假信息：</strong>不要传播未经证实的健康、政治相关信息</li>
          <li><strong>隐私：</strong>不要未经授权公开他人的私人信息</li>
          <li><strong>版权：</strong>使用图片和内容注意授权，避免侵权</li>
        </ul>

        <h3>3.3 做IP账号就像开店</h3>
        <p>把做IP想象成开一家店，你需要考虑以下几个方面：</p>
        <ul>
          <li><strong>装修与门面：</strong>头像、背景图、Bio就是你的店面装修，决定了用户的第一印象</li>
          <li><strong>卖什么产品：</strong>你的内容定位就是你的产品线，要有清晰的品类和特色</li>
          <li><strong>打造店主魅力：</strong>人格化表达让用户记住你这个人，而不只是你的内容</li>
          <li><strong>价值观与故事：</strong>分享你的价值观和成长故事，让粉丝产生情感联结</li>
          <li><strong>目标设定：</strong>设定清晰的阶段性目标（100粉→1K粉→10K粉），每个阶段有不同的运营重点</li>
        </ul>

        <hr />

        {/* ===== 第四章 ===== */}
        <h2>第四章：如何运营图文短内容</h2>

        <h3>4.1 四种常见短内容</h3>

        <h4>1. 故事型</h4>
        <ul>
          <li><strong>核心特征：</strong>用真实经历引发共鸣，带有情感张力和个人色彩</li>
          <li><strong>优势：</strong>容易引发情感共鸣，转发和收藏率高</li>
          <li><strong>适用场景：</strong>个人经历分享、创业复盘、成长感悟、行业观察</li>
          <li><strong>与其他类型区别：</strong>故事型重"情感"和"共鸣"，而非"信息密度"</li>
        </ul>

        <h4>2. 列表型</h4>
        <ul>
          <li><strong>核心特征：</strong>结构化整理，编号清晰，bullet points明确</li>
          <li><strong>优势：</strong>信息密度高，易于浏览和收藏，适合工具推荐和方法总结</li>
          <li><strong>适用场景：</strong>工具合集、方法汇总、资源推荐、对比分析</li>
          <li><strong>与其他类型区别：</strong>列表型重"结构"和"信息密度"，而非情感表达</li>
        </ul>

        <h4>3. 观点型</h4>
        <ul>
          <li><strong>核心特征：</strong>独特视角、争议性观点、立场鲜明</li>
          <li><strong>优势：</strong>容易引发讨论和争议，评论区互动率高</li>
          <li><strong>适用场景：</strong>行业趋势判断、热点事件评论、反常识观点、预测性分析</li>
          <li><strong>与其他类型区别：</strong>观点型重"立场"和"争议"，需要有理有据地支撑观点</li>
        </ul>

        <h4>4. 教程型</h4>
        <ul>
          <li><strong>核心特征：</strong>Step by Step流程，步骤清晰，可操作性强</li>
          <li><strong>优势：</strong>实用价值高，用户愿意收藏和分享，长期搜索流量好</li>
          <li><strong>适用场景：</strong>技术教学、操作指南、工具使用教程、问题解决方案</li>
          <li><strong>与其他类型区别：</strong>教程型重"可操作性"和"步骤清晰"，需要配图或GIF</li>
        </ul>

        <h3>4.2 如何写高涨粉故事</h3>
        <p>使用 <strong>钩子Hook + 主体Body + CTA</strong> 结构：</p>
        <ul>
          <li><strong>Hook（钩子）：</strong>第一句话就要抓住注意力。用冲突、悬念、反常识开头。例如："我在3个月内从0做到10K粉丝，方法出乎你的意料。"</li>
          <li><strong>Body（主体）：</strong>展开具体经历和细节，加入数据和转折点，让读者产生代入感</li>
          <li><strong>CTA（行动号召）：</strong>引导用户互动——关注、转发、评论、点赞。例如："如果你也想开始出海自媒体，转发这条让更多人看到。"</li>
        </ul>

        <h3>4.3 如何写高流量列表</h3>
        <p>列表型内容的核心是<strong>结构化整理</strong>，让用户在最短时间内获取最大信息量：</p>
        <ul>
          <li>使用<strong>编号</strong>让结构更清晰（"7个工具"比"一些工具"效果好10倍）</li>
          <li>每条<strong>bullet point</strong>要有明确的价值点，不要水字数</li>
          <li>开头写<strong>总览</strong>，让用户知道这条推文的价值</li>
          <li>结尾加<strong>CTA</strong>，引导收藏和转发</li>
        </ul>

        <h3>4.4 如何发表观点</h3>
        <p>观点型内容的关键是<strong>独特视角</strong>和<strong>争议性</strong>：</p>
        <ul>
          <li>不要说正确的废话，要有自己的立场和判断</li>
          <li>用数据和案例支撑你的观点，增加说服力</li>
          <li>不怕有人反对，有争议的内容传播力更强</li>
          <li>在评论区积极回复不同意见，形成深度讨论</li>
        </ul>

        <h3>4.5 如何做好教程</h3>
        <p>教程型内容需要<strong>Step by Step</strong>的清晰流程：</p>
        <ul>
          <li>明确说明这个教程解决什么问题、适合什么人</li>
          <li>步骤不宜超过5-7步，太长的教程建议拆分成系列</li>
          <li>每步配截图或GIF，降低用户的理解成本</li>
          <li>结尾给出完整的效果展示，让用户看到价值</li>
        </ul>

        <h3>4.6 内容二创提示词</h3>
        <p>以下是一个完整的AI内容二创提示词模板，可以直接使用：</p>
        <blockquote>
          <p><strong>提示词模板：</strong></p>
          <p>
            你是一位出海自媒体内容专家，擅长将已有内容改写为适合X平台传播的图文短内容。请根据以下原始内容，生成一条适合X平台发布的推文：
          </p>
          <p>
            原始内容：[粘贴你的原始内容]<br />
            目标类型：[故事型/列表型/观点型/教程型]<br />
            目标受众：[描述你的目标读者]<br />
            语言：[中文/英文]
          </p>
          <p>
            要求：<br />
            1. 第一句话要有冲击力，能让用户停下滑动<br />
            2. 内容要有信息增量，不能是原内容的简单摘要<br />
            3. 加入个人观点和经验，不要纯AI味<br />
            4. 结尾要有明确的CTA（引导关注/转发/评论）<br />
            5. 字数控制在280字以内（中文）或270字符以内（英文）<br />
            6. 适当使用emoji增加视觉层次
          </p>
        </blockquote>

        <hr />

        {/* ===== 第五章 ===== */}
        <h2>第五章：出海AIP实战</h2>

        <h3>5.1 X初期冷启动</h3>

        <h4>冷启动须知</h4>
        <ul>
          <li><strong>X人群特点：</strong>偏理性、重干货、高付费意愿，不要用抖音/小红书的内容风格做X</li>
          <li><strong>活跃时间段：</strong>周二至周四发帖效果最佳；高峰时段为美东时间8-11AM和2-6PM（北京时间晚8点到次日凌晨6点）</li>
          <li><strong>发帖建议：</strong>每天至少1条高质量推文，加上3-5条评论区互动</li>
          <li><strong>小Tips：</strong>周末互动率通常较低，可以用来准备下周内容；节假日可以发轻松的个人内容</li>
        </ul>

        <h4>冷启动实战5步</h4>

        <p><strong>Step 1：账号检查</strong></p>
        <p>在开始运营之前，务必检查以下几点：</p>
        <ul>
          <li><strong>被锁检查：</strong>确认账号没有被锁定，能正常登录和发布内容</li>
          <li><strong>冻结检查：</strong>确认账号没有因为异常行为被冻结</li>
          <li><strong>限流检查：</strong>发一条测试推文，观察展示量是否正常（新号通常有几十到几百的展示量）</li>
          <li><strong>标签检查：</strong>确认账号没有被标记为垃圾账号或bot</li>
          <li><strong>IP检查：</strong>确认科学上网工具的IP没有被X标记为高风险，避免使用免费或共享节点</li>
        </ul>

        <p><strong>Step 2：养号</strong></p>
        <ul>
          <li><strong>新号至少养3天：</strong>不要注册完就开始疯狂发内容</li>
          <li><strong>每天活跃1小时：</strong>浏览信息流、点赞、回复，模拟正常用户行为</li>
          <li><strong>谨慎互动：</strong>每天关注5-10个同领域账号，点赞10-20条推文，回复3-5条推文。不要批量操作</li>
        </ul>

        <p><strong>Step 3：账号装修四要素</strong></p>
        <ul>
          <li><strong>昵称：</strong>简短易记，中英文皆可。建议格式："名字 | 定位标签"，例如"Jason | AI出海实战"</li>
          <li><strong>头像：</strong>强烈建议使用真人照片。真人头像的信任度和互动率远高于卡通/logo头像。如果不想露脸，可以用AI生成一个半写实的虚拟形象</li>
          <li><strong>简介/个人介绍：</strong>Bio是最重要的转化工具。结构建议：第一行说你是谁、做什么；第二行说你能提供什么价值；第三行放CTA（链接/引导关注）</li>
          <li><strong>背景图：</strong>利用背景图展示你的核心价值主张或成就，相当于一个免费的广告位</li>
        </ul>

        <p><strong>Step 4：开蓝标</strong></p>
        <p><strong>一定要开！</strong>Premium会员是X运营的基础投资：</p>
        <ul>
          <li>蓝标用户的内容在算法推荐中获得更高权重</li>
          <li>可以发布更长的推文（最多25,000字符）</li>
          <li>可以编辑已发布的推文</li>
          <li>蓝标本身就是信任背书</li>
        </ul>
        <p><strong>支付方式：</strong>切换到日区可以用较低价格开通（约￥54/月），或者通过礼品卡支付避免信用卡问题。</p>

        <p><strong>Step 5：初期内容策略（6个策略）</strong></p>
        <ol>
          <li><strong>大V评论区（重要度：5星）：</strong>在同领域大V的推文下留下有价值的评论。不是刷存在感，而是真正贡献有深度的观点。大V的评论区是最高效的曝光渠道</li>
          <li><strong>每日发推（重要度：4星）：</strong>保持每天至少1条高质量原创推文的更新频率。内容质量 &gt; 数量</li>
          <li><strong>互关社区（重要度：3星）：</strong>加入同领域的互关社区，但不要盲目互关。选择与你定位相关的高质量账号</li>
          <li><strong>热门话题（重要度：3星）：</strong>关注AI、科技领域的热门话题，第一时间发布相关内容。信息差就是流量差</li>
          <li><strong>引用转发（重要度：5星）：</strong>引用转发大V的推文并加上你的独特观点。这是一种高效的"借势"策略</li>
          <li><strong>互动率优先（重要度：4星）：</strong>积极回复每一条评论，与粉丝建立真实的互动关系。互动率是算法推荐的核心指标</li>
        </ol>

        <h3>5.2 涨粉路径分析</h3>
        <p>用户从看到你到关注你，需要经历<strong>转化四步骤</strong>：</p>

        <p><strong>第一步：了解（Aware）</strong></p>
        <p>推文出现在用户的For You信息流中。优化重点：标题/首句要有冲击力，能让用户停下滑动。</p>

        <p><strong>第二步：吸引（Appeal）</strong></p>
        <p>用户展开并阅读完你的推文内容。优化重点：内容要有干货和信息增量，信息密度要高。</p>

        <p><strong>第三步：兴趣（Interest）</strong></p>
        <p>用户点击你的头像进入Profile页面。优化重点：确保Profile四要素（头像、昵称、Bio、置顶推文）足够吸引人。</p>

        <p><strong>第四步：行动（Action）</strong></p>
        <p>用户点击关注按钮。优化重点：置顶推文要展示你的最大价值，让用户觉得"关注你能持续获得价值"。</p>

        <hr />

        {/* ===== 第六章 ===== */}
        <h2>第六章：AIP出海的多元化变现模式</h2>

        <h3>1. 平台内变现</h3>
        <ul>
          <li><strong>广告收入分成：</strong>X Premium创作者收益计划，满足条件后可获得广告分成收入</li>
          <li><strong>创作者订阅：</strong>开通订阅功能，粉丝付费订阅获取独家内容</li>
          <li><strong>打赏：</strong>粉丝通过Tips功能直接打赏支持创作者</li>
        </ul>

        <h3>2. 产品与服务变现</h3>
        <ul>
          <li><strong>数字产品：</strong>电子书、模板、Prompt合集、工具包等，一次创作反复售卖</li>
          <li><strong>课程/训练营：</strong>录制视频课程或开设直播训练营，系统性地传授知识</li>
          <li><strong>付费社群：</strong>创建Discord/Telegram/知识星球付费社群，提供持续的价值交付</li>
        </ul>

        <h3>3. 分销/联盟营销</h3>
        <ul>
          <li><strong>小报童分销：</strong>推广其他创作者的付费专栏，赚取分销佣金</li>
          <li><strong>产品分销：</strong>推广AI工具、SaaS产品等，通过联盟链接赚取佣金（如推广Cursor、Claude等AI工具）</li>
        </ul>

        <h3>4. 咨询与顾问</h3>
        <ul>
          <li>一对一咨询：按小时收费，根据专业度定价$100-500/小时</li>
          <li>企业顾问：为企业提供AI落地方案、出海策略咨询</li>
          <li>通过内容展示专业度，让客户主动找上门</li>
        </ul>

        <h3>5. 商单</h3>
        <ul>
          <li>品牌合作推广、软广植入、产品测评</li>
          <li>粉丝量达到一定规模后，品牌方会主动联系</li>
          <li>也可以主动出击，向相关品牌发送合作提案</li>
        </ul>

        <hr />

        {/* ===== 第七章 ===== */}
        <h2>第七章：出海AIP内容运营方法论</h2>

        <h3>7.1 灵感与选题</h3>

        <h4>看对标：精准找对标、深度拆爆文、变形出差异</h4>
        <ul>
          <li><strong>精准找对标：</strong>找3-5个和你定位相似、粉丝量在你的3-10倍的账号。他们走过的路就是你的参考路径</li>
          <li><strong>深度拆爆文：</strong>分析他们近30天的爆款推文，记录主题、格式、发布时间、互动数据，找到爆款规律</li>
          <li><strong>变形出差异：</strong>不是抄袭，而是在对标的基础上加入自己的视角、经验和数据，做出差异化的内容</li>
        </ul>

        <h4>看热搜：选对平台、用对方法、避开陷阱</h4>
        <ul>
          <li><strong>选对平台：</strong>X Trending、Google Trends、Hacker News、Product Hunt是AI领域最好的热点来源</li>
          <li><strong>用对方法：</strong>不是所有热点都要追。只追与你定位相关的热点，并加入自己的专业解读</li>
          <li><strong>避开陷阱：</strong>不要追政治、争议性热点；不要为了流量牺牲人设；不要跟风发没有信息增量的内容</li>
        </ul>

        <h4>问工具：学术选题工具、AI工具用法、完整Prompt模板</h4>
        <ul>
          <li><strong>学术选题工具：</strong>Google Scholar、Semantic Scholar可以找到行业最新研究，转化为科普内容</li>
          <li><strong>AI工具用法：</strong>用ChatGPT/Claude生成选题清单；用Perplexity做快速调研；用Grok了解X平台实时热点</li>
          <li><strong>完整Prompt模板：</strong>
            <blockquote>
              你是一位X平台内容专家。请根据以下信息，为我生成10个适合在X平台发布的选题：<br />
              我的定位：[你的领域]<br />
              目标受众：[你的目标读者]<br />
              最近热点：[当前行业热点]<br />
              要求：每个选题包含标题、内容类型（故事/列表/观点/教程）、预期效果。
            </blockquote>
          </li>
        </ul>

        <h3>7.2 素材库搭建</h3>
        <ul>
          <li><strong>收集过往爆火选题：</strong>建立一个"爆款选题库"，记录你和对标账号的爆款推文，标注主题、格式和数据</li>
          <li><strong>随手收藏习惯：</strong>看到好的内容立即收藏并打标签。养成"内容感知"的习惯</li>
          <li><strong>飞书多维表格：</strong>推荐使用飞书多维表格管理素材库，支持多维度分类、筛选和统计</li>
        </ul>

        <h3>7.3 内容数据复盘</h3>

        <h4>工具</h4>
        <ul>
          <li><strong>短期免费分析：</strong>X自带的Analytics功能，可以查看基础的展示量、互动率等数据</li>
          <li><strong>中长期Premium Analytics：</strong>X Premium订阅用户可以解锁更详细的数据分析，包括粉丝增长趋势、受众画像等</li>
          <li><strong>深度分析SuperX：</strong>第三方浏览器插件，提供更深入的推文表现分析和竞品对比功能</li>
        </ul>

        <h4>复盘思路</h4>
        <p><strong>准备：定义目标KPI</strong></p>
        <p>明确你当前阶段最关注的核心指标，例如：冷启动期关注粉丝增长数，加速期关注互动率和变现转化。</p>
        <p><strong>4步复盘法：</strong></p>
        <ol>
          <li><strong>数据收集：</strong>每周固定时间记录关键数据——展示量、互动率、粉丝增长数、Profile访问量</li>
          <li><strong>分析原因：</strong>哪条内容数据最好？为什么？哪条最差？什么原因？找到因果关系</li>
          <li><strong>优化迭代：</strong>基于分析结果调整下周的内容策略——放大有效动作，减少无效动作</li>
          <li><strong>记录追踪：</strong>建立复盘文档，持续记录和追踪优化效果。量化进步，形成正反馈循环</li>
        </ol>

        <hr />

        {/* ===== 第八章 ===== */}
        <h2>第八章：常见问题答疑</h2>

        <h3>1. 账号问题</h3>
        <ul>
          <li><strong>Q：如何注册谷歌账号？</strong> A：访问Google账号注册页面，建议使用海外IP注册，注册时选择美国地区。注册完成后用该谷歌邮箱注册X账号。</li>
          <li><strong>Q：蓝V价格多少？</strong> A：X Premium标准价格为$8/月（年付$84/年）。切换到日区或土区可以获得更低价格，约￥54/月。也可以通过礼品卡支付。</li>
          <li><strong>Q：如何检测IP是否安全？</strong> A：访问 whoer.net 检测你的IP质量评分。评分低于70%建议更换节点。同时确保DNS没有泄露真实地址。</li>
          <li><strong>Q：新号浏览量很低怎么办？</strong> A：新号前期浏览量低是正常的。先养号3-7天，然后通过评论区互动获取初始曝光。不要急于追求数据，关注内容质量。</li>
        </ul>

        <h3>2. 内容问题</h3>
        <ul>
          <li><strong>Q：如何下载X上的视频？</strong> A：可以使用第三方工具如 ssstwitter.com 或浏览器插件下载X上的视频内容（注意版权问题）。</li>
          <li><strong>Q：哪种内容互动率最高？</strong> A：根据数据统计，各类型内容的平均互动率为：How-To教程型 38.53%、Listicles列表型 32.7%、观点型 28.1%、故事型 25.8%。教程和列表类内容的互动率普遍更高。</li>
        </ul>

        <h3>3. 变现问题</h3>
        <ul>
          <li><strong>Q：X创作者收益需要什么条件？</strong> A：需要同时满足两个条件：开通蓝标（Premium订阅）+ 近3个月推文展示量≥500万（5M）。达到条件后可以申请加入创作者收益计划。</li>
          <li><strong>Q：多少粉丝可以开始接商单？</strong> A：一般2000粉以上就可以尝试入商单群或主动联系品牌方。但更重要的是粉丝质量和互动率，500精准粉丝可能比5000泛粉丝更有商业价值。</li>
        </ul>

        <h3>4. 引流问题</h3>
        <ul>
          <li><strong>Q：评论区引流怎么做？</strong> A：在自己的推文评论区第一条放引流信息（链接、二维码等）。不要在主贴直接放，放评论区不影响算法推荐。</li>
          <li><strong>Q：简介引流怎么做？</strong> A：Bio中放你的核心引流链接，可以使用Linktree等工具聚合多个链接。Bio链接是最稳定的引流渠道。</li>
          <li><strong>Q：推文内引流怎么做？</strong> A：在推文内容中自然引导，例如"我把完整的工具列表放在了评论区"或"更多内容关注我的专栏"。避免硬广式引流。</li>
        </ul>

        <hr />

        {/* ===== Bottom CTA ===== */}
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

export default function HandbookPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <span className="text-5xl mb-4 block">📘</span>
        <p className="text-gray-400">加载中...</p>
      </div>
    }>
      <HandbookContent />
    </Suspense>
  );
}
