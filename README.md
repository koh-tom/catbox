# Catbox (キャットボックス)
---

## 概要
Catboxは、React 19, Vite, Tailwind CSS v4, そしてSupabaseを活用して構築された、高度なタスク管理（Todo）アプリケーションです。シンプルで直感的なUI（shadcn/ui）を備え、リスト表示やカレンダー表示、ドラッグ＆ドロップでの並び替え、サブタスク管理など、日々のタスクを効率的に整理・管理するための豊富な機能を提供します。

## 主な機能
- **セキュアなユーザー認証**: Supabase Authを利用した安全なログイン。
- **高度なタスクプロパティ**: タスク名、詳細説明メモ、優先度、期限日の指定、見積もり時間、繰り返しルール（Recurrence）などを作成できます。
- **サブタスク管理**: 1つのタスクに複数のサブタスクを紐付け、進捗を可視化。
- **多様なビュー**:
  - **リストビュー**: `@hello-pangea/dnd`を利用した、ドラッグ＆ドロップによる直感的な並べ替え。
  - **カレンダービュー**: 期限日ベースでカレンダー上にタスクを表示（`react-day-picker`）。
- **タグ機能**: カスタムカラーを持つ独自のタグを作成し、タスクのカテゴライズが可能。
- **ゴミ箱機能**: 誤って削除したタスクのリカバーや完全な削除が可能なセーフティネット。
- **データエクスポート機能**: 登録されているタスク情報をJSON形式やCSV形式（Excel対応エンコーディング）で一括出力。
- **UI/UXの最適化**: 
  - ダークモードとライトモードのシームレスな切り替えをサポート。
  - `⌘K` によるクイックなタスク内検索。
  - Sonnerを用いたスムーズなトースト通知。

## 技術スタック
- **Frontend Framework**: React 19, TypeScript, Vite (SWC)
- **UI & Styling**: Tailwind CSS v4, shadcn/ui, Radix UI, Lucide Icons
- **Routing**: React Router DOM (v7)
- **Backend / BaaS**: Supabase (Database, Auth)
- **Drag & Drop**: @hello-pangea/dnd
- **Date Handling**: date-fns
- **Development Tooling**: Biome (Linter / Formatter), Husky, commitlint, commitizen

## 開発環境のセットアップ

### 1. リポジトリのクローンと依存関係のインストール
当プロジェクトではパッケージマネージャーに `Bun` (または `npm`) が利用できます。

```bash
git clone <repository-url>
cd catbox
bun install
```

### 2. 環境変数の設定
`.env.example` を参考に、ローカルの `.env` ファイルを作成し、Supabaseのクレデンシャル情報を設定してください。

```bash
cp .env.example .env
```
`.env` ファイルの設定例:
```env
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 3. データベースの構築 (Supabase)
プロジェクトルートにある `supabase_schema.sql` をSupabaseダッシュボードのSQLエディタで実行してください。
このスキーマファイルにより以下の構成が自動セットアップされます。
- `todos`（タスク）, `subtasks`（サブタスク）, `saved_tags`（タグ）テーブルの構築。
- Row Level Security (RLS) の有効化と、各ユーザーが自身のデータのみを安全に読み書きできるポリシーの適用。

### 4. 開発サーバーの立ち上げ
```bash
bun run dev
```
ブラウザで、ターミナルに表示されたローカルホストのアドレス（通常 `http://localhost:5173`）にアクセスしてください。

## スクリプトコマンド
- `bun run dev` : 開発サーバーの起動。
- `bun run build` : TypeScriptの型チェックと本番用ビルドの出力。
- `bun run lint` : Biomeによる静的解析（Lint）。
- `bun run format` : Biomeによるコードフォーマット。
- `bun run check` : BiomeによるLintおよびFormatの自動修正。
- `bun run cz` : commitizenを利用した対話的なコミットメッセージの作成。
