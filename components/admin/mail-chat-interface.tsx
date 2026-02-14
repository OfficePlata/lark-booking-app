// 【ファイル概要】
// オーナー向け：メールをチャット形式で閲覧・返信するためのUIコンポーネントです。
// 現時点ではバックエンド連携のないUIモックアップとして機能します。

'use client'

import { useState } from 'react'
import { Send, Phone, Star, MoreVertical } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const MOCK_MESSAGES = [
  { id: 1, sender: 'guest', name: '山田 太郎', message: 'はじめまして。チェックイン時間について...', timestamp: '10:30', type: 'mail' },
  { id: 2, sender: 'owner', name: 'STAY YOKABAN', message: 'お問い合わせありがとうございます。', timestamp: '10:45', type: 'mail' },
]

export function MailChatInterface() {
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return
    const newMessage = {
      id: messages.length + 1,
      sender: 'owner',
      name: 'STAY YOKABAN',
      message: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'mail'
    }
    setMessages([...messages, newMessage])
    setInputValue('')
  }

  return (
    <div className="flex flex-col h-[600px] max-w-md mx-auto bg-background border rounded-xl shadow-xl overflow-hidden">
      <div className="bg-primary/5 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar><AvatarFallback>G</AvatarFallback></Avatar>
          <div><h3 className="font-bold text-sm">お客様 (Mail)</h3><p className="text-xs text-muted-foreground">チャットモード</p></div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'owner' ? 'flex-row-reverse' : ''}`}>
                <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                    msg.sender === 'owner' ? 'bg-primary text-primary-foreground' : 'bg-white border'
                  }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background border-t">
        <div className="flex gap-2">
          <Input placeholder="返信内容..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <Button size="icon" onClick={handleSend}><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  )
}
