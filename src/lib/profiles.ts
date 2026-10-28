// 作者在各平台的主页：全站 Person JSON-LD 的 sameAs 和 llms.txt 的「作者」段都读这一份，改一处两边一起变。
// 2026-10-28 问四个 AI「Jason Zhu 是谁」：ChatGPT、Gemini 直接认出（给的网站、X、GitHub 正是这里原来那三条），
// 豆包、DeepSeek 先列了一串同名的人，补一句「推特」才对上。所以补上中文名和国内平台，让各平台的账号能被认成同一个人。
// 视频号没有网页版主页，不放。

export const AUTHOR_NAME = "Jason Zhu";
export const AUTHOR_ALT_NAME = "祝彦森";

export const PROFILES: { label: string; url: string }[] = [
  { label: "X", url: "https://x.com/GoSailGlobal" },
  { label: "GitHub", url: "https://github.com/zhuyansen" },
  { label: "YouTube", url: "https://www.youtube.com/channel/UCr8j5m5ebYrKqZoLxCaboBg" },
  { label: "B 站", url: "https://space.bilibili.com/266242152" },
  { label: "抖音", url: "https://www.douyin.com/user/MS4wLjABAAAABDQoQfOA67afaoRQ4u79rww04pMm4OoHwwyzJvPWS9E" },
  { label: "小红书", url: "https://www.xiaohongshu.com/user/profile/5bffc7d70000000008003b90" },
];
