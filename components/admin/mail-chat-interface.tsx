// 【重要】このファイルは components/admin/ フォルダの中に mail-chat-interface.tsx という名前で保存してください
'use client'

import { useState } from 'react'
import { Send, Phone, Star, MoreVertical, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type Message = {
  id: number
  sender: 'guest' | 'owner'
  name: string
  message: string
  timestamp: string
  type: 'mail'
}

const MOCK_MESSAGES: Message[] = [
  { id: 1, sender: 'guest', name: '山田 太郎', message: 'はじめまして。\nチェックイン時間を14時に変更できますか？', timestamp: '10:30', type: 'mail' },
  { id: 2, sender: 'owner', name: 'STAY YOKABAN', message: 'お問い合わせありがとうございます。\nはい、14時のチェックイン可能です。\nお待ちしております。', timestamp: '10:45', type: 'mail' },
]

export function MailChatInterface() {
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return
    const newMessage: Message = {
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
    <div className="flex flex-col h-[600px] w-full max-w-md bg-white dark:bg-slate-950 border rounded-xl shadow-xl overflow-hidden mx-auto">
      {/* ヘッダー */}
      <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback>古</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-sm">山田 太郎 様</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span>メール連携中</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8"><Star className="w-4 h-4 text-yellow-500" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* メッセージエリア */}
      <ScrollArea className="flex-1 p-4 bg-slate-50 dark:bg-slate-900">
        <div className="space-y-4">
          <div className="flex items-center gap-4 py-2 opacity-50">
            <Separator className="flex-1" />
            <span className="text-xs">今日</span>
            <Separator className="flex-1" />
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'owner' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'owner' ? 'flex-row-reverse' : ''}`}>
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className={msg.sender === 'owner' ? 'bg-blue-600 text-white' : ''}>
                    {msg.sender === 'owner' ? '自' : '客'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col gap-1">
                  <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                      msg.sender === 'owner' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white border rounded-tl-none text-slate-800'
                    }`}>
                    {msg.message}
                  </div>
                  <span className={`text-[10px] text-muted-foreground ${msg.sender === 'owner' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* 入力エリア */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t">
        <div className="flex gap-2">
          <Input 
            placeholder="返信を入力..." 
            className="flex-1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} size="icon" className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
