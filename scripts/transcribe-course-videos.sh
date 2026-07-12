#!/bin/bash
# 给 GoSail Club 增长视频课的 7 个视频生成中文逐字稿（本地 whisper，免费）。
# 文件清单见 scripts/course-videos-final.txt
# 用法：bash scripts/transcribe-course-videos.sh
# 输出：scripts/course-transcripts/<文件名(不含扩展名)>.txt / .srt / .vtt / .json

set -uo pipefail
cd "$(dirname "$0")/.."

SRC_DIR="/Users/zhuyansen/Desktop/x增长"
OUT_DIR="scripts/course-transcripts"
LIST="scripts/course-videos-final.txt"
mkdir -p "$OUT_DIR"

while IFS='|' read -r order filename title; do
  [ -z "$order" ] && continue
  name="${filename%.*}"
  if [ -f "$OUT_DIR/${name}.srt" ]; then
    echo "── [$order] 跳过（已有）: $title"
    continue
  fi
  echo "── [$order] 转录: $title ($filename)"
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
