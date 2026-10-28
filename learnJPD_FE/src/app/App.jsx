import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../features/landing/pages/LandingPage'; 
import Login from '../features/auth/pages/AuthPage';
import Dashboard from '../features/dashboard/pages/DashboardPage';
import CreateFlashcardSet from '../features/flashcards/pages/CreateFlashcardSetPage';
import MyFlashcards from '../features/flashcards/pages/MyFlashcardsPage'; 
import StudySessionPage from '../features/flashcards/pages/StudySessionPage';
import VocabularyPage from '../features/vocabulary/pages/VocabularyPage';
import GrammarPage from '../features/grammar/pages/GrammarPage';
import KanjiPage from '../features/kanji/pages/KanjiPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang chủ landing */}
        <Route path="/" element={<HomePage />} />

        {/* Xác thực */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard học tập */}
        <Route path="/home" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/home" replace />} />

        {/* Quản lý flashcards */}
        <Route path="/flashcards" element={<MyFlashcards />} />
        <Route path="/myflashcards" element={<Navigate to="/flashcards" replace />} />
        <Route path="/createflashCard" element={<CreateFlashcardSet />} />
        <Route path="/create-set" element={<CreateFlashcardSet />} />

        {/* Màn hình học bộ thẻ */}
        <Route path="/flashcards/:id/study" element={<StudySessionPage />} />
        <Route path="/set/:id" element={<StudySessionPage />} />

        {/* Kho từ vựng, Kanji & Ngữ pháp (Giai đoạn 2) */}
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/kanji" element={<KanjiPage />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;