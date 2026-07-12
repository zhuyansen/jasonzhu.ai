#!/bin/bash
# 监控视频上传进度，每新传好一集就自动重新生成 course.json 并提交推送，
# 不用等全部 7 集传完才能上线——已经传好的集数立刻能播。
set -uo pipefail
cd "$(dirname "$0")/.."

MANIFEST="scripts/course-videos-manifest.jsonl"
TMP="$MANIFEST.tmp"
last_count=1  # 第1集已经手动同步过了

while true; do
  sleep 180
  src="$MANIFEST"
  [ -f "$src" ] || src="$TMP"
  [ -f "$src" ] || continue

  count=$(wc -l < "$src" | tr -d ' ')
  if [ "$count" -gt "$last_count" ]; then
    echo "── 检测到新完成 $((count - last_count)) 集，同步上线"
    node scripts/generate-course.mjs
    git add scripts/generate-course.mjs src/generated/course.json 2>/dev/null
    if ! git diff --cached --quiet; then
      git commit -m "chore(club): 课程页同步上线第 $count 集（自动）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" --quiet
      git pull --rebase --autostash --quiet && git push --quiet && echo "   ✅ 已推送"
    fi
    last_count=$count
  fi

  # manifest（非 tmp）出现说明全部传完，退出监控
  if [ -f "$MANIFEST" ]; then
    echo "全部 7 集上传完成，监控结束"
    node scripts/generate-course.mjs
    git add scripts/generate-course.mjs src/generated/course.json 2>/dev/null
    if ! git diff --cached --quiet; then
      git commit -m "chore(club): 课程页全部 7 集上线（自动）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>" --quiet
      git pull --rebase --autostash --quiet && git push --quiet && echo "   ✅ 已推送"
    fi
    break
  fi
done
