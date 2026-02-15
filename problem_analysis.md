# 問題の根本原因

## 発見された問題

`lib/booking/pricing.ts` ファイルに**TypeScriptパースエラー**が発生しており、これがビルド全体を失敗させています。

### エラーの詳細

```
Error: Turbopack build failed with 1 errors:
./lib/booking/pricing.ts:30:14
Parsing ecmascript source code failed
Expected '>', got 'id'
```

### 根本原因

`lib/booking/pricing.ts` ファイルは、実際には**Reactコンポーネント**（JSX/TSXを含む）であるにもかかわらず、`.ts` 拡張子で保存されています。

- **現在の拡張子**: `pricing.ts`
- **正しい拡張子**: `pricing.tsx`

TypeScriptコンパイラは `.ts` ファイルではJSX構文を認識できないため、`<section>` などのJSXタグをパースできずにエラーになっています。

### 影響範囲

このビルドエラーにより、プロジェクト全体がビルドできず、結果として `/admin/chat` を含む**すべてのページ**が404エラーになっています。

## 解決方法

`lib/booking/pricing.ts` を `lib/booking/pricing.tsx` にリネームする必要があります。

### 修正手順

1. ファイルをリネーム:
   ```bash
   mv lib/booking/pricing.ts lib/booking/pricing.tsx
   ```

2. このファイルをインポートしている他のファイルのインポート文を更新（もし拡張子を明示的に指定している場合）

3. ビルドを実行して確認:
   ```bash
   pnpm build
   ```

## 追加の注意点

- `pricing.ts` ファイルの1行目に `'use client'` ディレクティブがあり、これはReactコンポーネントであることを示している
- ファイル内で `<section>`, `<div>`, `<Card>` などのJSX要素を使用している
- これらはすべて `.tsx` 拡張子が必要な証拠
