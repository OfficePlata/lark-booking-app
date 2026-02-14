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
  { id: 1, sender: 'guest', name: '山田 太郎', message: 'はじめまして。チェックインについて...', timestamp: '10:30', type: 'mail' },
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
    <div className="flex flex-col h-[600px] w-full max-w-md bg-background border rounded-xl shadow-xl overflow-hidden">
      <div className="bg-primary/5 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar><AvatarImage src="/placeholder-user.jpg" /><AvatarFallback>Guest</AvatarFallback></Avatar>
          <div><h3 className="font-bold text-sm">山田 太郎 様</h3><p className="text-xs text-muted-foreground">メールチャットモード</p></div>
        </div>
        <div className="flex gap-2 text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><Star className="w-4 h-4 text-yellow-500" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2"><Separator className="flex-1" /><span className="text-xs text-muted-foreground">今日</span><Separator className="flex-1" /></div>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'owner' ? 'flex-row-reverse' : ''}`}>
                {msg.sender === 'guest' && <Avatar className="w-8 h-8 mt-1"><AvatarFallback>G</AvatarFallback></Avatar>}
                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${msg.sender === 'owner' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white dark:bg-slate-800 border rounded-tl-none'}`}>
                    {msg.message}
                  </div>
                  <span className={`text-[10px] text-muted-foreground ${msg.sender === 'owner' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background border-t">
        <div className="flex gap-2 items-end">
          <Input placeholder="返信..." className="min-h-[50px] py-3 resize-none" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()} />
          <Button size="icon" className="h-[50px] w-[50px] shrink-0" onClick={handleSend}><Send className="w-5 h-5" /></Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">相手にはメールとして送信されます</p>
      </div>
    </div>
  )
}
