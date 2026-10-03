"""站内一手数据 + 自动化管线健康

- 订阅：Supabase subscribers（只取 source / created_at，不取邮箱）+ KV 兜底队列积压
- 文章阅读：Supabase page_views 是累计计数，和上次快照（state/page_views.json，CI 用 actions/cache 带过来）做差得到当日增量
- 管线：今日快讯有没有出、提示词库每日收录、GitHub 合集同步、各 workflow 最近一次结果、线上 sitemap 条数
"""
import glob
import json
import os
import re
from collections import Counter
from datetime import datetime, timedelta

import requests

from common import CST, REPO_ROOT, STATE, run, save, secret, today_cst

WORKFLOWS = {"daily-news.yml": "快讯采集", "opus-prompts-daily.yml": "提示词库每日收录",
             "opus-prompts-refresh.yml": "提示词库每周核验", "indexnow.yml": "IndexNow 推送"}
AWESOME = "zhuyansen/awesome-opus-5.5-video"


def supa():
    url = secret("NEXT_PUBLIC_SUPABASE_URL") or secret("SUPABASE_URL")
    key = secret("SUPABASE_SERVICE_KEY") or secret("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not key:
        return None
    h = {"apikey": key, "Authorization": f"Bearer {key}"}
    return lambda path, **kw: requests.get(f"{url}/rest/v1/{path}", headers={**h, **kw.pop("headers", {})}, timeout=60, **kw)


def subscribers(get):
    since = (datetime.now(CST) - timedelta(days=29)).replace(hour=0, minute=0, second=0, microsecond=0)
    rows, off = [], 0
    while True:
        r = get("subscribers", params={"select": "source,created_at", "created_at": f"gte.{since.isoformat()}", "order": "created_at.asc",
                                       "offset": off, "limit": 1000})
        r.raise_for_status()
        batch = r.json(); rows += batch; off += len(batch)
        if len(batch) < 1000:
            break
    tot = get("subscribers", params={"select": "id", "limit": 0}, headers={"Prefer": "count=exact"})
    tot.raise_for_status()
    total = int(tot.headers.get("content-range", "*/0").split("/")[-1])
    by_day, by_src7 = Counter(), Counter()
    cut7 = today_cst() - timedelta(days=7)
    for r in rows:
        d = datetime.fromisoformat(r["created_at"].replace("Z", "+00:00")).astimezone(CST).date()
        by_day[str(d)] += 1
        if cut7 <= d < today_cst():
            by_src7[r.get("source") or "website"] += 1
    return {"total": total, "by_day": dict(by_day), "by_source7": by_src7.most_common()}


def page_views(get):
    r = get("page_views", params={"select": "slug,count,updated_at", "limit": 5000})
    r.raise_for_status()
    now = {x["slug"]: x["count"] for x in r.json()}
    snap = os.path.join(STATE, "page_views.json")
    prev = json.load(open(snap)) if os.path.exists(snap) else None
    os.makedirs(STATE, exist_ok=True)
    json.dump({"taken_at": datetime.now(CST).isoformat(timespec="minutes"), "counts": now}, open(snap, "w"))
    titles = {}
    pj = os.path.join(REPO_ROOT, "src/generated/posts.json")
    if os.path.exists(pj):
        titles = {p["slug"]: p.get("title", "") for p in json.load(open(pj))}
    out = {"total": sum(now.values()), "top_all": sorted(({"slug": k, "title": titles.get(k, ""), "count": v} for k, v in now.items()), key=lambda x: -x["count"])[:10]}
    if prev:
        delta = [{"slug": k, "title": titles.get(k, ""), "delta": v - prev["counts"].get(k, 0), "count": v} for k, v in now.items()]
        out.update(prev_taken_at=prev["taken_at"], delta_total=sum(d["delta"] for d in delta),
                   top_delta=sorted((d for d in delta if d["delta"] > 0), key=lambda x: -x["delta"])[:10])
    return out


def kv_pending(get):
    """KV 是订阅的镜像（每次订阅都双写），队列有东西不代表丢了；只报「KV 有、Supabase 没有」的条数。"""
    url, tok = secret("KV_REST_API_URL"), secret("KV_REST_API_TOKEN")
    if not url or not tok:
        return None
    r = requests.get(f"{url}/lrange/pending_subscribers/0/-1", headers={"Authorization": f"Bearer {tok}"}, timeout=30)
    r.raise_for_status()
    emails = sorted({json.loads(x)["email"].lower() for x in r.json().get("result") or []})
    present = 0
    for i in range(0, len(emails), 20):
        chunk = ",".join(f'"{e}"' for e in emails[i:i + 20])
        q = get("subscribers", params={"select": "id", "email": f"in.({chunk})"})
        q.raise_for_status()
        present += len(q.json())
    return {"queued": len(emails), "missing": len(emails) - present}


def news():
    files = sorted(glob.glob(os.path.join(REPO_ROOT, "src/content/news/*.md")))
    latest = os.path.basename(files[-1])[:-3] if files else None
    today = str(today_cst())
    items = 0
    if latest == today:
        txt = open(files[-1]).read()
        body = txt.split("### 💰")[0]
        items = len(re.findall(r"^### ", body, re.M))
    return {"today": today, "latest": latest, "published_today": latest == today, "items_today": items}


def prompt_library():
    cases = json.load(open(os.path.join(REPO_ROOT, "src/content/opus-prompts/cases.json")))["cases"]
    st = json.load(open(os.path.join(REPO_ROOT, "scripts/opus-prompts/data/state.json")))
    models = Counter(m for c in cases for m in c.get("models", []))
    # 作品数和上次日报比：手动补跑不写 state.json，用快照差值才算得准
    snap = os.path.join(STATE, "prompt_library.json")
    prev = json.load(open(snap)) if os.path.exists(snap) else None
    os.makedirs(STATE, exist_ok=True)
    json.dump({"works": len(cases), "models": dict(models)}, open(snap, "w"))
    return {"works": len(cases), "with_prompt": sum(1 for c in cases if c.get("prompt")), "models": dict(models),
            "delta": None if prev is None else len(cases) - prev["works"],
            "window_end": st.get("windowEnd"), "last_run_at": st.get("lastRunAt"), "last_run": st.get("lastRun")}


def gh(path):
    tok = secret("GITHUB_TOKEN") or secret("GH_TOKEN")
    r = requests.get(f"https://api.github.com/{path}", headers={"Accept": "application/vnd.github+json", **({"Authorization": f"Bearer {tok}"} if tok else {})}, timeout=30)
    r.raise_for_status()
    return r.json()


def workflows():
    repo = os.environ.get("GITHUB_REPOSITORY", "zhuyansen/jasonzhu.ai")
    out = []
    for f, label in WORKFLOWS.items():
        try:
            runs = gh(f"repos/{repo}/actions/workflows/{f}/runs?per_page=5").get("workflow_runs", [])
        except requests.HTTPError as e:
            out.append({"file": f, "label": label, "error": str(e)[:120]}); continue
        done = [r for r in runs if r["status"] == "completed"]
        last = done[0] if done else None
        out.append({"file": f, "label": label, "conclusion": last and last["conclusion"], "at": last and last["created_at"],
                    "url": last and last["html_url"], "recent_failures": sum(1 for r in done if r["conclusion"] == "failure")})
    return out


def awesome():
    repo = gh(f"repos/{AWESOME}")
    runs = gh(f"repos/{AWESOME}/actions/runs?per_page=3").get("workflow_runs", [])
    last = next((r for r in runs if r["status"] == "completed"), None)
    return {"stars": repo["stargazers_count"], "forks": repo["forks_count"], "pushed_at": repo["pushed_at"],
            "sync": last and {"conclusion": last["conclusion"], "at": last["created_at"]}}


def sitemap():
    blog = [p for p in glob.glob(os.path.join(REPO_ROOT, "src/content/blog/*.md")) if not p.endswith(".en.md")]
    newsn = len(glob.glob(os.path.join(REPO_ROOT, "src/content/news/*.md")))
    expected = len(blog) + newsn + 16          # 和 scripts/check-sitemap.mjs 同一个下限
    r = requests.get("https://jasonzhu.ai/sitemap.xml", timeout=60)
    actual = len(re.findall(r"<loc>", r.text)) if r.ok else 0
    return {"status": r.status_code, "urls": actual, "expected_min": expected, "ok": r.ok and actual >= expected}


def main():
    out = {"ok": True, "errors": {}}
    get = supa()
    for key, fn in (("subscribers", lambda: subscribers(get) if get else None), ("page_views", lambda: page_views(get) if get else None),
                    ("kv_pending", lambda: kv_pending(get) if get else None), ("news", news), ("prompt_library", prompt_library),
                    ("workflows", workflows), ("awesome", awesome), ("sitemap", sitemap)):
        try:
            out[key] = fn()
        except Exception as e:  # noqa: BLE001 — 单项失败只标这一项
            out[key] = None
            out["errors"][key] = f"{type(e).__name__}: {str(e)[:160]}"
    out["supabase_key"] = "service" if secret("SUPABASE_SERVICE_KEY") else ("anon" if get else None)
    save("site", out)


if __name__ == "__main__":
    run("site", main)
