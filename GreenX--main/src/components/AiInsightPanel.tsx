/**
 * AiInsightPanel — Reusable AI insights display for all dashboards.
 * Shows recommendations, suggested tasks, and a chat input.
 */
import { useState } from 'react';
import type { AiRecommendation, SuggestedTask } from '@/ai/aiAgent';

import { AlertTriangle, Bot, CheckCircle2, ClipboardList, Info, Loader2, ShieldAlert } from 'lucide-react';
interface AiInsightPanelProps {
    recommendations: AiRecommendation[];
    isAnalyzing?: boolean;
    onAsk?: (question: string) => void;
    onAcceptTask?: (task: SuggestedTask, recommendation: AiRecommendation) => void;
    compact?: boolean;
    title?: string;
}

const severityColors: Record<string, { bg: string; border: string; icon: string }> = {
    info: { bg: 'rgba(59,130,246,0.08)', border: 'var(--gx-blue, #3b82f6)', icon: <Info size={18} /> },
    warning: { bg: 'rgba(234,179,8,0.08)', border: 'var(--gx-gold, #eab308)', icon: <AlertTriangle size={18} /> },
    critical: { bg: 'rgba(239,68,68,0.08)', border: 'var(--gx-red, #ef4444)', icon: <ShieldAlert size={18} /> },
    success: { bg: 'rgba(34,197,94,0.08)', border: 'var(--gx-green, #22c55e)', icon: <CheckCircle2 size={18} /> },
};

export function AiInsightPanel({ recommendations, isAnalyzing, onAsk, onAcceptTask, compact, title }: AiInsightPanelProps) {
    const [question, setQuestion] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const handleAsk = () => {
        if (!question.trim() || !onAsk) return;
        onAsk(question.trim());
        setQuestion('');
    };

    return (
        <div className="gx-card" style={{ border: '1px solid var(--gx-green, #22c55e)', position: 'relative' }}>
            <div className="gx-card-header" style={{ background: 'rgba(34,197,94,0.06)' }}>
                <div className="gx-card-title"><Bot className="inline-block w-4 h-4 mr-1 align-middle" /> {title || 'AI Agent — Smart Insights'}</div>
                <span className="gx-status gx-s-done">{recommendations.length} insights</span>
            </div>
            <div className="gx-card-body">
                {/* Chat input */}
                {onAsk && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <input
                            type="text"
                            className="gx-input"
                            placeholder="Ask AI about any crop, pest, fertilizer, soil..."
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAsk()}
                            style={{ flex: 1 }}
                        />
                        <button className="gx-btn gx-btn-green" onClick={handleAsk} disabled={isAnalyzing || !question.trim()}>
                            {isAnalyzing ? <Loader2 className="inline-block w-4 h-4 mr-1 align-middle" /> : <Bot className="inline-block w-4 h-4 mr-1 align-middle" />} Ask
                        </button>
                    </div>
                )}

                {isAnalyzing && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gx-green)' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}><Bot size={28} /></div>
                        <div>Analyzing...</div>
                    </div>
                )}

                {recommendations.length === 0 && !isAnalyzing && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gx-text2)' }}>
                        <div style={{ fontSize: 36, marginBottom: 8 }}><Bot size={36} /></div>
                        <div>AI Agent ready. Upload data or ask a question for intelligent analysis.</div>
                        <div style={{ fontSize: 13, marginTop: 6 }}>Trained on comprehensive crop data: soil, pests, fertilizers, varieties, economics.</div>
                    </div>
                )}

                {/* Recommendations list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(compact ? recommendations.slice(0, 3) : recommendations).map(rec => {
                        const style = severityColors[rec.severity] || severityColors.info;
                        const isExpanded = expanded === rec.id;

                        return (
                            <div key={rec.id} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 8, padding: 12, transition: 'all 0.2s' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : rec.id)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 18 }}>{style.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{rec.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>{rec.summary}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: style.border, color: '#fff' }}>
                                            {rec.confidence}% conf
                                        </span>
                                        <span style={{ fontSize: 16 }}>{isExpanded ? '▼' : '▶'}</span>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div style={{ marginTop: 12 }}>
                                        <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--gx-text1)' }}>
                                            {rec.details.map((d, i) => (
                                                <div key={i} dangerouslySetInnerHTML={{ __html: d.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                            ))}
                                        </div>

                                        {/* Suggested tasks */}
                                        {rec.suggestedTasks.length > 0 && (
                                            <div style={{ marginTop: 12, borderTop: '1px solid var(--gx-border)', paddingTop: 10 }}>
                                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}><ClipboardList className="inline-block w-4 h-4 mr-1 align-middle" /> Suggested Tasks ({rec.suggestedTasks.length}):</div>
                                                {rec.suggestedTasks.map((task, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px dashed var(--gx-border)' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: 13, fontWeight: 500 }}>
                                                                <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: 11, marginRight: 6, background: task.priority === 'Urgent' ? '#ef4444' : task.priority === 'HIGH' ? '#f59e0b' : '#3b82f6', color: '#fff' }}>
                                                                    {task.priority}
                                                                </span>
                                                                {task.title}
                                                            </div>
                                                            <div style={{ fontSize: 12, color: 'var(--gx-text2)', marginTop: 2 }}>
                                                                → {task.assignTo.replace('_', ' ')} · Due in {task.dueInDays} days
                                                            </div>
                                                        </div>
                                                        {onAcceptTask && (
                                                            <button
                                                                className="gx-btn gx-btn-green gx-btn-sm"
                                                                style={{ whiteSpace: 'nowrap', fontSize: 12, padding: '4px 10px' }}
                                                                onClick={(e) => { e.stopPropagation(); onAcceptTask(task, rec); }}
                                                            >
                                                                ✓ Assign
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div style={{ fontSize: 11, color: 'var(--gx-text3)', marginTop: 8, textAlign: 'right' }}>
                                            {new Date(rec.timestamp).toLocaleString()} · {rec.relatedCrop || rec.type}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/** Compact AI summary badge for sidebar or overview cards */
export function AiBadge({ count, severity }: { count: number; severity?: string }) {
    if (count === 0) return null;
    const color = severity === 'critical' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#22c55e';
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: color, color: '#fff', fontSize: 11, fontWeight: 600 }}>
            <Bot className="inline-block w-4 h-4 mr-1 align-middle" /> {count}
        </span>
    );
}
