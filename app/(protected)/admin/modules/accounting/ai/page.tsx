"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Bot, User, Sparkles, Loader2, Paperclip, X, FileText, Image, Receipt, Building2, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { aiQueryWithFile, aiQuery } from "@/lib/actions/n8n"
import { useTranslation } from "@/lib/store/language-store"
import { toast } from "sonner"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    fileName?: string
}

/**
 * AI Finance Assistant Page (within Accounting Module)
 * /admin/modules/accounting/ai
 */
export default function AccountingAIPage() {
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

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Accounting-focused suggested questions
    const suggestedQuestions = language === 'tr' ? [
        "Bugün Otel ABC'ye 5000 TL ödeme yaptık",
        "Müşteri XYZ'den 3000 USD alacağımız var, vade 1 hafta",
        "Bu ayki toplam alacaklarımız ne kadar?",
        "Gecikmiş ödemeler hangileri?",
    ] : [
        "We paid 5000 TL to Hotel ABC today",
        "Customer XYZ owes us 3000 USD, due in 1 week",
        "What are our total receivables this month?",
        "Which payments are overdue?",
    ]

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading, scrollToBottom])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
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

            if (selectedFile) {
                const formData = new FormData()
                formData.append('chatInput', input || `Dosya analizi: ${selectedFile.name}`)
                formData.append('file', selectedFile)
                response = await aiQueryWithFile(formData)
            } else {
                response = await aiQuery(input)
            }

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
            toast.error(t.toast.connectionError)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSuggestionClick = (question: string) => {
        setInput(question)
    }

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <Image className="h-4 w-4" />
        }
        return <FileText className="h-4 w-4" />
    }

    return (
        <div className="flex flex-col h-[calc(100vh-14rem)]">
            {/* Accounting context hint */}
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                        {language === 'tr'
                            ? 'AI ile cari hareket oluşturabilir, bakiye sorgulayabilir, vade takibi yapabilirsiniz.'
                            : 'Use AI to create ledger entries, query balances, and track due dates.'}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Users className="h-3 w-3" /> Müşteri/Otel
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Receipt className="h-3 w-3" /> Alacak/Borç
                    </Badge>
                    <Badge variant="secondary" className="gap-1 text-xs">
                        <Building2 className="h-3 w-3" /> Vade Takibi
                    </Badge>
                </div>
            </div>

            <Card className="flex flex-col flex-1 overflow-hidden">
                <CardHeader className="border-b py-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {t.chat.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {t.chat.desc}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {message.role === "assistant" && (
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                        }`}>
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
                                {language === 'tr' ? 'Örnek komutlar:' : 'Example commands:'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedQuestions.map((question, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSuggestionClick(question)}
                                        className="text-xs"
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
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf,.xlsx,.xls,.csv,.doc,.docx"
                                onChange={handleFileSelect}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                title={t.chat.attach}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
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
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || (!input.trim() && !selectedFile)}
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
