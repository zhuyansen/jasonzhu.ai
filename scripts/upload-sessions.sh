#!/bin/bash
# 上传闭门讨论会视频到 Cloudflare Stream（tus 断点续传）。
# 清单+日期+主题+标题见 scripts/sessions-final.txt（日期|主题|文件名|标题）
#
# 用法：bash scripts/upload-sessions.sh
# 结果写入 scripts/sessions-manifest.jsonl（一行一个视频：date/topic/file/filename/title/uid/status）

set -uo pipefail
cd "$(dirname "$0")/.."

CF_ACCOUNT_ID=$(grep "^CLOUDFLARE_STREAM_ACCOUNT_ID=" .env.local | cut -d= -f2-)
CF_API_TOKEN=$(grep "^CLOUDFLARE_STREAM_API_TOKEN=" .env.local | cut -d= -f2-)
SRC_DIR="/Users/zhuyansen/Desktop/闭门讨论会"
MANIFEST="scripts/sessions-manifest.jsonl"
TUS_VENV="/tmp/tus-venv"
LIST="scripts/sessions-final.txt"

if [ -z "$CF_ACCOUNT_ID" ] || [ -z "$CF_API_TOKEN" ]; then
  echo "缺 Cloudflare 凭据，检查 .env.local" >&2
  exit 1
fi
if [ ! -x "$TUS_VENV/bin/tus-upload" ]; then
  echo "tus-upload 未安装" >&2
  exit 1
fi

: > "$MANIFEST.tmp"

upload_one() {
  local date="$1" topic="$2" filename="$3" title="$4"
  local file="$SRC_DIR/$filename"
  echo "── [$date] 上传: $title ($filename)"

  local out
  out=$("$TUS_VENV/bin/tus-upload" --chunk-size 52428800 \
    --header Authorization "Bearer $CF_API_TOKEN" \
    "$file" \
    "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/stream" 2>&1)

  local uid
  uid=$(echo "$out" | grep -oE '/media/[a-f0-9]{32}' | head -1 | sed 's#/media/##')

  if [ -n "$uid" ]; then
    echo "   ✅ uid=$uid"
    python3 - "$date" "$topic" "$file" "$filename" "$title" "$uid" >> "$MANIFEST.tmp" <<'PYEOF'
import json, sys
date, topic, file_path, filename, title, uid = sys.argv[1:7]
print(json.dumps({"date": date, "topic": topic, "file": file_path, "filename": filename, "title": title, "uid": uid, "status": "ok"}, ensure_ascii=False))
PYEOF
    curl -sS --max-time 20 -X POST \
      "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/stream/$uid" \
      -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" \
      -d "$(python3 -c 'import json,sys; print(json.dumps({"meta":{"name":sys.argv[1]}}))' "$title")" > /dev/null
  else
    echo "   ❌ 失败:"
    echo "$out" | tail -10
    python3 - "$date" "$topic" "$file" "$filename" "$title" >> "$MANIFEST.tmp" <<'PYEOF'
import json, sys
date, topic, file_path, filename, title = sys.argv[1:6]
print(json.dumps({"date": date, "topic": topic, "file": file_path, "filename": filename, "title": title, "uid": None, "status": "failed"}, ensure_ascii=False))
PYEOF
  fi
}

while IFS='|' read -r date topic filename title; do
  [ -z "$date" ] && continue
  upload_one "$date" "$topic" "$filename" "$title"
done < "$LIST"

mv "$MANIFEST.tmp" "$MANIFEST"
echo ""
echo "全部完成，结果见 $MANIFEST"
