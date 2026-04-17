#!/usr/bin/env python3
"""Generate all 7 images for Article #73 via apimart API in parallel."""
import os, sys, json, time, requests, pathlib
from concurrent.futures import ThreadPoolExecutor, as_completed

API_BASE = "https://api.apimart.ai/v1"
API_KEY = "sk-FuTq0PhYpqC6yIoJnY3PoJq14y3HpZzstZE4Lz9pQvrAR2jh"
MODEL = "gemini-3.1-flash-image-preview"
OUT_DIR = pathlib.Path("/Users/zhuyansen/content/vx/cover-image/openai-agents-sdk-evolution")

IMAGES = [
    {
        "name": "cover.png",
        "aspect": "16:9",
        "prompt": """16:9 横向封面，深蓝 #0F4C81 到亮青色渐变背景，白色无衬线粗体大字居中，无任何图标符号装饰。
核心文字（中文+英文混排）：
- 主标题"OpenAI Agents SDK 大升级" 白色 超大粗体 字号90px
- 副标题"harness 和 sandbox 做进 SDK" 浅蓝色 字号48px
- 底部标签"VS Anthropic 走了完全相反的路" 橙色 字号32px
字体：思源黑体 Heavy + Inter Bold。纯渐变背景，不加任何装饰元素。"""
    },
    {
        "name": "section1-agent-loop.png",
        "aspect": "16:9",
        "prompt": """16:9 横向信息图，纯白背景。notion 极简风格，细黑描边圆角卡片，蓝色 #0F4C81 点缀。
Layout: 左右对比布局。
左侧标题"传统做法 Before"：一个大圆圈标注"Agent Loop"，下面列出需要自己搭建的组件（中文标注）：
- 接收请求
- 路由到模型
- 调用工具
- 更新上下文
- 生成响应
底部红色横幅文字"Retries, auth, state, edge cases 全归你管"。
右侧标题"Agents SDK After"：一个大圆圈标注"SDK 托管"，下面列出 SDK 预置组件：
- Agent Loop 全自动
- Built-in Tools 一键接入
- Web Search / File Search / MCP / Code Interpreter
- Skills / Remote MCP
- 100+ 非 OpenAI 模型
底部绿色横幅文字"只关注业务逻辑"。
中间一个大箭头从左指向右。
配色：白底 + 蓝 #0F4C81 + 细灰线。字体思源黑体。"""
    },
    {
        "name": "section2-harness.png",
        "aspect": "16:9",
        "prompt": """16:9 横向架构图，纯白背景。blueprint 技术蓝图风格，浅灰网格背景，蓝色 #0F4C81 线条。
Layout: 上下两个对比架构。
上方"Harness in compute（旧架构）"：
一个大矩形框标注"Sandbox"，内部嵌套三个方块：HARNESS / AGENT LOOP / MCPS-TOOLS。左边一个方块"Server/Agent Harness"通过箭头进入 Sandbox。右边标注"Gateway Service"拦截 Filesystem 和外部数据访问。
下方"Harness separate from compute（新架构）"：
HARNESS（包含 AGENT LOOP + MCPS-TOOLS）独立在左，标注"可跑在 Temporal / AWS / Azure"。
Sandbox 在右，纯执行环境，内部标注"OpenAI / E2B / Daytona / Cloudflare / Vercel / Modal / Runloop / Blaxel"。
Filesystem 标注"本地挂载 / AWS S3 / Azure Blob / GCS"。
Server 和 Sandbox 之间用蓝色箭头连接。
配色：浅灰 #F5F5F7 + 蓝 #0F4C81 + 白。字体思源黑体。"""
    },
    {
        "name": "section3-sandbox.png",
        "aspect": "16:9",
        "prompt": """16:9 横向信息图，纯白背景。minimal 极简风格，大量留白。
Layout: 中心辐射式。
中心大圆圈标注"Sandbox 抽象层 Manifest"，蓝色 #0F4C81 填充。
周围辐射 7 个小圆圈（等距分布），每个标注一家云服务商的名字：
- Blaxel
- Cloudflare
- Daytona
- E2B
- Modal
- Runloop
- Vercel
每个小圆圈用蓝色细线连接到中心。
底部三行小字说明：
"可挂载本地文件"
"连接云存储（S3 / Azure Blob / GCS）"
"换提供商不用改代码"
配色：白底 + 蓝 #0F4C81 + 深灰 #1D1D1F。字体思源黑体。"""
    },
    {
        "name": "section4-future.png",
        "aspect": "16:9",
        "prompt": """16:9 横向信息图，纯白背景。notion 风格，细黑描边圆角卡片。
Layout: 左右两个大卡片 + 顶部标签。
顶部标签"即将推出 Coming Soon"，橙色背景白字。
左侧卡片标题"Subagents 子 Agent 并发"：
- 中心一个主 Agent 图标（圆圈）
- 下方 spawn 出 3 个子 Agent（三个小圆圈）
- 每个子 Agent 标注专长："网页抓取" / "数据清洗" / "代码生成"
- 底部说明"模块化 + 可并行"
右侧卡片标题"Code Mode 专业代码能力"：
- 一个代码窗口图标
- 标注"代码执行 + 生成"
- 标注"构建 coding agent"
- 底部说明"把 Codex 能力下沉到 SDK"
两个卡片底部统一标签"Python + TypeScript 双语言支持"。
配色：白底 + 蓝 #0F4C81 + 橙 #FF6B35 点缀。字体思源黑体。"""
    },
    {
        "name": "section5-tools.png",
        "aspect": "16:9",
        "prompt": """16:9 横向信息图，纯白背景。blueprint 技术蓝图风格，浅灰网格背景。
Layout: 四宫格并列布局。
顶部大标题"新 Harness 工具集成"。
四个等大方块从左到右：
方块 1 "MCP"：子标题"Model Context Protocol"，说明"Anthropic 开放标准，OpenAI 全面采纳"
方块 2 "Skills"：子标题"渐进式披露"，说明"按需调用，不一次性加载"
方块 3 "AGENTS.md"：子标题"自定义指令载体"，说明"类似 CLAUDE.md，agent 启动自动加载"
方块 4 "apply_patch"：子标题"文件修改工具"，说明"配合 shell 工具做代码执行"
底部横幅对比：
左半"Anthropic: CLAUDE.md + Skills + Tools"
右半"OpenAI: AGENTS.md + Skills + apply_patch"
中间文字"设计哲学快速收敛"。
配色：浅灰 #F5F5F7 + 蓝 #0F4C81 + 白。字体思源黑体。"""
    },
    {
        "name": "section6-vs-anthropic.png",
        "aspect": "16:9",
        "prompt": """16:9 横向对比图，纯白背景。notion 极简风格。
Layout: 左右分栏对比。
顶部大标题"两种路线，没有优劣"。
左侧标题"Anthropic Claude Agent SDK"：
- 图标：一个工具箱
- 核心理念"给你工具箱，你自己搭"
- 特点列表：
  1. 从 Claude Code 抽出核心能力
  2. 开发者自己组装 agent loop
  3. 深度定制，完全控制执行过程
- 底部标签"适合：深度定制需求"
右侧标题"OpenAI Agents SDK"：
- 图标：一个打包好的礼物盒
- 核心理念"SDK 帮你搭好，你只管用"
- 特点列表：
  1. agent loop 做进 SDK
  2. 开发者只配置不实现
  3. 快速上手，不操心底层
- 底部标签"适合：快速上手企业团队"
中间竖线分隔，标注"VS"。
配色：白底 + 蓝 #0F4C81（左）+ 橙 #FF6B35（右）。字体思源黑体。"""
    },
]

def create_task(prompt, aspect):
    resp = requests.post(
        f"{API_BASE}/images/generations",
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        json={"model": MODEL, "prompt": prompt, "aspect_ratio": aspect},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return data["data"][0]["task_id"]

def poll_task(task_id, max_wait=300):
    start = time.time()
    while time.time() - start < max_wait:
        resp = requests.get(
            f"{API_BASE}/tasks/{task_id}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        status = data.get("data", {}).get("status")
        if status == "completed":
            return data["data"]["result"]["images"][0]["url"][0]
        if status == "failed":
            raise RuntimeError(f"Task failed: {data}")
        time.sleep(5)
    raise TimeoutError(f"Task {task_id} timed out")

def download(url, path):
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    path.write_bytes(resp.content)
    return len(resp.content)

def generate(spec):
    name = spec["name"]
    out_path = OUT_DIR / name
    if out_path.exists() and out_path.stat().st_size > 10000:
        return name, "SKIP (exists)"
    try:
        task_id = create_task(spec["prompt"], spec["aspect"])
        url = poll_task(task_id)
        size = download(url, out_path)
        return name, f"OK ({size} bytes)"
    except Exception as e:
        return name, f"FAIL: {e}"

if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=4) as ex:
        futures = {ex.submit(generate, spec): spec["name"] for spec in IMAGES}
        for fut in as_completed(futures):
            name, status = fut.result()
            print(f"[{name}] {status}", flush=True)
