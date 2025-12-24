"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, Sparkles, Loader2, Paperclip, Mic, X, FileText, Image } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { aiQueryWithFile, aiQuery } from "@/lib/actions/n8n"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTranslation } from "@/lib/store/language-store"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    fileName?: string
}

export default function QueryPage() {
    const { t, language } = useTranslation()

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: language === 'tr' ? t.chat.welcome : t.chat.welcome,
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const suggestedQuestions = language === 'tr' ? [
        "Bu ay ne kadar yakıt harcadık?",
        "En yüksek gelir kalemi nedir?",
        "Haftalık gider ortalaması ne kadar?",
        "Bu ayki kar durumu nasıl?",
    ] : [
        "How much did we spend on fuel this month?",
        "What is the highest income item?",
        "What is the weekly expense average?",
        "What is this month's profit status?",
    ]

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading, scrollToBottom])

    // Handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setFilePreview(e.target?.result as string)
                }
                reader.readAsDataURL(file)
            } else {
                setFilePreview(null)
            }
        }
    }

    // Remove selected file
    const removeFile = () => {
        setSelectedFile(null)
        setFilePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() && !selectedFile) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input || (selectedFile ? `[${t.chat.attach}: ${selectedFile.name}]` : ''),
            timestamp: new Date(),
            fileName: selectedFile?.name,
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            let response

            const user = useAuthStore.getState().user

            if (selectedFile) {
                // Use FormData for binary file upload
                const formData = new FormData()
                formData.append('chatInput', input || `Dosya analizi: ${selectedFile.name}`)
                formData.append('file', selectedFile)
                if (user?.id) formData.append('userId', user.id)
                response = await aiQueryWithFile(formData)
            } else {
                // Text only
                response = await aiQuery(input, user?.id)
            }

            // Clear file after sending
            removeFile()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.success
                    ? (response.data as { output?: string })?.output || JSON.stringify(response.data)
                    : response.error || (language === 'tr' ? "Bir hata oluştu." : "An error occurred."),
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: language === 'tr'
                    ? "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin."
                    : "Sorry, an error occurred. Please try again.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSuggestionClick = (question: string) => {
        setInput(question)
    }

    // Get file icon based on type
    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <Image className="h-4 w-4" />
        }
        return <FileText className="h-4 w-4" />
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <Card className="flex flex-col flex-1 overflow-hidden">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {t.chat.title}
                    </CardTitle>
                    <CardDescription>
                        {t.chat.desc}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {message.role === "assistant" && (
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}

                                    <div
                                        className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                            }`}
                                    >
                                        {message.fileName && (
                                            <Badge variant="secondary" className="mb-2 text-xs">
                                                {getFileIcon(message.fileName)}
                                                <span className="ml-1">{message.fileName}</span>
                                            </Badge>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <span className="text-xs opacity-70 mt-1 block">
                                            {message.timestamp.toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    {message.role === "user" && (
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="bg-secondary">
                                                <User className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg p-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    {/* Suggestions */}
                    {messages.length === 1 && (
                        <div className="p-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">
                                {t.chat.suggestions}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((question, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSuggestionClick(question)}
                                        className="text-xs min-h-[36px]"
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* File Preview */}
                    {selectedFile && (
                        <div className="px-4 py-2 border-t bg-muted/50">
                            <div className="flex items-center gap-2">
                                {filePreview ? (
                                    <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                                ) : (
                                    <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                                        {getFileIcon(selectedFile.name)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={removeFile} className="shrink-0">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 border-t">
                        <div className="flex gap-2">
                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx"
                                onChange={handleFileSelect}
                            />

                            {/* Attachment Button */}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="shrink-0 min-h-[44px] min-w-[44px]"
                                title={t.chat.attach}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>

                            {/* Voice Button (placeholder - shows toast) */}
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    // Voice recording would go here
                                    alert(language === 'tr'
                                        ? 'Ses kaydı özelliği yakında eklenecek!'
                                        : 'Voice recording feature coming soon!')
                                }}
                                disabled={isLoading}
                                className="shrink-0 min-h-[44px] min-w-[44px]"
                                title={t.chat.voice}
                            >
                                <Mic className="h-4 w-4" />
                            </Button>

                            {/* Text Input */}
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t.chat.placeholder}
                                className="min-h-[44px] max-h-32 resize-none text-base"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit(e)
                                    }
                                }}
                                disabled={isLoading}
                            />

                            {/* Send Button */}
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || (!input.trim() && !selectedFile)}
                                className="shrink-0 min-h-[44px] min-w-[44px]"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
