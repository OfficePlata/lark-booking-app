// 【ファイル概要】
// オーナーがメールチャットUIを確認するための管理ページです。

import { MailChatInterface } from '@/components/admin/mail-chat-interface'

export default function AdminChatPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold text-center mb-8">メール対応 (チャットモード)</h1>
      <MailChatInterface />
    </div>
  )
}
