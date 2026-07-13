#!/bin/bash
# 给闭门讨论会视频生成中文逐字稿（本地 whisper，免费）。
# 文件清单见 scripts/sessions-final.txt
# 用法：bash scripts/transcribe-sessions.sh
# 输出：scripts/sessions-transcripts/<文件名(不含扩展名)>.txt / .srt / .vtt / .json

set -uo pipefail
cd "$(dirname "$0")/.."

SRC_DIR="/Users/zhuyansen/Desktop/闭门讨论会"
OUT_DIR="scripts/sessions-transcripts"
LIST="scripts/sessions-final.txt"
mkdir -p "$OUT_DIR"

while IFS='|' read -r date topic filename title; do
  [ -z "$date" ] && continue
  name="${filename%.*}"
  if [ -f "$OUT_DIR/${name}.srt" ]; then
    echo "── [$date] 跳过（已有）: $title"
    continue
  fi
  echo "── [$date] 转录: $title ($filename)"
  whisper "$SRC_DIR/$filename" \
    --model turbo \
    --language Chinese \
    --output_format all \
    --output_dir "$OUT_DIR" \
    --verbose False
  echo "   ✅ 完成: $title"
done < "$LIST"

echo ""
echo "全部完成，逐字稿在 $OUT_DIR"
