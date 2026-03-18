import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SplashPage } from './pages/SplashPage';
import { MainPage } from './pages/MainPage';
import { MapPage } from './pages/MapPage';
import { RankingPage } from './pages/RankingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { TransitionProvider } from './context/TransitionContext';
import { AuthModal } from './components/AuthModal';
import { ForgotPage } from './pages/ForgotPage';

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#152e22] text-white">
      <h1 className="text-2xl">로그인 페이지 (/login)</h1>
    </div>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <BrowserRouter basename="/poop-map">
      <TransitionProvider>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/main" element={<MainPage openAuth={openAuth} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/map" element={<MapPage openAuth={openAuth} />} />
          <Route path="/ranking" element={<RankingPage openAuth={openAuth} />} />
          <Route path="/forgot-password" element={<ForgotPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <AuthModal 
          isOpen={authOpen} 
          onClose={() => setAuthOpen(false)} 
          defaultMode={authMode}
          onSuccess={() => console.log('Auth Success!')}
        />
      </TransitionProvider>
    </BrowserRouter>
  );
}

export default App
