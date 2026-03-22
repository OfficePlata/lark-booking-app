# Lark予約アプリの問題解決ガイド

この度はご連絡いただきありがとうございます。
`https://lark-booking-app.pages.dev/admin/chat` が開けない問題について調査しましたところ、プロジェクトのビルドプロセスに根本的な原因があることが判明しました。以下に、問題の原因、具体的な修正手順、そして今後の開発に役立つコードの構造解説をまとめました。

## 1. 問題の根本原因

現在、ウェブサイトにアクセスすると「404 Page Not Found」エラーが表示されます。これは、サイトを構築（ビルド）する過程でエラーが発生し、`/admin/chat` を含む多くのページが正しく生成されていないためです。

ビルドエラーの根本原因は、`lib/booking/pricing.ts` というファイルにあります。このファイルには2つの大きな問題が混在しています。

1.  **ファイルの拡張子が間違っている**: このファイルには、ウェブページの見た目を作るためのコード（JSX）が含まれています。しかし、ファイル名が `.ts` となっているため、システムがこれを正しく認識できず、エラーを引き起こしています。
2.  **ファイルの内容が間違っている**: 本来このファイルには、宿泊料金を計算するための重要な関数 (`calculatePrice` など) が含まれているべきです。しかし、現状では料金表示用のUIコンポーネント (`PricingSection`) が配置されており、料金計算をしようとする他のファイルが必要な関数を見つけられずにエラーとなっています。

これらの問題が原因でビルドが正常に完了せず、結果としてページが表示されない状態になっていました。

## 2. 具体的な修正手順

ご自身で修正できるよう、ターミナル（黒い画面）で実行するコマンドを順番に記載します。以下の手順に従って操作することで、問題を解決できます。

### ステップ1: プロジェクトのルートディレクトリに移動

まず、お使いのPCでターミナルを開き、このプロジェクトのフォルダに移動してください。

```bash
# このコマンドはご自身の環境に合わせてパスを変更してください
cd path/to/your/lark-booking-app
```

### ステップ2: 料金計算ロジックを復元

現在の `pricing.ts` はUIコンポーネントで上書きされてしまっているため、過去の正常なバージョンから料金計算ロジックを復元します。

```bash
# 以前の正しいファイル内容を復元して上書きします
git show 5bb4b2e:lib/booking/pricing.ts > lib/booking/pricing.ts
```

### ステップ3: UIコンポーネントを正しい場所へ移動

次に、料金表示UIコンポーネント (`PricingSection`) を、本来あるべき `components/sections` ディレクトリに移動させます。ファイル名も `.tsx` に変更します。

```bash
# pricing-section.tsx というファイルを作成し、コンポーネントを配置します
cat << EOL > components/sections/pricing-section.tsx
'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// 料金プランの定義
const PLANS = [
  {
    name: '基本プラン',
    description: '最大6名様まで一棟貸切',
    price: '¥18,000~',
    unit: '/泊 (2名様)',
    features: [
      '一棟完全貸切',
      'Wi-Fi / 電源完備',
      'キッチン / 調理器具利用可',
      'アメニティ完備',
      '駐車場あり (2台)',
    ],
    buttonText: '予約する',
    href: '#booking',
    popular: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
          宿泊料金
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          シンプルでわかりやすい料金体系。連泊するほどお得になります。
        </p>
      </div>
      
      <div className="grid w-full justify-center gap-8 pt-8 md:grid-cols-1 lg:max-w-3xl lg:mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.popular ? 'border-primary shadow-lg relative' : ''}>
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                人気プラン
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm font-semibold text-muted-foreground">{plan.unit}</span>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <p>※3名様以上は +¥5,000/名</p>
                <p>※連泊割引あり（2泊で単価¥15,000、3泊以上で¥12,000）</p>
              </div>
              
              <ul className="mt-8 space-y-3 text-left">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild size="lg">
                <Link href={plan.href}>{plan.buttonText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
EOL
```

### ステップ4: インポートパスの修正

トップページ (`app/page.tsx`) が、移動した `PricingSection` コンポーネントを読み込めるように、参照先を更新します。

```bash
# app/page.tsx ファイル内のインポート文を修正します
sed -i "s|from '@/lib/booking/pricing'|from '@/components/sections/pricing-section'|" app/page.tsx
```

### ステップ5: 動作確認

以上の修正が完了したら、ローカル環境でアプリケーションを起動して、すべてのページが正しく表示されるか確認してください。

```bash
# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

ブラウザで `http://localhost:3000` と `http://localhost:3000/admin/chat` にアクセスし、ページが正常に表示されれば修正は完了です。

## 3. コードの階層と役割の解説

この機会に、プロジェクト全体のフォルダ構造と各ファイルの役割についてご説明します。今後の開発やメンテナンスの参考になれば幸いです。

| パス (フォルダ / ファイル) | 役割と概要 |
| :--- | :--- |
| **`app/`** | **アプリケーションの主要部分**。URLのパスとフォルダ構成が連動しています。 |
| `app/page.tsx` | トップページ (`/`) の本体です。ヒーローセクションや予約セクションなどを組み合わせています。 |
| `app/layout.tsx` | 全ページ共通の骨格となるファイル。フォント設定や基本的なHTML構造を定義します。 |
| `app/admin/chat/page.tsx` | **今回問題となった管理者用チャットページ** (`/admin/chat`) の本体です。 |
| `app/api/` | **サーバーサイドの処理**を担当するAPIエンドポイントです。データベースとの連携などを行います。 |
| **`components/`** | **再利用可能なUI部品（コンポーネント）** を格納する場所です。 |
| `components/ui/` | ボタンやカードなど、基本的なデザイン部品が格納されています。 (例: `button.tsx`, `card.tsx`) |
| `components/booking/` | 予約機能に関連する、少し複雑なコンポーネント群です。 (例: `booking-calendar.tsx`) |
| `components/sections/` | ヒーローセクションなど、ページを構成する大きな単位のコンポーネントです。 |
| `components/admin/` | 管理者画面専用のコンポーネントです。 (例: `mail-chat-interface.tsx`) |
| **`lib/`** | **補助的な機能やビジネスロジック**を格納する場所です。UIとは直接関係ない処理をまとめます。 |
| `lib/booking/pricing.ts` | **宿泊料金の計算ロジック**を担うファイルです。今回の修正で本来の役割に戻りました。 |
| `lib/lark.ts` | 外部サービスであるLarkとのデータ連携（予約情報の取得など）を担当します。 |
| `lib/utils.ts` | プロジェクト全体で使われる共通の便利関数などを格納します。 |
| **`public/`** | 画像やフォントなど、一般に公開される静的ファイルを格納する場所です。 |
| `package.json` | プロジェクトが利用するライブラリ（依存関係）の一覧が記載されています。 |
| `next.config.mjs` | Next.js（このアプリのフレームワーク）の動作設定をカスタマイズするファイルです。 |

### ファイル間の連携の例

1.  ユーザーがトップページ (`app/page.tsx`) を開く。
2.  `app/page.tsx` は、予約セクション (`components/sections/booking-section.tsx`) を呼び出す。
3.  予約セクションは、予約フォーム (`components/booking/booking-form.tsx`) を表示する。
4.  ユーザーが日付を選択すると、予約フォームは料金計算ロジック (`lib/booking/pricing.ts`) を使って料金を算出し、料金表示コンポーネント (`components/booking/pricing-display.tsx`) に結果を表示する。

このように、各ファイルがそれぞれの役割に専念し、連携することでアプリケーション全体が機能しています。

ご不明な点がございましたら、お気軽に追加でご質問ください。
