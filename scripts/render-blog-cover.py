#!/usr/bin/env python3
"""按站内封面视觉系统（深蓝侧栏 + 米色纸底 + 宋体大标题 + 红色圆章）直接排版出封面，文字 100% 准确、不花生图费。

generate-blog-cover.mjs 用 AI 生图，字常常变形、底部「01 / ----」是空占位；这个脚本用于需要准确文字的封面。
用法：python3 scripts/render-blog-cover.py spec.json
spec.json：{"out": "public/blog/<slug>/cover.png", "lang": "zh"|"en", "headline": ["第一行", "第二行"],
            "subtitle": "...", "points": ["要点1", "要点2", "要点3"], "stamp": "教程", "footer_right": "..."}
依赖 macOS 自带字体（Songti / Hiragino / Georgia）。
"""
import json
import random
import sys

from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1536, 1024
NAVY, PAPER, RED, INK, GREY = (7, 41, 75), (248, 241, 228), (198, 62, 39), (20, 20, 20), (92, 92, 92)
SIDE, BOTTOM = 124, 912
SONGTI = "/System/Library/Fonts/Supplemental/Songti.ttc"
HIRA = "/System/Library/Fonts/Hiragino Sans GB.ttc"
GEORGIA_B = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"


def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)


def fit(draw, text, path, start, max_w, index=0, min_size=40):
    size = start
    while size > min_size and draw.textlength(text, font=font(path, size, index)) > max_w:
        size -= 4
    return font(path, size, index)


def render(spec):
    en = spec.get("lang") == "en"
    im = Image.new("RGB", (W, H), PAPER)
    # 纸张颗粒：轻微噪点，避免纯色太「电子」
    rnd = random.Random(7)
    px = im.load()
    for _ in range(60000):
        x, y = rnd.randrange(W), rnd.randrange(H)
        d = rnd.randint(-7, 4)
        r, g, b = px[x, y]
        px[x, y] = (r + d, g + d, b + d)
    im = im.filter(ImageFilter.GaussianBlur(0.4))
    d = ImageDraw.Draw(im)

    # 侧栏 + 底栏
    d.rectangle((0, 0, SIDE, H), fill=NAVY)
    d.rectangle((0, BOTTOM, W, H), fill=NAVY)
    # 竖排品牌字
    tag = Image.new("RGBA", (520, 60), (0, 0, 0, 0))
    ImageDraw.Draw(tag).text((0, 6), "JASONZHU.AI / NOTES", font=font(HIRA, 34, 2), fill=(255, 255, 255))
    tag = tag.rotate(90, expand=True)
    im.paste(tag, (40, 520 - tag.size[1] + 40), tag)
    # JZ 角标
    d.rectangle((16, 810, 110, 904), fill=RED)
    jz = font(GEORGIA_B, 52)
    tw = d.textlength("JZ", font=jz)
    d.text((63 - tw / 2, 826), "JZ", font=jz, fill=(255, 255, 255))

    # 红色圆章
    cx, cy, r = 1385, 142, 96
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=RED, width=2)
    f1 = font(HIRA, 23, 2)          # Georgia 太宽会顶出圆章
    t1 = "JasonZhu.AI"
    d.text((cx - d.textlength(t1, font=f1) / 2, cy - 46), t1, font=f1, fill=INK)
    d.line((cx - 62, cy - 2, cx + 62, cy - 2), fill=RED, width=1)
    f2 = font(HIRA, 26, 2) if not en else font(GEORGIA_B, 24)
    d.text((cx - d.textlength(spec["stamp"], font=f2) / 2, cy + 14), spec["stamp"], font=f2, fill=INK)

    # 大标题
    x0, y = 196, 228
    for line in spec["headline"]:
        f = fit(d, line, GEORGIA_B if en else SONGTI, 132 if not en else 120, 1180 if en else 1240, index=0)
        d.text((x0, y), line, font=f, fill=INK)
        y += int(f.size * 1.18)

    # 副标题
    fs = fit(d, spec["subtitle"], HIRA, 36, 1240, index=0, min_size=24)
    d.text((x0, y + 34), spec["subtitle"], font=fs, fill=GREY)

    # 三个要点（取代 AI 封面里空着的 01/02/03 占位）
    py, col = 742, (W - x0 - 60) / 3
    fn, ft = font(SONGTI, 40, 0), font(HIRA, 30, 2)   # Georgia 是旧式数字（3 会下沉），编号用宋体
    for i, p in enumerate(spec["points"][:3]):
        px0 = x0 + i * col
        num = f"0{i + 1}"
        base = py + 42                  # 编号和文字按同一条基线对齐（字体不同，按顶部对齐会高低不齐）
        d.text((px0, base), num, font=fn, fill=RED, anchor="ls")
        nx = px0 + d.textlength(num, font=fn) + 16
        d.text((nx, base), p, font=ft, fill=INK, anchor="ls")
        d.line((px0, py + 58, px0 + col - 40, py + 58), fill=RED, width=2)

    # 底栏文字
    fb, fr = font(HIRA, 30, 2), font(HIRA, 30, 0)
    d.text((164, 950), "READ", font=fb, fill=(255, 255, 255))
    d.text((164 + d.textlength("READ", font=fb) + 24, 950), spec.get("footer_url", "jasonzhu.ai/en/blog" if en else "jasonzhu.ai/zh/blog"),
           font=fr, fill=(255, 255, 255))
    right = spec["footer_right"]
    d.text((W - 56 - d.textlength(right, font=fr), 950), right, font=fr, fill=(255, 255, 255))

    im.save(spec["out"], optimize=True)
    print("✓", spec["out"])


if __name__ == "__main__":
    for s in json.load(open(sys.argv[1])):
        render(s)
