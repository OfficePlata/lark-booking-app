// 【ファイル概要】
// 汎用的なユーティリティ関数をまとめたファイルです。
// CSSクラスの条件付き結合を行う `cn` 関数など、UI構築を補助するヘルパー関数が含まれます。

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
