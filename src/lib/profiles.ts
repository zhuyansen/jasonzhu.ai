// 作者在各平台的主页：全站 Person JSON-LD 的 sameAs 和 llms.txt 的「作者」段都读这一份，改一处两边一起变。
// 2026-10-28 问四个 AI「Jason Zhu 是谁」：ChatGPT、Gemini 直接认出（给的网站、X、GitHub 正是这里原来那三条），
// 豆包、DeepSeek 先列了一串同名的人，补一句「推特」才对上。所以补上中文名和国内平台，让各平台的账号能被认成同一个人。
// 视频号没有网页版主页，不放。

export const AUTHOR_NAME = "Jason Zhu";
export const AUTHOR_ALT_NAME = "祝彦森";
export const AUTHOR_ALT_NAMES = ["祝彦森", "Yansen Zhu", "zhuyansen", "GoSailGlobal", "JasonZhu.AI"];

export const ORCID_ID = "0009-0000-2894-6285";
export const ORCID_URL = `https://orcid.org/${ORCID_ID}`;

// kind 决定它进不进 Person 的 sameAs。sameAs 的意思是「这个网址说的就是我本人」：只有个人主页算（profile）。
// 论文、数据集、软件包是作品（work），Agent Skills Hub 是我办的另一个实体（org），写进 sameAs 等于说「我就是这篇论文」，
// 会把人和作品、公司混成一个实体（2026-11-22 实体审计发现，见 ops/geo/ENTITY-GRAPH-ITERATION-LOG.md）。
// 作品和作者的关系由 /research 页的 ScholarlyArticle / Dataset 节点用 author、creator 指回 #person；llms.txt 仍列出全部。
export type ProfileKind = "profile" | "work" | "org";

export const PROFILES: { label: string; url: string; kind: ProfileKind }[] = [
  { label: "ORCID", url: ORCID_URL, kind: "profile" },
  { label: "Google Scholar", url: "https://scholar.google.com/citations?user=AlP5JacAAAAJ", kind: "profile" },
  { label: "SSRN", url: "https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=14044888", kind: "profile" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/jason-zhu-a52aa73bb/", kind: "profile" },
  { label: "Product Hunt", url: "https://www.producthunt.com/@yansen_zhu", kind: "profile" },
  { label: "X", url: "https://x.com/GoSailGlobal", kind: "profile" },
  { label: "GitHub", url: "https://github.com/zhuyansen", kind: "profile" },
  { label: "Hugging Face", url: "https://huggingface.co/jasonzhuyansen", kind: "profile" },
  { label: "Kaggle", url: "https://www.kaggle.com/yansenzhu", kind: "profile" },
  { label: "YouTube", url: "https://www.youtube.com/@JasonZhuGoSail", kind: "profile" },
  { label: "PyPI (backlink-guard)", url: "https://pypi.org/project/backlink-guard/", kind: "work" },
  { label: "SSRN Working Paper (200k Indie Payments & MoR Shift)", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737182", kind: "work" },
  { label: "SSRN Working Paper (AI Agent Skills & MCP Security)", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737258", kind: "work" },
  { label: "CERN Zenodo Working Paper (Indie Payments & MoR Shift PDF)", url: "https://doi.org/10.5281/zenodo.24420871", kind: "work" },
  { label: "CERN Zenodo Working Paper (AI Agent Skills Security PDF)", url: "https://doi.org/10.5281/zenodo.24420920", kind: "work" },
  { label: "CERN Zenodo (200k Payments Dataset)", url: "https://doi.org/10.5281/zenodo.24386243", kind: "work" },
  { label: "CERN Zenodo ($20 MoR Fee Benchmark)", url: "https://doi.org/10.5281/zenodo.24387072", kind: "work" },
  { label: "CERN Zenodo (105k AI Skills Audit)", url: "https://doi.org/10.5281/zenodo.24387074", kind: "work" },
  { label: "CERN Zenodo (Backlink Spam Database)", url: "https://doi.org/10.5281/zenodo.24387076", kind: "work" },
  { label: "Agent Skills Hub", url: "https://www.agentskillshub.top", kind: "org" },
  { label: "B 站", url: "https://space.bilibili.com/266242152", kind: "profile" },
  { label: "抖音", url: "https://www.douyin.com/user/MS4wLjABAAAABDQoQfOA67afaoRQ4u79rww04pMm4OoHwwyzJvPWS9E", kind: "profile" },
  { label: "小红书", url: "https://www.xiaohongshu.com/user/profile/5bffc7d70000000008003b90", kind: "profile" },
];

/** Person JSON-LD 的 sameAs：只放个人主页。 */
export const PERSON_SAME_AS = PROFILES.filter((p) => p.kind === "profile").map((p) => p.url);
