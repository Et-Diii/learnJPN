import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Thêm react-router-dom

export default function JapaneseAIHomePage() {
  const navigate = useNavigate(); // Hook điều hướng

  // =========================
  // AUTH STATE
  // =========================
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // =========================
  // HOME DATA
  // =========================
  const [homeData, setHomeData] = useState({
    totalVocabulary: 0,
    totalKanji: 0,
    totalUsers: 0,
    featuredWords: [],
    featuredKanji: [],
  });

  // =========================
  // AI CHAT
  // =========================
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState(`
「〜てしまう」 diễn tả:
• Làm xong hoàn toàn
• Hoặc lỡ làm điều gì 😅

宿題を忘れてしまった。
→ Tôi lỡ quên bài tập mất rồi.
  `);

  // =========================
  // LOADING
  // =========================
  const [loading, setLoading] = useState(false);

  // =========================
  // CHECK LOGIN STATUS
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    
    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  // =========================
  // FETCH HOME DATA
  // =========================
  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/home");
      setHomeData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // ASK AI (with authentication)
  // =========================
  const askAi = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        "http://localhost:8080/api/ai/preview",
        { message: message },
        {
          headers: {
            Authorization: `Bearer ${token}` // Gắn token vào header
          }
        }
      );

      setReply(response.data.reply);
    } catch (error) {
      console.log(error);
      
      // Nếu lỗi 401 (Unauthorized) thì chuyển về login
      if (error.response?.status === 401) {
        handleLogout();
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setReply("AI đang bận 😅");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail("");
    // Có thể chuyển hướng về trang chủ hoặc login
    navigate("/");
  };

  // =========================
  // HANDLE LOGIN NAVIGATION
  // =========================
  const handleLoginClick = () => {
    navigate("/login"); // Chuyển đến trang login
  };

  // =========================
  // HANDLE START LEARNING
  // =========================
  const handleStartLearning = () => {
    if (isLoggedIn) {
      navigate("/home"); // Chuyển đến dashboard nếu đã login
    } else {
      navigate("/login"); // Chuyển đến login nếu chưa login
    }
  };

  // =========================
  // FEATURES
  // =========================
  const features = [
    {
      title: "AI Sensei",
      desc: "AI giải thích ngữ pháp dễ hiểu như giáo viên thật.",
      icon: "🤖",
    },
    {
      title: "Kanji Learning",
      desc: "Học Kanji bằng ví dụ thực tế và trực quan.",
      icon: "漢",
    },
    {
      title: "Custom Deck",
      desc: "Tự tạo bộ từ vựng anime, IT hoặc JLPT riêng.",
      icon: "📚",
    },
    {
      title: "Smart Quiz",
      desc: "AI tự tạo quiz theo điểm yếu của bạn.",
      icon: "🧠",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-hidden relative">

      {/* Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md">

        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/30">
            日
          </div>
          <h1 className="text-2xl font-black tracking-wide">
            NihonAI
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-cyan-300 text-sm">
                  👋 {userEmail.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-all duration-300 text-red-300"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="px-5 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                Login
              </button>
              <button
                onClick={handleStartLearning}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20"
              >
                Start Learning
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-8 py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT */}
        <div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-sm mb-6">
            ✨ AI Powered Japanese Learning
          </div>

          <h2 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            Learn Japanese

            <span className="block bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
              With AI Sensei
            </span>
          </h2>

          <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl">
            Học tiếng Nhật theo cách dễ hiểu hơn.
            AI sẽ giải thích ngữ pháp, tạo quiz thông minh,
            theo dõi điểm yếu và giúp bạn học như có gia sư riêng.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">

            <button
              onClick={handleStartLearning}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-2xl shadow-cyan-500/20"
            >
              🚀 Start Now
            </button>

            <button className="px-8 py-4 rounded-2xl border border-white/20 hover:bg-white/10 transition-all duration-300 text-lg">
              📖 Explore Lessons
            </button>

          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-3xl font-bold text-cyan-300">
                {homeData.totalVocabulary}+
              </h3>
              <p className="text-gray-400 mt-2">Vocabulary</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-3xl font-bold text-purple-300">
                {homeData.totalKanji}+
              </h3>
              <p className="text-gray-400 mt-2">Kanji</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-3xl font-bold text-pink-300">
                {homeData.totalUsers}+
              </h3>
              <p className="text-gray-400 mt-2">Users</p>
            </div>

          </div>
        </div>

        {/* RIGHT AI */}
        <div className="relative flex justify-center">

          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">

              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
                🤖
              </div>

              <div>
                <h3 className="text-2xl font-bold">AI Sensei</h3>
                <p className="text-cyan-300 text-sm">
                  {loading ? "Thinking..." : "Online • Ready to help"}
                </p>
              </div>
            </div>

            {/* USER */}
            <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm max-w-sm mb-5">
              <p className="text-gray-200">
                {message || "「〜てしまう」 nghĩa là gì?"}
              </p>
            </div>

            {/* AI */}
            <div className="bg-gradient-to-r from-purple-500/30 to-cyan-400/20 p-5 rounded-2xl rounded-tr-sm ml-auto border border-cyan-400/20 min-h-[140px] flex items-center">

              {loading ? (
                <div className="flex items-center gap-3">
                  <span className="text-cyan-200 text-lg">AI Sensei đang suy nghĩ</span>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              ) : (
                <p className="text-white leading-relaxed whitespace-pre-line">{reply}</p>
              )}

            </div>

            {/* INPUT */}
            <div className="mt-8 flex gap-3">

              <input
                type="text"
                placeholder="Ask AI Sensei..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    askAi();
                  }
                }}
                className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400/50"
              />

              <button
                onClick={askAi}
                disabled={loading}
                className="px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Send"}
              </button>

            </div>

            {/* Warning for non-logged in users */}
            {!isLoggedIn && (
              <div className="mt-4 text-center text-xs text-gray-500">
                💡 <button onClick={handleLoginClick} className="text-cyan-400 hover:underline">Đăng nhập</button> để lưu lại lịch sử chat và học tập
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}