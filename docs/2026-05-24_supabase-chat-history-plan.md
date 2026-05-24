# Supabase (Postgres) + Prisma でチャット履歴を永続化する実装手順

作成日: 2026-05-24

## ゴール

現状ローカル state に保持されているチャット一覧 (`chats`) とメッセージ (`messages`) を Supabase の Postgres に保存し、リロード後も会話が復元できるようにする。ORM は **Prisma** を採用。OpenAI Responses API の `previous_response_id` も chat に紐づけて保存し、文脈を維持したまま会話を再開できる状態を目指す。

## アーキテクチャ概要

- **DB**: Supabase が提供する Postgres
- **ORM**: Prisma（スキーマ管理・マイグレーション・型生成）
- **アクセス経路**: フロント → Next.js API Route → Prisma → Supabase Postgres
  - Supabase の anon キーや RLS は使わず、Prisma が直接 Postgres に接続
  - Auth が必要になった段階で API Route 側でセッション確認を行う設計

## 前提

- すでに使用中の API: OpenAI Responses (`/api/chat`)、OpenAI Image Generation (`/api/image`)
- 保持したい型:
  - `ChatItem`（`components/sidebar/sidebar.tsx`）: id / title / pinned / bucket / updatedAt
  - `Message`（`types/chat-message.ts`）: id / role / content / imageUrl? / time
- 認証: 初期実装ではシングルユーザー前提。後段で Supabase Auth or Next Auth を被せる前提でスキーマを設計する

---

## ステップ 1: Supabase プロジェクト準備

1. https://supabase.com で新規プロジェクト作成
2. Project Settings → Database → **Connection string** から以下 2 種類のURLを取得:
   - **Connection pooling (Transaction mode)** — ランタイム用（サーバーレスから多接続される前提）
   - **Direct connection** — Prisma migrate 用
3. `.env.local` に追加:
   ```
   # ランタイム用（API Route から接続）。pgbouncer 経由
   DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

   # マイグレーション用（直接接続）
   DIRECT_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
   ```
   - `DATABASE_URL` には `?pgbouncer=true&connection_limit=1` を必ず付ける（prepared statements の問題を回避）
   - `DIRECT_URL` はマイグレーション時のみ Prisma が使う

## ステップ 2: Prisma 導入

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
```

`prisma/schema.prisma` の datasource を以下に差し替え:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider     = "postgresql"
  url          = env("DATABASE_URL")
  directUrl    = env("DIRECT_URL")
}
```

## ステップ 3: スキーマ定義

`prisma/schema.prisma` にモデル追加:

```prisma
model Chat {
  id         String   @id @default(uuid()) @db.Uuid
  title      String   @default("新しいチャット")
  model      String?
  responseId String?  @map("response_id")
  pinned     Boolean  @default(false)
  bucket     String   @default("today")    // today / yesterday / lastWeek
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt  DateTime @updatedAt @map("updated_at") @db.Timestamptz()

  messages   Message[]

  @@index([updatedAt(sort: Desc)])
  @@map("chats")
}

model Message {
  id        Int      @id @default(autoincrement())
  chatId    String   @map("chat_id") @db.Uuid
  role      String   // "user" | "assistant"
  content   String   @default("")
  imageUrl  String?  @map("image_url")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz()

  chat      Chat     @relation(fields: [chatId], references: [id], onDelete: Cascade)

  @@index([chatId, createdAt])
  @@map("messages")
}
```

メモ:
- `Message.id` は `Int @id @default(autoincrement())` で DB 側採番。フロントの既存 `Message.id: number` 型と互換
- `Chat.id` は `String @db.Uuid` で UUID 採番。フロントは現状文字列 ID なのでそのまま使える
- `@updatedAt` で Prisma が自動的に `updated_at` をタッチ
- `@@map` で snake_case のテーブル名に揃える
- `onDelete: Cascade` で chat 削除時に messages も自動削除

## ステップ 4: マイグレーション

```bash
# 初回マイグレーション生成 & 反映
npx prisma migrate dev --name init_chat_history

# Prisma Client 再生成（自動でも走るが念のため）
npx prisma generate
```

`prisma/migrations/` 配下に SQL が出力され、Supabase Postgres にもテーブルが作られる。

## ステップ 5: Prisma クライアント singleton

Next.js dev server の HMR で Prisma クライアントが多重生成されるのを防ぐため、global キャッシュを噛ませる。

`lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

## ステップ 6: API Route の追加

### `app/api/chats/route.ts`

- **GET**: `prisma.chat.findMany({ orderBy: { updatedAt: "desc" } })` で chats 一覧
- **POST**: `prisma.chat.create({ data: { title: "新しいチャット", model: body.model } })` で新規作成

### `app/api/chats/[id]/route.ts`

- **PATCH**: title / pinned / bucket / responseId / model を部分更新
- **DELETE**: `prisma.chat.delete({ where: { id } })`（messages は cascade で消える）

### `app/api/chats/[id]/messages/route.ts`

- **GET**: `prisma.message.findMany({ where: { chatId: id }, orderBy: { createdAt: "asc" } })`

### `app/api/chat/route.ts`（既存・改修）

擬似コード:

```ts
const { chatId, message, model, previousResponseId } = await req.json()

// 1. ユーザーメッセージを永続化
await prisma.message.create({
  data: { chatId, role: "user", content: message },
})

// 2. OpenAI Responses API を叩く（既存ロジック）
const res = await fetch("https://api.openai.com/v1/responses", { ... })
const data = await res.json()
const replyText = data.output.find(o => o.type === "message").content[0].text

// 3. アシスタントメッセージを永続化 + chats.response_id を更新
await prisma.$transaction([
  prisma.message.create({
    data: { chatId, role: "assistant", content: replyText },
  }),
  prisma.chat.update({
    where: { id: chatId },
    data: { responseId: data.id, model },
  }),
])

return NextResponse.json({ ...data, replyText })
```

### `app/api/image/route.ts`（既存・改修）

同様に user / assistant 両方の row を INSERT。assistant 側は `imageUrl` を保存。

## ステップ 7: フロントエンド改修

### `app/home-client.tsx`

1. **初期化**: マウント時に `GET /api/chats` でサイドバーの chats を取得
2. **チャット切替** (`handleSelectChat`): `GET /api/chats/:id/messages` で messages を context にロード、`responseId` も復元
3. **新規チャット** (`handleNewChat`): `POST /api/chats` → 戻ってきた id を `currentChatId` に
4. **送信** (`handleSend`):
   - `/api/chat` または `/api/image` に `chatId` を含めて送信
   - サーバー側で永続化を完結させ、フロントは戻り値の assistant message を context に追加
5. **削除** (`handleDeleteChat`): `DELETE /api/chats/:id`
6. **ピン留め** (`handleTogglePin`): `PATCH /api/chats/:id` (`pinned`)
7. **タイトル自動更新**: 既存の useEffect 内で `PATCH /api/chats/:id` (`title`)

### `types/chat-message.ts` / `types/chat.ts`

- `Message.id` は `number` のままで OK（Prisma 側も `Int`）
- `Message.time` は表示用に保持し、API Route が `createdAt` から整形して返すか、フロント側で整形

### context (`context/context.ts`)

- 既存の `chatSettings / messages / isLoading / responseId` の意味付けは変えない
- chat 切替時に `setMessages(...)` で読み込んだメッセージ群を流し込む

## ステップ 8: time フィールドの扱い

選択肢:
- **A**: API Route が `time: format(createdAt)` を含めて返す（フロント無変更で済む）
- **B**: フロントの `Message` 型から `time` を消し、表示時に `createdAt` を整形

最小コストは A。後で本格的に時刻表示を改善するときに B へ移行。

## ステップ 9: マイグレーション・動作確認手順

1. Supabase で空プロジェクト作成 & 接続文字列取得
2. `.env.local` に DATABASE_URL / DIRECT_URL を設定
3. `npx prisma migrate dev --name init_chat_history`
4. `npx prisma studio` でテーブルが作られていることを確認
5. `npm run dev` でローカル起動
6. シナリオ:
   - 新規チャット → メッセージ送信 → リロードで復元
   - 画像生成モデルで画像送信 → リロードで `imageUrl` が復活
   - チャット切替 → 各 chat の `responseId` 経由で文脈が続く
   - 削除 → DB の messages も cascade で消えている（Prisma Studio で確認）

## ステップ 10: 将来の拡張ポイント

- **Auth**: `Chat` に `userId String @db.Uuid` を追加し、API Route 側でセッションから `userId` を取得して where 句に必ず含める設計に
- **画像の Supabase Storage 移行**: 現在は base64 data URL を `imageUrl` 列に丸ごと保存予定（行サイズが膨らむ）。生成画像を Supabase Storage に保存して URL を入れる形に変更
- **bucket の自動算出**: `today` / `yesterday` / `lastWeek` のラベル更新を DB 側の view や API Route 側のロジックで動的に算出
- **Prisma Accelerate**: コネクション数が増えるなら Prisma Accelerate でグローバルキャッシュ・プーリング

---

## 着手順チェックリスト

- [ ] Supabase プロジェクト作成
- [ ] `DATABASE_URL`（pooler）と `DIRECT_URL`（direct）を `.env.local` に設定
- [ ] `prisma` / `@prisma/client` 導入、`npx prisma init`
- [ ] `prisma/schema.prisma` に `Chat` / `Message` モデル定義
- [ ] `npx prisma migrate dev --name init_chat_history`
- [ ] `lib/prisma.ts` の singleton 作成
- [ ] `/api/chats` 一覧・新規
- [ ] `/api/chats/[id]` 更新・削除
- [ ] `/api/chats/[id]/messages` 取得
- [ ] 既存 `/api/chat` `/api/image` に Prisma 永続化を組み込み
- [ ] `app/home-client.tsx` で初期ロード・切替・新規・削除・タイトル更新の API 呼び出し
- [ ] 動作確認（リロード復元、画像メッセージ、文脈継続、cascade 削除）
