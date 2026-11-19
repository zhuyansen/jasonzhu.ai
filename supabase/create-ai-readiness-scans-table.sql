-- AI 网站急诊室 & 第 1 课通关游戏：用户域名检测记录表
-- 用于沉淀所有来 jasonzhu.ai 做 AI 可见度体检的独立站域名、总分、等级、各关得分、失败项与完整报告。
-- 服务端通过 SUPABASE_SERVICE_KEY 写入与聚合统计（绕过 RLS），不向 anon 暴露原始明细。

CREATE TABLE IF NOT EXISTS ai_readiness_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  final_url TEXT,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  grade TEXT NOT NULL,
  label TEXT,
  category_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  failed_checks TEXT[] NOT NULL DEFAULT '{}',
  passed_checks TEXT[] NOT NULL DEFAULT '{}',
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT DEFAULT 'ai-clinic-game',
  lang TEXT DEFAULT 'zh',
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 按域名查历史体检记录与进步曲线
CREATE INDEX IF NOT EXISTS idx_ai_readiness_scans_domain
  ON ai_readiness_scans (domain, created_at DESC);

-- 按分数查高分名人堂（Grade A 榜单）
CREATE INDEX IF NOT EXISTS idx_ai_readiness_scans_score
  ON ai_readiness_scans (score DESC, created_at DESC);

-- 按时间统计接诊总量与高频病因
CREATE INDEX IF NOT EXISTS idx_ai_readiness_scans_created_at
  ON ai_readiness_scans (created_at DESC);

-- 开启 RLS：只允许服务端 SUPABASE_SERVICE_KEY 读写，禁止前端 anon key 直接拖库
ALTER TABLE ai_readiness_scans ENABLE ROW LEVEL SECURITY;
