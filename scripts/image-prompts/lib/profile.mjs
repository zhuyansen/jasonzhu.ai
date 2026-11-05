/**
 * ChatGPT Images 2.6 合集的配置：分类表、Jev 审核用语、模型识别。daily.mjs / assemble.mjs 共用。
 * Jev 选项的键名和 Claude 库一致（../../opus-prompts/lib/jev.mjs 里的阈值逻辑按键名算），只换说明文字。
 */

export const LIBRARY = { id: "chatgpt-images-2-6", name: "ChatGPT Images 2.6", released: "2026-11-04T23:35:14Z" };

export const CATEGORIES = ["portrait", "illustration", "product", "design", "gif", "edit", "sticker", "comparison"];

export const JEV_PROFILE = {
  intro: "Posts on X that mention ChatGPT Images 2.6 (OpenAI's image model, GPT-Image-2.6 in the API) and have images, a GIF or a video attached. Judge each post on its own.",
  kind: {
    own_work: "The poster shows images, a GIF or an animation they made themselves with the AI image model (art, photo, poster, product shot, sticker, an edit of their own photo)",
    own_comparison: "The poster ran the same prompt on several AI image models themselves and shows the outputs side by side",
    repost: "The poster showcases somebody else's result (aggregator, fan or news account, 'someone made this', 'this guy')",
    tutorial_or_talk: "A tutorial, walkthrough, course promo, talking head, podcast or interview clip",
    news: "A launch announcement, feature news, pricing, or an official demo from the model maker",
    commentary: "Commentary, opinion, a joke or meme about the model, a reaction",
    non_visual: "A promotion for a platform, app, course or giveaway that offers the model, rather than the poster's own result",
  },
  prompt: {
    usable: "A self-contained instruction someone could paste into ChatGPT Images to get a comparable image (a style or edit instruction they can apply to their own photo counts)",
    followup: "A follow-up message from the middle of a longer session (refers to earlier work: 'now add', 'make it brighter', 'again')",
    fragment: "Only part of an instruction, cut off or clearly incomplete",
    commentary: "The creator's commentary about what they did, not the instruction itself",
    for_other_model: "Not the creator's instruction to ChatGPT Images: ChatGPT's own reply, a caption, or a prompt written for a different tool (a video generator, Midjourney parameters only)",
    empty: "Has no real content about what to make ('make it cool', 'surprise me', 'show off')",
    needs_attachment: "Meaningless without a specific image the reader cannot see ('make it like the second picture', 'same as before'); applying a named style to your own photo is not this",
  },
};

/**
 * 官方和平台自己的账号：发的是官方演示或平台推广（「Made on Higgsfield」），按收录标准不收。
 * 分类提示词也写了这条，但 2026-11-05 补跑时 Higgsfield 的 4 条推广被当成作品、2 条直接上线了，所以代码层再挡一道。
 */
const PLATFORM_HANDLES = new Set(["openai", "chatgptapp", "openaidevs", "higgsfield_ai", "freepik", "krea_ai", "openart_ai", "leonardoai_", "fal", "replicate"]);
export const isPlatformAccount = (handle) => PLATFORM_HANDLES.has(String(handle || "").toLowerCase());

/** 作者本人文字里有没有说是 ChatGPT Images 2.6 / GPT-Image-2.6。别家叫「2.6」的模型（Kling、Seedream、Midjourney…）不算 */
const OURS = /(?:chatgpt[\s-]*)?images?[\s-]?2[.\-]?6|gpt[\s-]?image[\s-]?2[.\-]?6/i;
const OTHERS = /\b(?:kling|seedream|seedance|midjourney|flux|imagen|ideogram|hailuo|wan|runway|pika|luma|recraft|leonardo)\b[\s-]*(?:image[\s-]*)?(?:v)?2[.\-]?6/i;
export function mentionsModel(...texts) {
  const t = texts.filter(Boolean).join("\n");
  return OURS.test(t.replace(new RegExp(OTHERS.source, "gi"), ""));
}
