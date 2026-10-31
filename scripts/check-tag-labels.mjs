// 列出博客里还没有英文显示名的中文标签（英文页会回退显示中文）。用法：node scripts/check-tag-labels.mjs
import fs from "fs";
const posts = JSON.parse(fs.readFileSync("src/generated/posts.json", "utf-8"));
const src = fs.readFileSync("src/lib/tag-labels.ts", "utf-8");
const missing = [...new Set(posts.flatMap((p) => p.tags || []))].filter((t) => /[一-鿿]/.test(t) && !src.includes(JSON.stringify(t)));
console.log(missing.length ? `缺英文名的标签：${missing.join("、")}` : "所有中文标签都有英文名");
process.exit(missing.length ? 1 : 0);
