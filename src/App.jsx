import { Routes, Route, useLocation } from "react-router-dom";
import { Component, useEffect, lazy, Suspense } from "react";
import Nav from "./components/Nav";
import InstallPrompt from "./components/InstallPrompt";
import MyListDrawer from "./components/MyListDrawer";
import useTheme from "./hooks/useTheme";

// Code-split route components — only loaded when navigated to
const HomePage = lazy(() => import("./pages/HomePage"));
const RecipePage = lazy(() => import("./pages/RecipePage"));
const CookbookPage = lazy(() => import("./pages/CookbookPage"));
const CookbookDetailPage = lazy(() => import("./pages/CookbookDetailPage"));
const DinnersPage = lazy(() => import("./pages/DinnersPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FanPage = lazy(() => import("./pages/FanPage"));
const SocialPage = lazy(() => import("./pages/SocialPage"));
const SocialIndexPage = lazy(() => import("./pages/SocialIndexPage"));
const LeftoversPage = lazy(() => import("./pages/LeftoversPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));

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
  // Theme is owned here now (not scoped to the recipe page), so a light-mode
  // choice persists across every route. index.html pre-applies data-theme
  // before hydration; this keeps <html> in sync when the reader toggles.
  const [theme] = useTheme();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Nav />
      <Suspense fallback={<div className="min-h-screen bg-page" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dinners" element={<DinnersPage />} />
          <Route path="/leftovers" element={<LeftoversPage />} />
          <Route path="/fan" element={<FanPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/cookbook" element={<CookbookPage />} />
          <Route path="/cookbook/:id" element={<CookbookDetailPage />} />
          <Route path="/recipes/:slug" element={<RecipePage />} />
          <Route path="/social" element={<SocialIndexPage />} />
          <Route path="/social/cookbook/:id" element={<SocialPage />} />
          <Route path="/social/:slug" element={<SocialPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/favorites/:collectionSlug" element={<FavoritesPage />} />
        </Routes>
      </Suspense>
      <MyListDrawer />
      <InstallPrompt />
    </ErrorBoundary>
  );
}

export default App;
