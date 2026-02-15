import { createClient } from '@supabase/supabase-js';

// 環境変数から取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabaseクライアントの作成（シングルトン）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義（data.tsと同じ構造）
export interface Department {
  id: string;
  name: string;
  created_at?: string;
}

export interface Role {
  id: string;
  name: string;
  created_at?: string;
}

export interface Member {
  id: string;
  last_name: string;
  first_name: string;
  role_id: string;
  dept_id: string;
  start_month: string;
  yearly_budgets?: Record<string, number>;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: '進行中' | '完了' | '予定';
  start_date: string;
  end_date: string;
  member_ids?: string[];
  quarter_budgets?: Record<string, number>;
  created_at?: string;
}

export interface Allocation {
  id: string;
  project_id: string;
  member_id: string;
  month: string;
  hours: number;
  cost_rate: number;
  created_at?: string;
}
