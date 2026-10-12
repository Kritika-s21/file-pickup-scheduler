import React from "react";
import Ic from "./icons.jsx";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("UI crashed:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: "sans-serif", color: "var(--text-hi, #e5e7eb)" }}>
          <h2 style={{ marginTop: 0 }}><Ic n="warn" size={20} /> Something went wrong rendering this page</h2>
          <p style={{ color: "var(--text-mid, #9ca3af)" }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          {this.state.info?.componentStack && (
            <pre style={{
              background: "var(--code-bg, #0c1119)", padding: 12, borderRadius: 8, fontSize: 12,
              overflow: "auto", maxHeight: 240, color: "var(--code-fg, #9ca3af)", marginBottom: 16,
            }}>
              {this.state.info.componentStack}
            </pre>
          )}
          <button
            onClick={() => this.setState({ error: null })}
            style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", marginRight: 8 }}
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
