"use client"

import { useState } from "react"
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { queryData } from "@/lib/actions/n8n"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

const suggestedQuestions = [
    "Bu ay ne kadar yakıt harcadık?",
    "En yüksek gelir kalemi nedir?",
    "Haftalık gider ortalaması ne kadar?",
    "Bu ayki kar durumu nasıl?",
]

export default function QueryPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Merhaba! Ben BestHoliday Finans Asistanınızım. Size finansal verileriniz hakkında sorular sorabilirsiniz. Örneğin: 'Bu ay ne kadar yakıt harcadık?' veya 'Gelir durumu nasıl?'",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (question?: string) => {
        const prompt = question || input.trim()
        if (!prompt) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: prompt,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await queryData(prompt)

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.success
                    ? (response.data as { answer: string })?.answer || "Veriler işleniyor..."
                    : "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card className="h-[calc(100vh-12rem)]">
                <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle>AI Finans Analist</CardTitle>
                            <CardDescription>
                                Doğal dilde sorular sorarak finansal verilerinizi analiz edin
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100%-5rem)] p-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""
                                        }`}
                                >
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className={
                                            message.role === "assistant"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-accent text-accent-foreground"
                                        }>
                                            {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p className={`text-xs mt-1 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                                            }`}>
                                            {message.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg px-4 py-2 bg-muted">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">Analiz ediliyor...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Suggested Questions */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Önerilen sorular:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((q, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSubmit(q)}
                                        disabled={isLoading}
                                    >
                                        {q}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault()
                                handleSubmit()
                            }}
                            className="flex gap-2"
                        >
                            <Textarea
                                placeholder="Finansal bir soru sorun..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="min-h-[60px] resize-none"
                                disabled={isLoading}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit()
                                    }
                                }}
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
