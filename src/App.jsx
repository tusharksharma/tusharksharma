import { Routes, Route } from "react-router-dom";
import { Component } from "react";
import Nav from "./components/Nav";
import HomePage from "./pages/HomePage";
import RecipePage from "./pages/RecipePage";
import CookbookPage from "./pages/CookbookPage";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: "#0a0a0a", color: "#f87171", padding: 40, minHeight: "100vh", fontFamily: "monospace" }}>
          <h1 style={{ color: "#fbbf24" }}>Something broke</h1>
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 20, color: "#d4d4d4" }}>
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cookbook" element={<CookbookPage />} />
        <Route path="/recipes/:slug" element={<RecipePage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
