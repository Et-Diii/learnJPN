import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AppLayout from "../../../shared/components/layout/AppLayout";

export default function UserDashboard() {
  // User & Stats State
  const [user] = useState({
    username: localStorage.getItem("userEmail")?.split("@")[0] || "Học viên",
    email: localStorage.getItem("userEmail") || "demo@nihonai.com",
    currentLevel: "N5",
  });

  const [stats, setStats] = useState({
    streak: 5,
    todayWords: 12,
    totalStudied: 85,
    xp: 320,
    flashcardCount: 24,
  });

  // AI Quick Translate / Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [translateDirection, setTranslateDirection] = useState("vi-ja"); // "vi-ja" or "ja-vi"
  const [aiLoading, setAiLoading] = useState(false);
  const [translateResult, setTranslateResult] = useState(null);

  // AI Sensei Chat Box State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "ai",
      text: "Chào bạn! Mình là NihonAI Sensei. Hôm nay bạn muốn ôn tập từ vựng bài nào hay cần giải thích cấu trúc ngữ pháp nào cứ hỏi mình nhé! 🌸",
      time: "Vừa xong",
    },
  ]);

  // Auth Header Helper
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Fetch Stats & Profile
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/home");
        if (res.data) {
          setStats(prev => ({
            ...prev,
            totalStudied: res.data.totalVocabulary || prev.totalStudied,
          }));
        }
      } catch (err) {
        console.log("Dùng thông số mặc định cho stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Phát âm giọng Nhật bằng Web Speech API
  const speakJapanese = (text) => {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Dịch nhanh với AI
  const handleAITranslate = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/ai/preview",
        {
          message: `Dịch từ/câu sau từ ${translateDirection === "vi-ja" ? "tiếng Việt sang tiếng Nhật tự nhiên" : "tiếng Nhật sang tiếng Việt"}: "${searchQuery}". Hãy ghi rõ chữ Hán (nếu có), cách đọc Romaji và 1 câu ví dụ ngắn.`,
        },
        { headers: getAuthHeader() }
      );

      const reply = response.data?.reply || response.data || "";
      setTranslateResult({
        query: searchQuery,
        result: reply,
      });
    } catch (error) {
      console.error(error);
      setTranslateResult({
        query: searchQuery,
        result: "Dịch nhanh tạm thời không khả dụng, vui lòng thử lại sau!",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Hỏi AI Sensei
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userText, time: "Vừa xong" }]);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/ai/preview",
        { message: userText },
        { headers: getAuthHeader() }
      );
      const aiReply = response.data?.reply || response.data || "Sensei đã ghi nhận câu hỏi của bạn!";
      setChatHistory(prev => [...prev, { role: "ai", text: aiReply, time: "Vừa xong" }]);
    } catch {
      setChatHistory(prev => [
        ...prev,
        { role: "ai", text: "Sensei đang bận một chút, bạn hãy hỏi lại sau giây lát nhé! 😅", time: "Vừa xong" },
      ]);
    }
  };

  return (
    <AppLayout activePage="dashboard">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* ========================================================= */}
        {/* 1. HERO BENTO WELCOME BANNER */}
        {/* ========================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-rose-600 p-6 sm:p-9 text-white shadow-xl shadow-indigo-500/15 overflow-hidden">
          {/* Subtle Ambient pattern */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-60 h-60 rounded-full bg-rose-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-indigo-100 border border-white/20">
                <span>🇯🇵</span> Châm ngôn hôm nay: 継続は力なり (Kiên trì là sức mạnh)
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                こんにちは, {user.username}さん！ 👋
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base leading-relaxed font-medium">
                Hôm nay là thời điểm tuyệt vời để hoàn thành mục tiêu 15 từ vựng và ôn luyện bộ thẻ Flashcard cấp độ <strong className="text-white underline">{user.currentLevel}</strong>!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Link
                to="/vocabulary"
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-sm shadow-md transition-all text-center"
              >
                📚 Học bài mới
              </Link>
              <Link
                to="/flashcards"
                className="flex-1 lg:flex-none px-5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-sm border border-white/30 transition-all text-center"
              >
                🃏 Lật thẻ ôn tập
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. STATS KPI CARDS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Streak Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group">
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🔥
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Chuỗi học tập</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.streak} <span className="text-xs font-bold text-slate-600">ngày liên tục</span></p>
            </div>
          </div>

          {/* Level Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group">
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🎯
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Trình độ JLPT</p>
              <p className="text-2xl font-black text-indigo-600 mt-0.5">{user.currentLevel} <span className="text-xs font-bold text-slate-600">Sơ cấp 1</span></p>
            </div>
          </div>

          {/* Vocabulary Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group">
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📚
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Từ vựng hệ thống</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalStudied}+ <span className="text-xs font-bold text-emerald-600">từ</span></p>
            </div>
          </div>

          {/* Flashcards Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center gap-4 group">
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🃏
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Bộ thẻ ôn tập</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">{stats.flashcardCount} <span className="text-xs font-bold text-slate-600">thẻ đã tạo</span></p>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. FOUR CORE HUBS (Action Grid) */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Lộ trình học tập chuyên sâu
            </h2>
            <span className="text-xs font-bold text-indigo-600">Chọn nội dung để bắt đầu</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Hub 1: Từ vựng */}
            <Link
              to="/vocabulary"
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  📚
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-indigo-600 transition">
                  Kho từ vựng theo bài
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Chia theo từng bài học Minna no Nihongo, phát âm giọng Nhật chuẩn 🔊, lưu vào Flashcard 1-click.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Vào học từ vựng</span>
                <span>→</span>
              </div>
            </Link>

            {/* Hub 2: Kanji */}
            <Link
              to="/kanji"
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-rose-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  🈴
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-rose-600 transition">
                  Chữ Hán Kanji
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  214 bộ thủ, quy tắc thứ tự nét, âm On, âm Kun và mẹo ghi nhớ hình tượng chữ tượng hình.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
                <span>Vào học Kanji</span>
                <span>→</span>
              </div>
            </Link>

            {/* Hub 3: Ngữ pháp */}
            <Link
              to="/grammar"
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  📖
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-amber-600 transition">
                  Cấu trúc ngữ pháp
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Công thức chi tiết, câu ví dụ thực tế kèm Romaji và phân biệt các mẫu câu dễ nhầm lẫn.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Vào học ngữ pháp</span>
                <span>→</span>
              </div>
            </Link>

            {/* Hub 4: Flashcards */}
            <Link
              to="/flashcards"
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-purple-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 text-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  🃏
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-purple-600 transition">
                  Luyện tập Flashcard
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Phương pháp lặp lại ngắt quãng (Spaced Repetition), lật thẻ 3D và đánh giá ghi nhớ thông minh.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>Ôn tập bộ thẻ</span>
                <span>→</span>
              </div>
            </Link>

          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. AI QUICK TRANSLATE & SMART DICTIONARY */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                🤖
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">AI Tra cứu & Dịch ngữ cảnh</h3>
                <p className="text-xs text-slate-500">Dịch 2 chiều Việt - Nhật với ngữ cảnh tự nhiên và phát âm chuẩn</p>
              </div>
            </div>

            {/* Direction switcher */}
            <button
              onClick={() => setTranslateDirection(translateDirection === "vi-ja" ? "ja-vi" : "vi-ja")}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 font-bold text-xs text-slate-700 flex items-center gap-2 transition"
            >
              <span>{translateDirection === "vi-ja" ? "🇻🇳 Tiếng Việt" : "🇯🇵 Tiếng Nhật"}</span>
              <span className="text-indigo-600 font-black">⇄</span>
              <span>{translateDirection === "vi-ja" ? "🇯🇵 Tiếng Nhật" : "🇻🇳 Tiếng Việt"}</span>
            </button>
          </div>

          {/* Search box input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={translateDirection === "vi-ja" ? "Nhập từ hoặc câu tiếng Việt cần dịch..." : "Nhập tiếng Nhật hoặc Romaji..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAITranslate()}
              className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
            />
            <button
              onClick={handleAITranslate}
              disabled={aiLoading}
              className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              {aiLoading ? "Đang dịch..." : "Dịch với AI 🚀"}
            </button>
          </div>

          {/* Result card */}
          {translateResult && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kết quả dịch ngữ cảnh
                </span>
                <button
                  onClick={() => speakJapanese(translateResult.result)}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <span>🔊</span> Nghe phát âm
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed">
                {translateResult.result}
              </p>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 5. AI SENSEI QUICK CHAT COMPANION */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold">
                💬
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Góc trò chuyện cùng AI Sensei</h3>
                <p className="text-xs text-slate-500">Giải đáp thắc mắc ngữ pháp, trợ từ は/が, kính ngữ Keigo</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Sẵn sàng giải đáp
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="max-h-80 overflow-y-auto space-y-3.5 pr-2">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${item.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0 ${
                    item.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-rose-500 text-white"
                  }`}
                >
                  {item.role === "user" ? "Bạn" : "AI"}
                </div>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[80%] whitespace-pre-line shadow-xs ${
                    item.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-50 text-slate-800 border border-slate-200/80"
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick prompt suggestions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-600 self-center">Gợi ý hỏi nhanh:</span>
            {[
              "Phân biệt trợ từ は và が",
              "Cách chia thể て của động từ nhóm 1",
              "Khi nào dùng 〜てみる?",
            ].map((hint, idx) => (
              <button
                key={idx}
                onClick={() => setChatMessage(hint)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                {hint}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChatMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Đặt câu hỏi cho AI Sensei (ví dụ: Giải thích ngữ pháp 〜なければならない)..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:scale-105 transition-all"
            >
              Gửi câu hỏi
            </button>
          </form>
        </div>

      </div>
    </AppLayout>
  );
}