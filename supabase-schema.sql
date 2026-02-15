-- ProfileLens Database Schema
-- Supabaseダッシュボードの SQL Editor で実行してください

-- 1. Departments Table (部署)
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Roles Table (役職)
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Members Table (メンバー)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  dept_id TEXT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  start_month TEXT NOT NULL, -- 'YYYY-MM' format
  yearly_budgets JSONB DEFAULT '{}'::jsonb, -- Record<string, number>
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Projects Table (プロジェクト)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('進行中', '完了', '予定')),
  start_date TEXT NOT NULL, -- 'YYYY-MM-DD' format
  end_date TEXT NOT NULL, -- 'YYYY-MM-DD' format
  member_ids JSONB DEFAULT '[]'::jsonb, -- string[]
  quarter_budgets JSONB DEFAULT '{}'::jsonb, -- Record<string, number>
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Allocations Table (配分・アサイン)
CREATE TABLE IF NOT EXISTS allocations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 'YYYY-MM' format
  hours NUMERIC NOT NULL,
  cost_rate NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスの作成(パフォーマンス向上)
CREATE INDEX IF NOT EXISTS idx_members_role_id ON members(role_id);
CREATE INDEX IF NOT EXISTS idx_members_dept_id ON members(dept_id);
CREATE INDEX IF NOT EXISTS idx_allocations_project_id ON allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_allocations_member_id ON allocations(member_id);
CREATE INDEX IF NOT EXISTS idx_allocations_month ON allocations(month);

-- Row Level Security (RLS) の有効化
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- シンプルなRLSポリシー(全員が読み書き可能)
-- ※ 将来的に認証を追加する場合は、ここを修正してください

-- Departments policies
CREATE POLICY "Enable read access for all users" ON departments FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON departments FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON departments FOR DELETE USING (true);

-- Roles policies
CREATE POLICY "Enable read access for all users" ON roles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON roles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON roles FOR DELETE USING (true);

-- Members policies
CREATE POLICY "Enable read access for all users" ON members FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON members FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON members FOR DELETE USING (true);

-- Projects policies
CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON projects FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON projects FOR DELETE USING (true);

-- Allocations policies
CREATE POLICY "Enable read access for all users" ON allocations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON allocations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON allocations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON allocations FOR DELETE USING (true);
