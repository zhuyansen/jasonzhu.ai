"""Cover for an issue of the 出海选品周报: new sellers on four newer platforms, last whole month vs this month to END.

    python cover.py END_DATE OUT_BASENAME [en]  # e.g. 2026-10-18 public/blog/chuhai-weekly-02/cover -> cover.svg + cover.png
                                                # add "en" for the English cover (OUT_BASENAME .../cover-en)

Aggregates only, read-only on the history DB. Same palette and type as charts.py.
"""
import datetime as dt
import os
import sqlite3
import subprocess
import sys

SURFACE, INK, INK2, GRID, GREY, BLUE = "#fcfcfb", "#0b0b0b", "#52514e", "#e6e5e0", "#b9b8b2", "#2a78d6"
FONT = {"zh": "PingFang SC, Hiragino Sans GB, sans-serif", "en": "Helvetica Neue, Helvetica, Arial, sans-serif"}
# 路径可由环境变量覆盖（GitHub Actions 里 .github/workflows/seller-weekly.yml 用），默认是本机的位置
DB = "file:" + os.environ.get("SELLER_DB", "/Users/zhuyansen/content/new-term-radar/state/sellers_history.db") + "?mode=ro"
LIVE = "pays = 1 AND network = 0"
NAMES = [("lemonsqueezy", "Lemon Squeezy"), ("polar", "Polar"), ("dodo", "Dodo Payments"), ("creem", "Creem")]

end = dt.date.fromisoformat(sys.argv[1])
out = sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else "zh"
prev = (end.replace(day=1) - dt.timedelta(days=1)).strftime("%Y-%m")
cur = end.strftime("%Y-%m")
db = sqlite3.connect(DB, uri=True)
rows = [(n, *db.execute(f"SELECT coalesce(sum(substr(first_seen,1,7)=?),0), coalesce(sum(first_seen BETWEEN ? AND ?),0) FROM sites "
                         f"WHERE {LIVE} AND platform=?", (prev, f"{cur}-01", end.isoformat(), p)).fetchone()) for p, n in NAMES]
print(rows)
pm, cm, d = int(prev[5:]), end.month, end.day
ahead = all(o > s for _, s, o in rows)
MONTH = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
T = {"zh": {"title": (f"新一代收款平台：{cm} 月过了 {d} 天，新卖家已超过 {pm} 月全月" if ahead
                      else f"新一代收款平台的新卖家：{pm} 月全月对比 {cm} 月 1–{d} 日"),
            "sub": "第一次挂上收款链接的卖家数；不含站群和建站平台默认页",
            "prev": f"{pm} 月全月", "cur": f"{cm} 月 1–{d} 日",
            "src": f"数据：DataForSEO 链接图 + 首页分类（Jev），jasonzhu.ai，{cur}"},
     "en": {"title": (f"Newer payment platforms: {MONTH[cm]} 1–{d} already beat all of {MONTH[pm]}" if ahead
                      else f"New sellers on newer payment platforms: all of {MONTH[pm]} vs {MONTH[cm]} 1–{d}"),
            "sub": "Sellers putting up their first checkout link; site networks and site-builder default pages excluded",
            "prev": f"All of {MONTH[pm]}", "cur": f"{MONTH[cm]} 1–{d}",
            "src": f"Data: DataForSEO link graph + home-page classification (Jev), jasonzhu.ai, {MONTH[end.month][:3]} {end.year}"}}[lang]
W, H, L, R, TOP, B = 1000, 520, 170, 80, 130, 60
peak = max(200, -(-max(max(s, o) for _, s, o in rows) // 200) * 200)
xv = lambda v: L + (W - L - R) * v / peak  # noqa: E731
b = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" font-family="{FONT[lang]}">', f'<rect width="{W}" height="{H}" fill="{SURFACE}"/>',
     f'<text x="40" y="44" font-size="26" font-weight="600" fill="{INK}">{T["title"]}</text>',
     f'<text x="40" y="70" font-size="14" fill="{INK2}">{T["sub"]}</text>']
lx = L
for c, lab in ((GREY, T["prev"]), (BLUE, T["cur"])):
    b += [f'<rect x="{lx}" y="{TOP - 34}" width="12" height="12" rx="2" fill="{c}"/>', f'<text x="{lx + 18}" y="{TOP - 24}" font-size="14" fill="{INK}">{lab}</text>']
    lx += 150
for v in range(0, peak + 1, 200):
    b += [f'<line x1="{xv(v):.1f}" x2="{xv(v):.1f}" y1="{TOP - 8}" y2="{H - B + 4}" stroke="{GRID}"/>',
          f'<text x="{xv(v):.1f}" y="{H - B + 22}" font-size="12" text-anchor="middle" fill="{INK2}">{v}</text>']
rh = (H - TOP - B) / len(rows)
for i, (n, s, o) in enumerate(rows):
    y0, bh = TOP + i * rh + 8, rh * 0.32
    b.append(f'<text x="{L - 14}" y="{y0 + bh + 6:.1f}" font-size="16" text-anchor="end" fill="{INK}">{n}</text>')
    for k, (v, c, bold) in enumerate(((s, GREY, ""), (o, BLUE, ' font-weight="600"'))):
        yy = y0 + k * (bh + 4)
        b += [f'<rect x="{L}" y="{yy:.1f}" width="{max(xv(v) - L, 1):.1f}" height="{bh:.1f}" rx="3" fill="{c}"/>',
              f'<text x="{xv(v) + 8:.1f}" y="{yy + bh - 5:.1f}" font-size="14" fill="{INK}"{bold}>{v:,}</text>']
b += [f'<text x="40" y="{H - 12}" font-size="12" fill="{INK2}">{T["src"]}</text>', "</svg>"]
open(out + ".svg", "w").write("\n".join(b))
subprocess.run(["rsvg-convert", "-w", "2000", "-o", out + ".png", out + ".svg"], check=True)
