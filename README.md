# Stay Yokaban — 宿泊予約システム

**Lark Base × Next.js で構築された、一棟貸切宿のオンライン予約プラットフォーム**

鹿児島市天文館エリアに位置する「Stay Yokaban」の宿泊予約を、Web 上で完結させるフルスタック・アプリケーションです。バックエンドのデータベースとして **Lark Base（多維表格）** を採用し、予約の自動登録には **Lark Automation（自動化ワークフロー）** を活用しています。フロントエンドは Next.js 16 + React 19 で構築され、Cloudflare Pages にデプロイされます。

---

## 目次

1. [システム概要](#システム概要)
2. [技術スタック](#技術スタック)
3. [アーキテクチャ](#アーキテクチャ)
4. [ディレクトリ構成](#ディレクトリ構成)
5. [Lark Base テーブル設計](#lark-base-テーブル設計)
6. [主要機能](#主要機能)
7. [料金体系](#料金体系)
8. [環境変数](#環境変数)
9. [セットアップ手順](#セットアップ手順)
10. [デプロイ](#デプロイ)
11. [Lark Automation の設定](#lark-automation-の設定)

---

## システム概要

Stay Yokaban 予約システムは、宿泊施設オーナーが **Lark（ラーク）** のスプレッドシート画面だけで予約・料金・決済を一元管理できることを目指して設計されています。ゲストは Web サイトからカレンダーで空室を確認し、予約リクエストを送信します。リクエストは Lark Automation を経由して自動的に Lark Base のテーブルに登録され、オーナーは Lark 上で予約状況を確認・管理できます。

### データフロー

```
ゲスト（ブラウザ）
  │
  ├─ GET /api/rates ──────────────► Lark Base [SPECIAL_RATES]
  ├─ GET /api/reservations ───────► Lark Base [RESERVATIONS]
  │
  └─ POST /api/reservations ──┐
                               │  1. バリデーション
                               │  2. 料金再計算（サーバーサイド）
                               │  3. 決済URL取得 ──► Lark Base [PAYMENT_MASTERS]
                               │  4. Webhook送信 ──► Lark Automation
                               │                      └─► Lark Base [RESERVATIONS] にレコード追加
                               │
                               └─► レスポンス返却
```

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|---|---|---|
| フレームワーク | Next.js (App Router) | 16.0.10 |
| UI ライブラリ | React | 19.2.0 |
| スタイリング | Tailwind CSS + shadcn/ui | 4.x |
| フォーム管理 | React Hook Form + Zod | 7.x / 3.x |
| カレンダー | react-day-picker | 9.8.0 |
| データベース | Lark Base（多維表格） | — |
| 自動化 | Lark Automation（Webhook） | — |
| 決済 | AirPAY（決済リンク方式） | — |
| デプロイ | Cloudflare Pages (Edge Runtime) | — |
| 多言語 | 独自 i18n Context（日本語 / 英語） | — |

---

## アーキテクチャ

本システムは **外部データベースを持たず、Lark Base をデータストアとして利用する** 点が最大の特徴です。

```
┌──────────────────────────────────────────────────────┐
│                  Cloudflare Pages                     │
│                                                      │
│  ┌────────────┐    ┌──────────────────────────────┐  │
│  │  Frontend   │    │   API Routes (Edge Runtime)   │  │
│  │  React 19   │───►│                              │  │
│  │  Next.js 16 │    │  /api/reservations           │  │
│  │  Tailwind 4 │    │  /api/rates                  │  │
│  │  shadcn/ui  │    │  /api/availability           │  │
│  └────────────┘    └──────────┬───────────────────┘  │
│                               │                      │
└───────────────────────────────┼──────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │      Lark Platform     │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │   Lark Base     │  │
                    │  │  (多維表格)      │  │
                    │  │                 │  │
                    │  │  RESERVATIONS   │  │
                    │  │  SPECIAL_RATES  │  │
                    │  │  PAYMENT_MASTERS│  │
                    │  └─────────────────┘  │
                    │                       │
                    │  ┌─────────────────┐  │
                    │  │ Lark Automation │  │
                    │  │  (Webhook受信)   │  │
                    │  │  → レコード追加  │  │
                    │  └─────────────────┘  │
                    └───────────────────────┘
```

### なぜ Lark Base なのか

従来の宿泊予約システムでは PostgreSQL や MySQL などの RDB を別途運用する必要がありますが、本システムでは Lark Base を採用することで以下のメリットを実現しています。

1. **データベース運用コストゼロ** — サーバーの管理、バックアップ、スケーリングが不要
2. **スプレッドシート感覚の管理画面** — オーナーが Lark の UI から直接データを閲覧・編集可能
3. **Lark Automation との統合** — Webhook 受信 → レコード追加を Lark 内で完結
4. **カレンダービュー** — Lark Base のカレンダービューで予約状況を視覚的に把握

---

## ディレクトリ構成

```
lark-booking-app/
├── app/
│   ├── api/
│   │   ├── availability/route.ts   # 空室情報API
│   │   ├── rates/route.ts          # 特別料金API
│   │   └── reservations/route.ts   # 予約API（GET/POST）
│   ├── admin/chat/page.tsx          # 管理画面（メールチャットUI）
│   ├── globals.css                  # グローバルスタイル
│   ├── layout.tsx                   # ルートレイアウト
│   └── page.tsx                     # トップページ
├── components/
│   ├── admin/
│   │   └── mail-chat-interface.tsx   # メール対応チャットUI
│   ├── booking/
│   │   ├── booking-calendar.tsx      # 予約カレンダー
│   │   ├── booking-form.tsx          # 予約フォーム
│   │   └── pricing-display.tsx       # 料金内訳表示
│   ├── layout/
│   │   ├── header.tsx                # ヘッダー
│   │   └── footer.tsx                # フッター
│   ├── sections/
│   │   ├── hero-section.tsx          # ヒーローセクション
│   │   ├── booking-section.tsx       # 予約セクション
│   │   └── pricing-section.tsx       # 料金プランセクション
│   └── ui/                           # shadcn/ui コンポーネント群
├── lib/
│   ├── booking/
│   │   ├── pricing.ts               # 料金計算ロジック
│   │   └── restrictions.ts          # 予約制限ロジック
│   ├── i18n/
│   │   ├── context.tsx              # 多言語Contextプロバイダー
│   │   └── translations.ts         # 翻訳辞書（日本語/英語）
│   ├── email.ts                     # メール送信ユーティリティ
│   ├── lark.ts                      # Lark Base API通信ライブラリ
│   ├── lark-webhook.ts             # Lark Webhook通知ライブラリ
│   └── utils.ts                     # 汎用ユーティリティ
├── next.config.mjs
├── package.json
└── tsconfig.json
```

---

## Lark Base テーブル設計

### RESERVATIONS テーブル

予約データを管理するメインテーブルです。Lark Automation が Webhook 経由で自動的にレコードを追加します。

| フィールド名 | 型 | 説明 |
|---|---|---|
| reservationId | テキスト | 予約ID（例: `RES-1234567890-ABC123`） |
| guestName | テキスト | ゲスト名 |
| email | テキスト | メールアドレス |
| checkInDate | 日付 | チェックイン日 |
| checkOutDate | 日付 | チェックアウト日 |
| numberOfNights | 数値 | 宿泊数 |
| numberOfGuests | 数値 | 人数 |
| totalAmount | 数値 | 合計金額 |
| paymentStatus | テキスト | 支払状況（Pending / Paid） |
| paymentMethod | テキスト | 支払方法（AirPAY） |
| paymentUrl | URL | 決済URL |
| status | テキスト | 予約ステータス（Confirmed） |
| 予約不可日 | 日付 | オーナー手動設定の予約不可日 |

### SPECIAL_RATES テーブル

繁忙期や特定期間の特別料金を管理します。

| フィールド名 | 型 | 説明 |
|---|---|---|
| Name | テキスト | 料金名（例: ゴールデンウィーク料金） |
| Start Date | 日付 | 適用開始日 |
| End Date | 日付 | 適用終了日 |
| Price per Night | 数値 | 1泊あたりの料金 |
| Priority | 数値 | 優先度（重複時に高い方を適用） |

### PAYMENT_MASTERS テーブル

金額ごとの AirPAY 決済URLを管理します。

| フィールド名 | 型 | 説明 |
|---|---|---|
| Amount | 数値 | 決済金額 |
| Payment URL | URL | AirPAY 決済URL |

---

## 主要機能

### 1. 予約カレンダー

`react-day-picker` をベースにしたカスタムカレンダーコンポーネントです。Lark Base から取得した予約済み日付とオーナー手動設定の予約不可日をリアルタイムで反映し、ゲストが選択できない日付をグレーアウト表示します。チェックイン日を選択すると、チェックアウト日の選択モードに自動遷移します。

### 2. 動的料金計算

宿泊数に応じた連泊割引と、Lark Base の SPECIAL_RATES テーブルに登録された特別料金を組み合わせて、日ごとの料金を動的に計算します。計算はフロントエンド（プレビュー表示用）とサーバーサイド（確定用）の両方で実行され、改ざんを防止しています。

### 3. Lark Base 連携

Lark の Tenant Access Token を自動取得・キャッシュし、Lark Base API を通じてテーブルデータの読み取りを行います。トークンは有効期限の5分前まで再利用され、API コール数を最小化しています。

### 4. Lark Automation 連携

予約作成時は Lark Base API で直接レコードを追加するのではなく、Lark Automation の Webhook にデータを送信します。Lark Automation が「Webhook を受信したとき」トリガーで起動し、「レコードを追加」ステップで RESERVATIONS テーブルに自動登録します。この設計により、Lark 側のビジネスロジック（通知、承認フローなど）を柔軟に追加できます。

### 5. AirPAY 決済連携

PAYMENT_MASTERS テーブルに金額と決済URLのマッピングを登録しておくことで、予約の合計金額に応じた決済リンクを自動的に取得します。ゲストへの決済リンク送付はオーナーが手動で行う運用です。

### 6. 多言語対応（i18n）

React Context ベースの独自 i18n システムにより、日本語と英語の切り替えに対応しています。翻訳辞書は `lib/i18n/translations.ts` に集約され、ヘッダーの言語切替ボタンでリアルタイムに切り替わります。

### 7. メール通知

予約リクエスト受付時に、ゲストへ確認メールを送信する機能を備えています（EMAIL_API_URL / EMAIL_API_KEY の設定が必要）。メール送信の失敗は予約処理自体を失敗させない設計です。

---

## 料金体系

料金計算ロジックは `lib/booking/pricing.ts` に集約されています。

| 宿泊パターン | 1泊あたりの料金（2名） |
|---|---|
| 1泊 | ¥18,000 |
| 2連泊 | ¥15,000 |
| 3連泊以上 | ¥12,000 |

追加人数料金は1名あたり ¥6,000/泊ですが、現在は最大2名までの受付となっています（3名以上は準備中）。特別料金が設定されている期間は、上記の連泊割引に代わって SPECIAL_RATES テーブルの料金が適用されます。

---

## 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `LARK_APP_ID` | Yes | Lark アプリケーション ID |
| `LARK_APP_SECRET` | Yes | Lark アプリケーション シークレット |
| `LARK_BASE_ID` | Yes | Lark Base のアプリ ID |
| `LARK_TABLE_ID_RESERVATIONS` | Yes | RESERVATIONS テーブル ID |
| `LARK_SPECIAL_RATES_TABLE_ID` | Yes | SPECIAL_RATES テーブル ID |
| `LARK_PAYMENT_MASTERS_TABLE_ID` | Yes | PAYMENT_MASTERS テーブル ID |
| `LARK_WEBHOOK_URL` | Yes | Lark Automation の Webhook URL |
| `EMAIL_API_URL` | No | メール送信 API の URL |
| `EMAIL_API_KEY` | No | メール送信 API のキー |

---

## セットアップ手順

### 前提条件

- Node.js 22 以上
- pnpm
- Lark アカウント（Lark Base、Lark Automation が利用可能なプラン）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/OfficePlata/lark-booking-app.git
cd lark-booking-app

# 依存パッケージのインストール
pnpm install

# 環境変数の設定
cp .env.example .env.local
# .env.local を編集して各変数を設定

# 開発サーバーの起動
pnpm dev
```

開発サーバーは `http://localhost:3000` で起動します。

---

## デプロイ

本アプリケーションは **Cloudflare Pages** にデプロイされます。API Routes は Edge Runtime で動作するため、Cloudflare Workers との互換性があります。

```bash
# ビルド
pnpm build
```

Cloudflare Pages のダッシュボードで GitHub リポジトリを接続し、以下のビルド設定を行います。

| 設定項目 | 値 |
|---|---|
| ビルドコマンド | `npx @cloudflare/next-on-pages` |
| 出力ディレクトリ | `.vercel/output/static` |
| Node.js バージョン | 22 |

環境変数は Cloudflare Pages のダッシュボードから設定してください。

---

## Lark Automation の設定

予約データの自動登録には、Lark Automation で以下のワークフローを作成する必要があります。

### ワークフロー構成

1. **トリガー**: 「Webhook を受信したとき」
   - データ構造: 「手動で作成」を選択
   - JSON スキーマに以下のフィールドを定義:
     ```json
     {
       "reservationId": "string",
       "guestName": "string",
       "email": "string",
       "checkInDate": "string",
       "checkOutDate": "string",
       "numberOfNights": "number",
       "numberOfGuests": "number",
       "totalAmount": "number",
       "paymentStatus": "string",
       "paymentMethod": "string",
       "paymentUrl": "string",
       "status": "string"
     }
     ```

2. **アクション**: 「レコードを追加」
   - 対象テーブル: RESERVATIONS
   - フィールドマッピング: 各フィールドに「ステップ 1 で送信されたリクエストの戻り値」から対応する変数を選択

### Webhook URL の取得

Lark Automation のワークフローを保存すると、Webhook URL が発行されます。この URL を環境変数 `LARK_WEBHOOK_URL` に設定してください。

---

## ライセンス

Private — All rights reserved.
