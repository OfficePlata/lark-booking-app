// 【ファイル概要】
// オーナーがメールチャットUIを確認するための管理ページです。
// ブラウザで /admin/chat にアクセスすると表示されます。

import { MailChatInterface } from '@/components/admin/mail-chat-interface'

export default function AdminChatPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">メール対応 (チャットモード)</h1>
      <div className="flex justify-center">
        <MailChatInterface />
      </div>
    </div>
  )
}
