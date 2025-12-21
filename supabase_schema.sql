-- 過去のテーブルを削除
-- DROP TABLE IF EXISTS subtasks, saved_tags, todos;

-- 1. todosテーブルの作成
CREATE TABLE todos (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at BIGINT NOT NULL,
  deadline_date TEXT,
  priority INTEGER DEFAULT 1,
  tags TEXT[],
  description TEXT,
  completed_at BIGINT,
  deleted_at BIGINT
);

-- 2. subtasksテーブルの作成
CREATE TABLE subtasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0
);

-- 3. saved_tagsテーブルの作成
CREATE TABLE saved_tags (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

ALTER TABLE todos ADD COLUMN order_index INTEGER DEFAULT 0;
ALTER TABLE todos ADD COLUMN estimated_hours NUMERIC(5,2);
ALTER TABLE todos ADD COLUMN recurrence_rule TEXT;

-- データ容量の安全性確保（バリデーション制約）
ALTER TABLE todos ADD CONSTRAINT title_length CHECK (char_length(title) <= 255);
ALTER TABLE todos ADD CONSTRAINT desc_length CHECK (char_length(description) <= 10000);
ALTER TABLE subtasks ADD CONSTRAINT subtask_title_length CHECK (char_length(title) <= 255);
ALTER TABLE saved_tags ADD CONSTRAINT tag_name_length CHECK (char_length(name) <= 50);

-- 4. RLS (Row Level Security) の有効化
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_tags ENABLE ROW LEVEL SECURITY;

-- 5. ポリシーの作成 (自分のデータのみ CRUD 可能にする)

-- todos テーブルのポリシー
CREATE POLICY "Users can insert their own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- subtasks テーブルのポリシー
CREATE POLICY "Users can insert their own subtasks" ON subtasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own subtasks" ON subtasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own subtasks" ON subtasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subtasks" ON subtasks FOR DELETE USING (auth.uid() = user_id);

-- saved_tags テーブルのポリシー
CREATE POLICY "Users can insert their own tags" ON saved_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own tags" ON saved_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON saved_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON saved_tags FOR DELETE USING (auth.uid() = user_id);
