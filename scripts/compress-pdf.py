#!/usr/bin/env python3
"""压缩 Chromium / 无头 Chrome 打印出来的 PDF（public/handbook.pdf、ai-free-learning-guide.pdf 这类），两道工序：
1. 图片：只把页面直接引用的、不透明的 8 位无损图转 JPEG（质量 85），分辨率不变。
2. 无损整理：合并重复对象 + 对象流（Chrome 的 PDF 小对象多，常能再省一半）。要求和第 1 步的结果逐页逐像素一致，否则退回第 1 步。

2026-10-31 压 handbook.pdf（32MB → 13MB）踩过的坑，这里都避开了：
- PyMuPDF 自带的 rewrite_images 按图片最小的显示尺寸算 ppi，同一张图在别处以缩略图出现过，整张就被降成马赛克；
  它还会改 Type 3 字体里的 emoji 字形图片，emoji 直接消失。所以这里自己挑图，只动页面直接引用的大图。
- rewrite_images 之后用 garbage>=2 保存会弄坏 Chromium 生成的 Type 3 字体（40 页文字出错），所以第 1 步只用 garbage=1，
  第 2 步单独做、逐像素核对。
- 别用 Ghostscript 整本重写：同样会重写字体。
最后再核对每页文字和链接数，有一处不一致就不写出文件。依赖 PyMuPDF（pip install pymupdf）和 numpy。

用法：python3 scripts/compress-pdf.py 输入.pdf 输出.pdf
"""
import collections
import sys

import fitz
import numpy as np

fitz.TOOLS.mupdf_display_errors(False)  # handbook.pdf 自带一些找不到的资源引用，MuPDF 会刷屏报错，不影响结果


def recompress_images(doc):
    targets, skipped = set(), collections.Counter()
    for page in doc:
        for xref, smask, w, h, bpc, cs, alt, name, filt, ref in (im[:10] for im in page.get_images(full=True)):
            if xref in targets:
                continue
            if filt != "FlateDecode":
                skipped["原本就是 JPEG 等有损格式"] += 1
            elif smask or ref or bpc != 8:
                skipped["带透明 / 嵌套引用 / 非 8 位"] += 1
            else:
                targets.add(xref)
    done, before, after, worst = 0, 0, 0, 99.0
    for xref in targets:
        raw = doc.xref_stream_raw(xref)
        pix = fitz.Pixmap(doc, xref)
        if pix.alpha or pix.n not in (1, 3) or "Indexed" in (doc.xref_get_key(xref, "ColorSpace")[1] or ""):
            skipped["特殊像素格式"] += 1
            continue
        jpg = pix.tobytes("jpeg", jpg_quality=85)
        if len(jpg) > len(raw) * 0.8:
            skipped["转 JPEG 省不到 20%"] += 1
            continue
        orig = np.frombuffer(pix.samples, np.uint8).astype(np.float32)
        doc.update_stream(xref, jpg, new=False, compress=False)
        doc.xref_set_key(xref, "Filter", "/DCTDecode")
        doc.xref_set_key(xref, "DecodeParms", "null")
        chk = fitz.Pixmap(doc, xref)
        assert (chk.width, chk.height, chk.n) == (pix.width, pix.height, pix.n), f"xref {xref} 解码后尺寸变了"
        mse = ((orig - np.frombuffer(chk.samples, np.uint8).astype(np.float32)) ** 2).mean()
        worst = min(worst, 10 * np.log10(65025 / mse) if mse else 99.0)
        done, before, after = done + 1, before + len(raw), after + len(jpg)
    print(f"1. 图片：转 JPEG {done} 张，{before / 1048576:.1f}MB → {after / 1048576:.1f}MB，单张 PSNR 最低 {worst:.1f}dB；跳过 {dict(skipped)}")


def same_text_links(a, b):
    return len(a) == len(b) and all(a[i].get_text() == b[i].get_text() for i in range(len(a))) and \
        sum(len(p.get_links()) for p in a) == sum(len(p.get_links()) for p in b)


def main():
    if len(sys.argv) != 3:
        sys.exit("用法：python3 scripts/compress-pdf.py 输入.pdf 输出.pdf")
    src, dst = sys.argv[1], sys.argv[2]
    doc = fitz.open(src)
    recompress_images(doc)
    stage1 = doc.tobytes(garbage=1, deflate=True)
    s1 = fitz.open(stream=stage1, filetype="pdf")
    stage2 = s1.tobytes(garbage=4, deflate=True, use_objstms=1)
    s2 = fitz.open(stream=stage2, filetype="pdf")
    if same_text_links(s1, s2) and all(s1[i].get_pixmap(dpi=72).samples == s2[i].get_pixmap(dpi=72).samples for i in range(len(s1))):
        out = stage2
        print(f"2. 无损整理：{len(stage1) / 1048576:.2f}MB → {len(stage2) / 1048576:.2f}MB，逐页逐像素一致")
    else:
        out = stage1
        print("2. 无损整理后和第 1 步不一致，不用，保留第 1 步结果")
    a, b = fitz.open(src), fitz.open(stream=out, filetype="pdf")
    if not same_text_links(a, b):
        sys.exit("❌ 核对没通过（页数 / 文字 / 链接和原文件不一致），没写出文件")
    open(dst, "wb").write(out)
    print(f"✅ {dst}：{len(open(src, 'rb').read()) / 1048576:.2f}MB → {len(out) / 1048576:.2f}MB，"
          f"{len(b)} 页文字和 {sum(len(p.get_links()) for p in b)} 个链接都和原文件一致")


if __name__ == "__main__":
    main()
