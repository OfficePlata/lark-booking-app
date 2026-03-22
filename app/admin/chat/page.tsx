// 【重要】このファイルは app/admin/chat/ フォルダの中に page.tsx という名前で保存してください
import { MailChatInterface } from '@/components/admin/mail-chat-interface'

export default function AdminChatPage() {
  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8">メール対応 (チャットモード)</h1>
      <div className="flex justify-center w-full">
        <MailChatInterface />
      </div>
    </div>
  )
}
