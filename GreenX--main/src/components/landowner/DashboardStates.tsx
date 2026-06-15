/**
 * DashboardStates
 * Reusable Loading, Error, and Empty state components for the
 * Landowner Dashboard sections.
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

// ── Loading State ─────────────────────────────────────────────────────────────

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ message = 'Loading data…', size = 'md' }: LoadingStateProps) {
    const spinnerSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 22;
    const padding = size === 'sm' ? '12px 0' : size === 'lg' ? '48px 0' : '28px 0';

    return (
        <div style={{ textAlign: 'center', padding, color: 'var(--gx-text2)' }}>
            <Loader2
                size={spinnerSize}
                className="animate-spin"
                style={{ display: 'inline-block', marginBottom: 8, color: 'var(--gx-green)' }}
            />
            <div style={{ fontSize: size === 'sm' ? 12 : 13 }}>{message}</div>
        </div>
    );
}

// ── Error State ───────────────────────────────────────────────────────────────

interface ErrorStateProps {
    error: Error | string | null;
    onRetry?: () => void;
    compact?: boolean;
}

export function ErrorState({ error, onRetry, compact = false }: ErrorStateProps) {
    const message =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : 'An unexpected error occurred.';

    if (compact) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--gx-red, #ef4444)',
            }}>
                <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{message}</span>
                {onRetry && (
                    <button
                        className="gx-btn gx-btn-ghost gx-btn-sm"
                        onClick={onRetry}
                        style={{ fontSize: 11, color: 'var(--gx-red, #ef4444)', borderColor: 'rgba(239,68,68,0.3)' }}
                    >
                        <RefreshCw size={11} className="inline-block mr-1" /> Retry
                    </button>
                )}
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gx-text2)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <AlertTriangle size={40} strokeWidth={1.5} style={{ color: 'var(--gx-red, #ef4444)', opacity: 0.7 }} />
            </div>
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--gx-red, #ef4444)' }}>
                Failed to load data
            </div>
            <div style={{ fontSize: 13, marginBottom: 16, maxWidth: 320, margin: '0 auto 16px' }}>
                {message}
            </div>
            {onRetry && (
                <button className="gx-btn gx-btn-ghost" onClick={onRetry}>
                    <RefreshCw size={14} className="inline-block mr-1" /> Try Again
                </button>
            )}
        </div>
    );
}

// ── Empty State ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    message?: string;
    action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
    return (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gx-text2)' }}>
            {icon && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.35 }}>
                    {icon}
                </div>
            )}
            <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--gx-text)' }}>{title}</div>
            {message && <div style={{ fontSize: 13, marginBottom: action ? 16 : 0 }}>{message}</div>}
            {action && (
                <button className="gx-btn gx-btn-ghost gx-btn-sm" onClick={action.onClick} style={{ marginTop: 8 }}>
                    {action.label}
                </button>
            )}
        </div>
    );
}

// ── Full-page Dashboard Loading ───────────────────────────────────────────────

export function DashboardLoadingOverlay() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 320,
            gap: 16,
            color: 'var(--gx-text2)',
        }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--gx-green)' }} />
            <div style={{ fontSize: 14 }}>Loading your dashboard…</div>
        </div>
    );
}

// ── Connection Error Banner ───────────────────────────────────────────────────

interface ConnectionErrorBannerProps {
    error: Error | null;
    onRetry?: () => void;
}

export function ConnectionErrorBanner({ error, onRetry }: ConnectionErrorBannerProps) {
    if (!error) return null;
    return (
        <div className="gx-alert-box gx-alert-red" style={{ marginBottom: 16 }}>
            <span><AlertTriangle className="inline-block w-4 h-4 mr-1 align-middle" /></span>
            <div>
                <strong>Backend Connection Error:</strong>{' '}
                {error.message || 'Could not load data from the server.'}
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                    Please check your connection or try refreshing the page.
                </div>
                {onRetry && (
                    <button
                        className="gx-btn gx-btn-ghost gx-btn-sm"
                        onClick={onRetry}
                        style={{ marginTop: 8, fontSize: 11 }}
                    >
                        <RefreshCw size={11} className="inline-block mr-1" /> Retry
                    </button>
                )}
            </div>
        </div>
    );
}
