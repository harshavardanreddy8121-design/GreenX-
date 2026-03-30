import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";
import "./styles/dashboard.css";

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { error };
    }
    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 32, fontFamily: "monospace", color: "#c00", background: "#fff", minHeight: "100vh" }}>
                    <h2>App crashed — React error boundary caught:</h2>
                    <pre style={{ whiteSpace: "pre-wrap", background: "#fee", padding: 16, borderRadius: 8 }}>
                        {this.state.error.message}{"\n\n"}{this.state.error.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const rootEl = document.getElementById("root")!;

try {
    createRoot(rootEl).render(
        <React.StrictMode>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </React.StrictMode>
    );
} catch (err: any) {
    rootEl.innerHTML = `<div style="padding:32px;font-family:monospace;color:#c00;background:#fff;min-height:100vh">
  <h2>Module-level crash (before React):</h2>
  <pre style="white-space:pre-wrap;background:#fee;padding:16px;border-radius:8px">${String(err?.message)}\n\n${String(err?.stack)}</pre>
</div>`;
}
