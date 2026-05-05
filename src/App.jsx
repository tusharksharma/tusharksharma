import { Routes, Route, useLocation } from "react-router-dom";
import { Component, useEffect, lazy, Suspense } from "react";
import Nav from "./components/Nav";
import InstallPrompt from "./components/InstallPrompt";

// Code-split route components — only loaded when navigated to
const HomePage = lazy(() => import("./pages/HomePage"));
const RecipePage = lazy(() => import("./pages/RecipePage"));
const CookbookPage = lazy(() => import("./pages/CookbookPage"));
const CookbookDetailPage = lazy(() => import("./pages/CookbookDetailPage"));
const DinnersPage = lazy(() => import("./pages/DinnersPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FanPage = lazy(() => import("./pages/FanPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

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
      <ScrollToTop />
      <Nav />
      <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dinners" element={<DinnersPage />} />
          <Route path="/fan" element={<FanPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/cookbook" element={<CookbookPage />} />
          <Route path="/cookbook/:id" element={<CookbookDetailPage />} />
          <Route path="/recipes/:slug" element={<RecipePage />} />
        </Routes>
      </Suspense>
      <InstallPrompt />
    </ErrorBoundary>
  );
}

export default App;
