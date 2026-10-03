"""Microsoft Clarity Data Export（每项目每天最多 10 次请求，numOfDays 只能 1–3；这里一次用 2 次）

凭证：CLARITY_API_TOKEN（clarity.microsoft.com → 项目 → Settings → Data Export → Generate new API token）
"""
import requests

from common import run, save, secret

API = "https://www.clarity.ms/export-data/api/v1/project-live-insights"


def main():
    tok = secret("CLARITY_API_TOKEN", "clarity_token")
    if not tok:
        return save("clarity", {"ok": False, "skipped": True, "reason": "没配 CLARITY_API_TOKEN"})
    out = {"ok": True, "numOfDays": 3}
    for name, dim in (("overview", None), ("by_url", "URL")):
        params = {"numOfDays": 3, **({"dimension1": dim} if dim else {})}
        r = requests.get(API, params=params, headers={"Authorization": f"Bearer {tok}"}, timeout=60)
        if r.status_code == 429:
            raise RuntimeError("今天 10 次请求额度已用完")
        r.raise_for_status()
        out[name] = r.json()
    save("clarity", out)


if __name__ == "__main__":
    run("clarity", main)
