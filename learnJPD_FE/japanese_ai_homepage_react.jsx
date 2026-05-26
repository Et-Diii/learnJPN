import { useEffect, useState } from "react";
import axios from "axios";

export default function JapaneseAIHomePage() {
  const [homeData, setHomeData] = useState({
    totalVocabulary: 0,
    totalKanji: 0,
    totalUsers: 0,
    featuredWords: [],
    featuredKanji: [],
  });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/home"
      );

      setHomeData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

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
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/30">
            日
          </div>

          <h1 className="text-2xl font-black tracking-wide">
            NihonAI
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-5 py-2 rounded-xl border border-white/20 hover:bg-white/10 transition-all duration-300">
            Login
          </button>

          <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20">
            Start Learning
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 px-8 py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
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
            <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-2xl shadow-cyan-500/20">
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

              <p className="text-gray-400 mt-2">
                Vocabulary
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-3xl font-bold text-purple-300">
                {homeData.totalKanji}+
              </h3>

              <p className="text-gray-400 mt-2">
                Kanji
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <h3 className="text-3xl font-bold text-pink-300">
                {homeData.totalUsers}+
              </h3>

              <p className="text-gray-400 mt-2">
                Users
              </p>
            </div>
          </div>
        </div>

        {/* AI Chat */}
        <div className="relative flex justify-center">
          <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
                🤖
              </div>

              <div>
                <h3 className="text-2xl font-bold">
                  AI Sensei
                </h3>

                <p className="text-cyan-300 text-sm">
                  Online • Ready to help
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm max-w-sm">
                <p className="text-gray-200">
                  「〜てしまう」 nghĩa là gì?
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/30 to-cyan-400/20 p-5 rounded-2xl rounded-tr-sm ml-auto border border-cyan-400/20">
                <p className="text-white leading-relaxed">
                  「〜てしまう」 diễn tả:
                  <br />
                  • Làm xong hoàn toàn
                  <br />
                  • Hoặc lỡ làm điều gì 😅
                  <br /><br />
                  宿題を忘れてしまった。
                  <br />
                  → Tôi lỡ quên bài tập mất rồi.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <input
                type="text"
                placeholder="Ask AI Sensei..."
                className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-cyan-400/50"
              />

              <button className="px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:scale-105 transition-all duration-300">
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="relative z-10 px-8 pb-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Vocabulary */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-cyan-300">
                Featured Vocabulary
              </h2>

              <span className="text-sm text-gray-400">
                Popular Words
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {homeData.featuredWords.map((word, index) => (
                <div
                  key={index}
                  className="px-5 py-3 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 hover:scale-105 transition-all duration-300"
                >
                  <span className="text-lg font-semibold text-cyan-200">
                    {word}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Kanji */}
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-purple-300">
                Popular Kanji
              </h2>

              <span className="text-sm text-gray-400">
                JLPT Starter
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {homeData.featuredKanji.map((kanji, index) => (
                <div
                  key={index}
                  className="w-20 h-20 rounded-3xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center hover:scale-110 transition-all duration-300"
                >
                  <span className="text-4xl font-bold text-purple-200">
                    {kanji}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Why NihonAI?
          </h2>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Không chỉ là web học tiếng Nhật.
            Đây là AI companion giúp bạn học dễ hiểu hơn mỗi ngày.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <div
              key={index}
              className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-cyan-400/30 hover:-translate-y-2 transition-all duration-500 backdrop-blur-md"
            >
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold mb-4">
                {item.title}
              </h3>

              <p className="text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-14 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/30">
                日
              </div>

              <h2 className="text-2xl font-bold">
                NihonAI
              </h2>
            </div>

            <p className="text-gray-400 leading-relaxed">
              AI-powered Japanese learning platform giúp việc học tiếng Nhật trở nên dễ hiểu và cá nhân hóa hơn.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5 text-cyan-300">
              Navigation
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>Home</li>
              <li>Vocabulary</li>
              <li>Kanji</li>
              <li>AI Sensei</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5 text-purple-300">
              Features
            </h3>

            <ul className="space-y-3 text-gray-400">
              <li>Smart Quiz</li>
              <li>Custom Decks</li>
              <li>JLPT Roadmap</li>
              <li>AI Roleplay</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-5 text-pink-300">
              Community
            </h3>

            <p className="text-gray-400 mb-5">
              Learn Japanese smarter with AI.
            </p>

            <div className="flex gap-4 text-2xl">
              <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                💬
              </button>

              <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                🎌
              </button>

              <button className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                🚀
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 px-8 text-center text-gray-500 text-sm">
          © 2026 NihonAI — Learn Japanese Smarter with AI.
        </div>
      </footer>
    </div>
  );
}
