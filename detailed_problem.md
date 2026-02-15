# 詳細な問題分析

## 問題の全体像

### 1. 主要な問題: pricing.tsファイルの誤った拡張子

**ファイル**: `lib/booking/pricing.ts`

このファイルは以下の理由で `.tsx` であるべきです:

1. **JSX構文を使用**: `<section>`, `<div>`, `<Card>` などのReact要素を含む
2. **'use client'ディレクティブ**: クライアントコンポーネントとして定義されている
3. **Reactコンポーネントをエクスポート**: `PricingSection` というReactコンポーネントをエクスポート

### 2. 混乱の原因

このファイルは**2つの異なる目的**で使用されています:

#### A. Reactコンポーネントとして
- `PricingSection` コンポーネントをエクスポート
- JSX構文を使用

#### B. ユーティリティ関数として
以下のファイルが `calculatePrice` 関数をインポートしようとしています:
- `app/api/reservations/route.ts`
- `components/booking/pricing-display.tsx`

**しかし、実際には `calculatePrice` 関数は `pricing.ts` に存在していません！**

### 3. 実際の問題

```typescript
// これらのインポートは失敗する（関数が存在しない）
import { calculatePrice } from '@/lib/booking/pricing'
import { calculatePrice, formatCurrency } from '@/lib/booking/pricing'
```

`pricing.ts` ファイルには以下のみが含まれています:
- `PLANS` 定数（プライベート）
- `PricingSection` コンポーネント（エクスポート）

### 4. 必要な修正

#### 修正A: ファイルを分割する（推奨）

**新しい構造**:
```
lib/booking/
  ├── pricing.tsx          # PricingSectionコンポーネント（UIコンポーネント）
  └── pricing-utils.ts     # calculatePrice, formatCurrency などのユーティリティ関数
```

または

```
lib/booking/
  └── pricing-utils.ts     # calculatePrice, formatCurrency などのユーティリティ関数

components/sections/
  └── pricing-section.tsx  # PricingSectionコンポーネント（既に存在）
```

#### 修正B: pricing.tsに不足している関数を追加

`calculatePrice` と `formatCurrency` 関数を実装する必要があります。

## 結論

現在のビルドエラーは以下の複合的な問題によるものです:

1. **拡張子の誤り**: `.ts` → `.tsx` に変更が必要
2. **関数の欠落**: `calculatePrice` と `formatCurrency` が実装されていない
3. **ファイル構造の混乱**: UIコンポーネントとユーティリティ関数が混在

これらすべてを修正することで、ビルドが成功し、`/admin/chat` ページが正常に表示されるようになります。
