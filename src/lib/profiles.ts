// 作者在各平台的主页：全站 Person JSON-LD 的 sameAs 和 llms.txt 的「作者」段都读这一份，改一处两边一起变。
// 2026-10-28 问四个 AI「Jason Zhu 是谁」：ChatGPT、Gemini 直接认出（给的网站、X、GitHub 正是这里原来那三条），
// 豆包、DeepSeek 先列了一串同名的人，补一句「推特」才对上。所以补上中文名和国内平台，让各平台的账号能被认成同一个人。
// 视频号没有网页版主页，不放。

export const AUTHOR_NAME = "Jason Zhu";
export const AUTHOR_ALT_NAME = "祝彦森";
export const AUTHOR_ALT_NAMES = ["祝彦森", "Yansen Zhu", "zhuyansen", "GoSailGlobal", "JasonZhu.AI"];

export const ORCID_ID = "0009-0000-2894-6285";
export const ORCID_URL = `https://orcid.org/${ORCID_ID}`;

export const PROFILES: { label: string; url: string }[] = [
  { label: "ORCID", url: ORCID_URL },
  { label: "Google Scholar", url: "https://scholar.google.com/citations?user=AlP5JacAAAAJ" },
  { label: "SSRN", url: "https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=14044888" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/jason-zhu-a52aa73bb/" },
  { label: "Product Hunt", url: "https://www.producthunt.com/@yansen_zhu" },
  { label: "X", url: "https://x.com/GoSailGlobal" },
  { label: "GitHub", url: "https://github.com/zhuyansen" },
  { label: "Hugging Face", url: "https://huggingface.co/jasonzhuyansen" },
  { label: "Kaggle", url: "https://www.kaggle.com/yansenzhu" },
  { label: "YouTube", url: "https://www.youtube.com/@JasonZhuGoSail" },
  { label: "PyPI (backlink-guard)", url: "https://pypi.org/project/backlink-guard/" },
  { label: "SSRN Working Paper (200k Indie Payments & MoR Shift)", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737182" },
  { label: "SSRN Working Paper (AI Agent Skills & MCP Security)", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7737258" },
  { label: "CERN Zenodo Working Paper (Indie Payments & MoR Shift PDF)", url: "https://doi.org/10.5281/zenodo.24420871" },
  { label: "CERN Zenodo Working Paper (AI Agent Skills Security PDF)", url: "https://doi.org/10.5281/zenodo.24420920" },
  { label: "CERN Zenodo (200k Payments Dataset)", url: "https://doi.org/10.5281/zenodo.24386243" },
  { label: "CERN Zenodo ($20 MoR Fee Benchmark)", url: "https://doi.org/10.5281/zenodo.24387072" },
  { label: "CERN Zenodo (105k AI Skills Audit)", url: "https://doi.org/10.5281/zenodo.24387074" },
  { label: "CERN Zenodo (Backlink Spam Database)", url: "https://doi.org/10.5281/zenodo.24387076" },
  { label: "Agent Skills Hub", url: "https://www.agentskillshub.top" },
  { label: "B 站", url: "https://space.bilibili.com/266242152" },
  { label: "抖音", url: "https://www.douyin.com/user/MS4wLjABAAAABDQoQfOA67afaoRQ4u79rww04pMm4OoHwwyzJvPWS9E" },
  { label: "小红书", url: "https://www.xiaohongshu.com/user/profile/5bffc7d70000000008003b90" },
];
