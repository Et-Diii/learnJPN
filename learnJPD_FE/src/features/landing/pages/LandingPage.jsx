import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { isTokenValid, clearAuthStorage } from "../../auth/utils/authSession";

export default function JapaneseAIHomePage() {
  const navigate = useNavigate();

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(() => isTokenValid() && !!localStorage.getItem("userEmail"));
  const [userEmail, setUserEmail] = useState(() => isTokenValid() ? (localStorage.getItem("userEmail") || "") : "");

  // Home API Data
  const [homeData, setHomeData] = useState({
    totalVocabulary: 120,
    totalKanji: 85,
    totalUsers: 1450,
    featuredWords: [
      { id: 1, word: "勉強", romaji: "benkyou", meaning: "Học tập", level: "N5", example: "毎日日本語を勉強します。" },
      { id: 2, word: "約束", romaji: "yakusoku", meaning: "Lời hứa, hẹn ước", level: "N4", example: "友達と約束があります。" },
      { id: 3, word: "感謝", romaji: "kansha", meaning: "Biết ơn, cảm tạ", level: "N3", example: "先生に心から感謝します。" },
    ],
    featuredKanji: [
      { id: 1, kanji: "日", onyomi: "NICHI, JITSU", kunyomi: "hi, bi, ka", meaning: "Nhật, Mặt trời, Ngày", strokes: 4, level: "N5" },
      { id: 2, kanji: "本", onyomi: "HON", kunyomi: "moto", meaning: "Bản, Gốc rễ, Sách", strokes: 5, level: "N5" },
      { id: 3, kanji: "学", onyomi: "GAKU", kunyomi: "mana(bu)", meaning: "Học, Học tập", strokes: 8, level: "N5" },
    ],
  });

  // AI Sensei Interactive State
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(`「〜てしまう」diễn tả hành động đã hoàn tất hoặc lỡ xảy ra điều đáng tiếc 😅
Ví dụ:
宿題を忘れてしまった。
→ Tôi lỡ quên mang bài tập mất rồi.`);
  const [loading, setLoading] = useState(false);

  // Fetch Home Data
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/home");
        if (response.data) {
          setHomeData(prev => ({
            ...prev,
            ...response.data,
            featuredWords: response.data.featuredWords?.length ? response.data.featuredWords : prev.featuredWords,
            featuredKanji: response.data.featuredKanji?.length ? response.data.featuredKanji : prev.featuredKanji,
          }));
        }
      } catch (err) {
        console.log("Sử dụng dữ liệu khởi tạo cho trang chủ:", err);
      }
    };
    fetchHomeData();
  }, []);

  // Hỏi AI Sensei
  const askAi = async () => {
    if (!message.trim()) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/ai/preview",
        { message: message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply(response.data.reply || response.data);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        clearAuthStorage();
        setIsLoggedIn(false);
        navigate("/login?expired=1");
      } else {
        setReply("AI Sensei đang tổng hợp bài giảng, bạn hãy thử lại sau giây lát nhé! 🌸");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthStorage();
    setIsLoggedIn(false);
    setUserEmail("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 selection:text-indigo-800 relative font-sans overflow-x-hidden">
      
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-100/70 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-[450px] h-[450px] bg-rose-100/60 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* ======================================================= */}
      {/* 1. TOP NAVBAR */}
      {/* ======================================================= */}
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 py-4.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-rose-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              日
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 flex items-center gap-1.5">
                NihonAI
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-200/60 uppercase">
                  Sensei Hub
                </span>
              </span>
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 -mt-1 uppercase">
                Học tiếng Nhật thông minh với AI
              </p>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <Link to="/vocabulary" className="hover:text-indigo-600 transition">📚 Từ vựng</Link>
            <Link to="/kanji" className="hover:text-indigo-600 transition">🈴 Kanji</Link>
            <Link to="/grammar" className="hover:text-indigo-600 transition">📖 Ngữ pháp</Link>
            <Link to="/flashcards" className="hover:text-indigo-600 transition">🃏 Flashcard</Link>
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-bold text-slate-600">
                  Chào, {userEmail.split("@")[0]} 👋
                </span>
                <Link
                  to="/home"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all"
                >
                  🚀 Vào Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm transition"
                  title="Đăng xuất"
                >
                  🚪
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4.5 py-2.5 rounded-2xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 font-bold text-sm transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg hover:scale-[1.02] transition-all"
                >
                  Tạo tài khoản
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ======================================================= */}
      {/* 2. HERO SECTION */}
      {/* ======================================================= */}
      <section className="relative px-6 sm:px-12 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto text-center">
        
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full border border-indigo-200 bg-white/90 shadow-xs mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-700">
            Phiên bản 2.0 • Tích hợp phân chia bài học & Giọng phát âm chuẩn Tokyo 🇯🇵
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-5xl mx-auto mb-6">
          Chinh phục tiếng Nhật <br className="hidden sm:block" />
          thông minh và tự nhiên cùng{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
            AI Sensei
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
          Hệ thống ghi nhớ dài hạn <strong className="text-slate-800">Spaced Repetition (SRS)</strong> kết hợp trợ lý AI giải thích ngữ cảnh chi tiết, phát âm chuẩn xác từng từ vựng, Kanji và ngữ pháp Minna no Nihongo.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={() => navigate(isLoggedIn ? "/home" : "/login")}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-extrabold text-base shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3"
          >
            <span>🚀 Bắt đầu học miễn phí</span>
            <span>→</span>
          </button>
          
          <Link
            to="/vocabulary"
            className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-extrabold text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <span>📚 Khám phá kho từ vựng</span>
          </Link>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 rounded-3xl bg-white/80 border border-slate-200/80 backdrop-blur-md shadow-sm">
          <div className="p-4 text-center">
            <p className="text-3xl font-black text-indigo-600">{homeData.totalVocabulary}+</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Từ vựng chuẩn N5-N1</p>
          </div>
          <div className="p-4 text-center border-l border-slate-100">
            <p className="text-3xl font-black text-rose-500">{homeData.totalKanji}+</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Chữ Hán & Thứ tự nét</p>
          </div>
          <div className="p-4 text-center border-l border-slate-100">
            <p className="text-3xl font-black text-purple-600">50+</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Bài học cấu trúc</p>
          </div>
          <div className="p-4 text-center border-l border-slate-100">
            <p className="text-3xl font-black text-emerald-600">24/7</p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Trợ lý AI Sensei</p>
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 3. INTERACTIVE AI SENSEI SHOWCASE */}
      {/* ======================================================= */}
      <section className="px-6 sm:px-12 py-16 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xl shadow-indigo-500/5 grid lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/70">
              <span>🌸</span> AI Sensei Thông Minh
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Hỏi đáp ngữ pháp & tình huống giao tiếp bất cứ lúc nào
            </h2>
            
            <p className="text-slate-600 text-base leading-relaxed">
              Không còn cảm giác bối rối khi gặp các cấu trúc khó. Nhập bất kỳ câu hỏi nào về từ vựng, ngữ cảnh sử dụng hay sự khác biệt giữa các từ đồng nghĩa để nhận giải đáp cặn kẽ ngay tức thì.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                Giải thích nghĩa thuần Việt kèm ví dụ thực tế
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                Phân biệt sắc thái trang trọng (Keigo) & thân mật
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                Sẵn sàng phát âm từng câu thoại giọng Nhật chuẩn
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 shadow-inner space-y-4">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white font-bold flex items-center justify-center shadow-xs">
                    🤖
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">NihonAI Sensei</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Trực tuyến 24/7
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60">
                  Thử nghiệm tương tác
                </span>
              </div>

              {/* Chat bubble response */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-sm leading-relaxed text-slate-800 font-medium whitespace-pre-line shadow-xs">
                {reply}
              </div>

              {/* Chat input box */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Ví dụ: Phân biệt 〜てしまう và 〜ておく..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAi()}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
                />
                <button
                  onClick={askAi}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  {loading ? "Đang nghĩ..." : "Hỏi ngay 🚀"}
                </button>
              </div>

              {!isLoggedIn && (
                <p className="text-[11px] text-slate-500 text-center italic">
                  💡 Bạn cần <Link to="/login" className="text-indigo-600 font-bold underline">đăng nhập</Link> để AI Sensei ghi nhớ tiến trình học tập của riêng bạn.
                </p>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================= */}
      {/* 4. FEATURED WORDS & KANJI SHOWCASE */}
      {/* ======================================================= */}
      <section className="px-6 sm:px-12 py-16 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Kho kiến thức phân chia theo từng bài học
          </h2>
          <p className="text-slate-600 text-base mt-3">
            Học từng bước từ N5 đến N1 với lộ trình rõ ràng, phát âm giọng Nhật chuẩn 🔊 và lưu trữ tức thì vào bộ thẻ ôn tập.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Featured Vocabulary */}
          <div className="p-7 rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <h3 className="font-extrabold text-lg text-slate-900">Từ vựng tiêu biểu</h3>
              </div>
              <Link to="/vocabulary" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                Xem toàn bộ →
              </Link>
            </div>

            <div className="space-y-3">
              {homeData.featuredWords.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 hover:bg-white hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xl font-black text-slate-900">{item.word}</span>
                      <span className="text-xs font-semibold text-slate-500">{item.romaji}</span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200/80">
                        {item.level || "N5"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-indigo-700 mt-1">{item.meaning}</p>
                    {item.example && (
                      <p className="text-xs text-slate-500 mt-0.5 italic">{item.example}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Kanji */}
          <div className="p-7 rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🈴</span>
                <h3 className="font-extrabold text-lg text-slate-900">Chữ Hán Kanji tiêu biểu</h3>
              </div>
              <Link to="/kanji" className="text-xs font-bold text-rose-600 hover:text-rose-800">
                Xem toàn bộ →
              </Link>
            </div>

            <div className="space-y-3">
              {homeData.featuredKanji.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-rose-300 hover:bg-white hover:shadow-sm transition-all flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-xs flex-shrink-0">
                    {item.kanji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">{item.meaning}</span>
                      <span className="text-[11px] font-bold text-slate-500">{item.strokes} nét</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong className="text-rose-600">On:</strong> {item.onyomi} • <strong className="text-indigo-600">Kun:</strong> {item.kunyomi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ======================================================= */}
      {/* 5. FOOTER */}
      {/* ======================================================= */}
      <footer className="border-t border-slate-200/80 bg-white py-12 px-6 sm:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-rose-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              日
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900">NihonAI</span>
              <p className="text-xs text-slate-500">Nền tảng học tiếng Nhật thông minh với AI • 安全・便利</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <Link to="/vocabulary" className="hover:text-indigo-600">Từ vựng</Link>
            <Link to="/kanji" className="hover:text-indigo-600">Kanji</Link>
            <Link to="/grammar" className="hover:text-indigo-600">Ngữ pháp</Link>
            <Link to="/flashcards" className="hover:text-indigo-600">Flashcards</Link>
            <Link to="/login" className="hover:text-indigo-600">Đăng nhập</Link>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 NihonAI. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}