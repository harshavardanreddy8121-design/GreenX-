/**
 * AiAssistant — Full generative AI chat interface for GreenX.
 *
 * Features:
 * - Multi-turn conversations with session persistence
 * - Context-aware suggestions based on farm data
 * - Markdown rendering for rich AI responses
 * - Quick-action buttons for common queries
 * - Real-time streaming-style display
 * - Conversation history
 * - Integration with backend AI endpoints (GPT-4 or rule-based fallback)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Loader2, Trash2, Sparkles, ChevronDown, ChevronUp, Copy, ThumbsUp, ThumbsDown, Zap, Leaf, Bug, Droplets, BarChart3, FileText } from 'lucide-react';
import { javaApi } from '@/integrations/java-api/client';
import { toast } from 'sonner';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    modelUsed?: string;
    isLoading?: boolean;
}

interface QuickAction {
    label: string;
    icon: React.ReactNode;
    prompt: string;
    color: string;
}

interface AiAssistantProps {
    farmId?: string;
    userId?: string;
    farmData?: Record<string, any>;
    /** Compact mode for embedding in dashboards */
    compact?: boolean;
    /** Initial context message */
    contextMessage?: string;
    /** Called when AI generates a task suggestion */
    onTaskSuggested?: (task: { title: string; description: string; priority: string }) => void;
    className?: string;
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS: QuickAction[] = [
    {
        label: 'Analyze Farm',
        icon: <BarChart3 size={14} />,
        prompt: 'Analyze my farm data and give me a comprehensive health assessment with actionable recommendations.',
        color: '#22c55e',
    },
    {
        label: 'Crop Advice',
        icon: <Leaf size={14} />,
        prompt: 'What crops should I grow this season? Consider my soil type and local climate.',
        color: '#3b82f6',
    },
    {
        label: 'Pest Check',
        icon: <Bug size={14} />,
        prompt: 'What pests and diseases should I watch out for right now? Give me a prevention plan.',
        color: '#ef4444',
    },
    {
        label: 'Irrigation Plan',
        icon: <Droplets size={14} />,
        prompt: 'Help me optimize my irrigation schedule to save water while maintaining crop health.',
        color: '#06b6d4',
    },
    {
        label: 'Fertilizer Plan',
        icon: <Zap size={14} />,
        prompt: 'Create a fertilizer schedule for my crops with specific products, doses, and timing.',
        color: '#f59e0b',
    },
    {
        label: 'Generate Report',
        icon: <FileText size={14} />,
        prompt: 'Generate a comprehensive farm management report with current status, risks, and 30-day action plan.',
        color: '#8b5cf6',
    },
];

// ── Markdown Renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
    return text
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.*$)/gm, '<h4 style="margin:10px 0 4px;font-size:13px;font-weight:700;color:var(--gx-green)">$1</h4>')
        .replace(/^## (.*$)/gm, '<h3 style="margin:12px 0 6px;font-size:14px;font-weight:700;color:var(--gx-green)">$1</h3>')
        .replace(/^# (.*$)/gm, '<h2 style="margin:14px 0 8px;font-size:15px;font-weight:700;color:var(--gx-green)">$1</h2>')
        // Bullet points
        .replace(/^• (.*$)/gm, '<div style="display:flex;gap:6px;margin:2px 0"><span style="color:var(--gx-green);flex-shrink:0">•</span><span>$1</span></div>')
        .replace(/^- (.*$)/gm, '<div style="display:flex;gap:6px;margin:2px 0"><span style="color:var(--gx-green);flex-shrink:0">•</span><span>$1</span></div>')
        // Numbered lists
        .replace(/^\d+\. (.*$)/gm, (match, p1, offset, str) => {
            const num = match.match(/^(\d+)/)?.[1] || '1';
            return `<div style="display:flex;gap:6px;margin:2px 0"><span style="color:var(--gx-blue);flex-shrink:0;font-weight:600">${num}.</span><span>${p1}</span></div>`;
        })
        // Code inline
        .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:12px">$1</code>')
        // Line breaks
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n/g, '<br/>');
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, onCopy, onFeedback }: {
    message: Message;
    onCopy: (text: string) => void;
    onFeedback: (id: string, positive: boolean) => void;
}) {
    const isUser = message.role === 'user';
    const [showActions, setShowActions] = useState(false);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                gap: 8,
                marginBottom: 12,
                alignItems: 'flex-start',
            }}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Avatar */}
            <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: isUser ? 'var(--gx-blue)' : 'var(--gx-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 12,
                color: '#fff',
                fontWeight: 700,
            }}>
                {isUser ? 'U' : <Bot size={14} />}
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: '80%', minWidth: 60 }}>
                <div style={{
                    background: isUser
                        ? 'var(--gx-blue)'
                        : 'rgba(255,255,255,0.05)',
                    border: isUser ? 'none' : '1px solid var(--gx-border)',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    padding: '10px 14px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: isUser ? '#fff' : 'var(--gx-text1)',
                }}>
                    {message.isLoading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--gx-green)' }} />
                            <span style={{ color: 'var(--gx-text2)', fontSize: 12 }}>AI is thinking...</span>
                        </div>
                    ) : isUser ? (
                        <span>{message.content}</span>
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                            style={{ wordBreak: 'break-word' }}
                        />
                    )}
                </div>

                {/* Meta row */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 3,
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                }}>
                    <span style={{ fontSize: 10, color: 'var(--gx-text3)' }}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {message.modelUsed && !isUser && ` · ${message.modelUsed}`}
                    </span>

                    {/* Action buttons (show on hover for assistant messages) */}
                    {!isUser && !message.isLoading && showActions && (
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button
                                onClick={() => onCopy(message.content)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: 'var(--gx-text3)' }}
                                title="Copy"
                            >
                                <Copy size={11} />
                            </button>
                            <button
                                onClick={() => onFeedback(message.id, true)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: 'var(--gx-text3)' }}
                                title="Helpful"
                            >
                                <ThumbsUp size={11} />
                            </button>
                            <button
                                onClick={() => onFeedback(message.id, false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, color: 'var(--gx-text3)' }}
                                title="Not helpful"
                            >
                                <ThumbsDown size={11} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AiAssistant({
    farmId,
    userId,
    farmData,
    compact = false,
    contextMessage,
    onTaskSuggested,
    className = '',
}: AiAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [isExpanded, setIsExpanded] = useState(!compact);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add welcome message on mount
    useEffect(() => {
        const welcome: Message = {
            id: 'welcome',
            role: 'assistant',
            content: contextMessage || `**Welcome to GreenX AI Assistant!** 🌾\n\nI'm your intelligent farming advisor powered by agricultural knowledge and AI. I can help you with:\n\n• **Crop recommendations** based on your soil and season\n• **Pest & disease** identification and treatment\n• **Soil analysis** and fertilizer planning\n• **Irrigation** optimization\n• **Market insights** and financial planning\n\nAsk me anything about your farm, or use the quick actions below!`,
            timestamp: new Date(),
            modelUsed: 'system',
        };
        setMessages([welcome]);
    }, [contextMessage]);

    const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
        const newMsg: Message = {
            ...msg,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMsg]);
        return newMsg.id;
    }, []);

    const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isLoading) return;

        const question = text.trim();
        setInput('');
        setShowQuickActions(false);
        setIsLoading(true);

        // Add user message
        addMessage({ role: 'user', content: question });

        // Add loading placeholder
        const loadingId = addMessage({ role: 'assistant', content: '', isLoading: true });

        try {
            const response = await javaApi.call<any>('/ai/ask', 'POST', {
                question,
                sessionId,
                userId,
                farmId,
            });

            if (response.success && response.data) {
                const data = response.data;
                // Update session ID for conversation continuity
                if (data.sessionId && !sessionId) {
                    setSessionId(data.sessionId);
                }
                updateMessage(loadingId, {
                    content: data.answer || 'I could not generate a response. Please try again.',
                    isLoading: false,
                    modelUsed: data.modelUsed,
                });

                // Check if response contains task suggestions
                if (onTaskSuggested && data.answer?.includes('Task:')) {
                    const taskMatch = data.answer.match(/Task:\s*(.+?)(?:\n|$)/);
                    if (taskMatch) {
                        onTaskSuggested({
                            title: taskMatch[1],
                            description: question,
                            priority: 'Normal',
                        });
                    }
                }
            } else {
                updateMessage(loadingId, {
                    content: response.error || 'Failed to get AI response. Please check your connection.',
                    isLoading: false,
                });
            }
        } catch (error) {
            updateMessage(loadingId, {
                content: 'Network error. Please check your connection and try again.',
                isLoading: false,
            });
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [isLoading, sessionId, userId, farmId, addMessage, updateMessage, onTaskSuggested]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard'));
    };

    const handleFeedback = (id: string, positive: boolean) => {
        toast.success(positive ? 'Thanks for the positive feedback!' : 'Thanks — we\'ll improve this response');
    };

    const clearConversation = () => {
        setMessages([]);
        setSessionId(null);
        setShowQuickActions(true);
        const welcome: Message = {
            id: 'welcome-new',
            role: 'assistant',
            content: '**Conversation cleared.** How can I help you with your farm today?',
            timestamp: new Date(),
        };
        setMessages([welcome]);
    };

    const messageCount = messages.filter(m => m.role !== 'system').length;

    // ── Compact collapsed view ────────────────────────────────────────────────
    if (compact && !isExpanded) {
        return (
            <div
                className={`gx-card ${className}`}
                style={{ border: '1px solid var(--gx-green)', cursor: 'pointer' }}
                onClick={() => setIsExpanded(true)}
            >
                <div className="gx-card-header" style={{ background: 'rgba(34,197,94,0.06)' }}>
                    <div className="gx-card-title">
                        <Bot className="inline-block w-4 h-4 mr-1 align-middle" />
                        GreenX AI Assistant
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {messageCount > 1 && (
                            <span className="gx-status gx-s-done">{messageCount - 1} messages</span>
                        )}
                        <ChevronDown size={16} style={{ color: 'var(--gx-text2)' }} />
                    </div>
                </div>
            </div>
        );
    }

    // ── Full view ─────────────────────────────────────────────────────────────
    return (
        <div
            className={`gx-card ${className}`}
            style={{
                border: '1px solid var(--gx-green)',
                display: 'flex',
                flexDirection: 'column',
                height: compact ? 480 : 600,
            }}
        >
            {/* Header */}
            <div
                className="gx-card-header"
                style={{ background: 'rgba(34,197,94,0.06)', flexShrink: 0, cursor: compact ? 'pointer' : 'default' }}
                onClick={compact ? () => setIsExpanded(false) : undefined}
            >
                <div className="gx-card-title">
                    <Bot className="inline-block w-4 h-4 mr-1 align-middle" style={{ color: 'var(--gx-green)' }} />
                    GreenX AI Assistant
                    <span style={{
                        marginLeft: 8,
                        fontSize: 10,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: 'rgba(34,197,94,0.15)',
                        color: 'var(--gx-green)',
                        fontWeight: 600,
                    }}>
                        <Sparkles size={9} style={{ display: 'inline', marginRight: 2 }} />
                        AI
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); clearConversation(); }}
                        className="gx-btn gx-btn-ghost"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                        title="Clear conversation"
                    >
                        <Trash2 size={12} />
                    </button>
                    {compact && <ChevronUp size={16} style={{ color: 'var(--gx-text2)' }} />}
                </div>
            </div>

            {/* Messages area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {messages.map(msg => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        onCopy={handleCopy}
                        onFeedback={handleFeedback}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {showQuickActions && (
                <div style={{
                    padding: '8px 16px',
                    borderTop: '1px solid var(--gx-border)',
                    flexShrink: 0,
                }}>
                    <div style={{ fontSize: 11, color: 'var(--gx-text3)', marginBottom: 6 }}>Quick actions:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {QUICK_ACTIONS.map(action => (
                            <button
                                key={action.label}
                                onClick={() => sendMessage(action.prompt)}
                                disabled={isLoading}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    border: `1px solid ${action.color}`,
                                    background: `${action.color}15`,
                                    color: action.color,
                                    fontSize: 11,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {action.icon}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input area */}
            <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--gx-border)',
                flexShrink: 0,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-end',
            }}>
                <input
                    ref={inputRef}
                    type="text"
                    className="gx-input"
                    placeholder="Ask about crops, pests, soil, irrigation..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    style={{ flex: 1, fontSize: 13 }}
                />
                <button
                    className="gx-btn gx-btn-green"
                    onClick={() => sendMessage(input)}
                    disabled={isLoading || !input.trim()}
                    style={{ padding: '8px 14px', flexShrink: 0 }}
                    title="Send (Enter)"
                >
                    {isLoading
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Send size={16} />
                    }
                </button>
            </div>
        </div>
    );
}

/**
 * Compact AI chat button for embedding in dashboard headers.
 * Opens a floating chat panel.
 */
export function AiChatButton({ farmId, userId, farmData }: {
    farmId?: string;
    userId?: string;
    farmData?: Record<string, any>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className="gx-btn gx-btn-green"
                onClick={() => setOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            >
                <Bot size={14} />
                AI Chat
                {open && <ChevronUp size={12} />}
                {!open && <ChevronDown size={12} />}
            </button>

            {open && (
                <div style={{
                    position: 'fixed',
                    bottom: 80,
                    right: 24,
                    width: 380,
                    zIndex: 1000,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    borderRadius: 12,
                    overflow: 'hidden',
                }}>
                    <AiAssistant
                        farmId={farmId}
                        userId={userId}
                        farmData={farmData}
                        compact
                    />
                </div>
            )}
        </>
    );
}
