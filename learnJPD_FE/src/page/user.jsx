import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  // =========================
  // SIDEBAR STATE
  // =========================
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // =========================
  // CHATBOX STATE
  // =========================
  const [chatboxOpen, setChatboxOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  // =========================
  // SEARCH STATE
  // =========================
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("vocabulary");
  const [translateDirection, setTranslateDirection] = useState("vi-ja");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // =========================
  // SETTINGS DROPDOWN STATE
  // =========================
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // =========================
  // FLASHCARD MODAL STATE
  // =========================
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardData, setFlashcardData] = useState({
    front: "",
    back: "",
    type: "vocabulary",
    tags: "",
    example: "",
  });

  // =========================
  // USER STATE
  // =========================
  const [user, setUser] = useState({
    id: null,
    username: "",
    email: "",
    currentLevel: "N5",
    avatar: "",
    fullName: "",
    joinDate: "",
    bio: "",
  });

  // =========================
  // LEARNING STATS
  // =========================
  const [stats, setStats] = useState({
    vocabularyLearned: 0,
    vocabularyTotal: 500,
    kanjiLearned: 0,
    kanjiTotal: 2136,
    grammarLearned: 0,
    grammarTotal: 200,
    streak: 0,
    xp: 0,
    flashcardCount: 0,
  });

  // =========================
  // SETTINGS STATE (Dark Mode)
  // =========================
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    dailyReminder: true,
    studyReminderTime: "19:00",
    autoPlayAudio: true,
    showFurigana: true,
    languageInterface: "vi",
    fontSize: "medium",
  });

  // =========================
  // RECENT ACTIVITIES
  // =========================
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // GET AUTH HEADER
  // =========================
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // =========================
  // CHECK LOGIN STATUS
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchUserData();
      fetchUserStats();
      fetchRecentActivities();
      loadSettings();
    }
  }, []);

  // =========================
  // APPLY DARK MODE
  // =========================
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  // =========================
  // LOAD SETTINGS
  // =========================
  const loadSettings = () => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  // =========================
  // SAVE SETTINGS
  // =========================
  const saveSettings = async (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("userSettings", JSON.stringify(newSettings));

    try {
      await axios.put(
        "http://localhost:8080/api/user/settings",
        newSettings,
        { headers: getAuthHeader() }
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // =========================
  // TOGGLE DARK MODE
  // =========================
  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    saveSettings({ ...settings, darkMode: newDarkMode });
  };

  // =========================
  // FETCH USER DATA
  // =========================
  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/profile", {
        headers: getAuthHeader(),
      });
      setUser(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) handleLogout();
    }
  };

  // =========================
  // FETCH USER STATS
  // =========================
  const fetchUserStats = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/stats", {
        headers: getAuthHeader(),
      });
      setStats(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH RECENT ACTIVITIES
  // =========================
  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/activities", {
        headers: getAuthHeader(),
      });
      setRecentActivities(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // HANDLE SEARCH
  // =========================
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      let endpoint = "";
      let params = {};

      switch (searchType) {
        case "vocabulary":
          endpoint = "/api/search/vocabulary";
          params = { q: searchQuery };
          break;
        case "kanji":
          endpoint = "/api/search/kanji";
          params = { q: searchQuery };
          break;
        case "grammar":
          endpoint = "/api/search/grammar";
          params = { q: searchQuery };
          break;
        default:
          return;
      }

      const response = await axios.get(endpoint, {
        params,
        headers: getAuthHeader(),
      });

      setSearchResults(response.data);
      setShowSearchResults(true);
      setTimeout(() => setShowSearchResults(false), 10000);
    } catch (error) {
      console.error(error);
      setSearchResults([{ error: true, message: "Không tìm thấy kết quả" }]);
      setShowSearchResults(true);
    }
  };

  // =========================
  // AI TRANSLATE
  // =========================
  const handleAITranslate = async () => {
    if (!searchQuery.trim()) return;

    setAiLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/ai/translate",
        {
          text: searchQuery,
          from: translateDirection === "vi-ja" ? "vi" : "ja",
          to: translateDirection === "vi-ja" ? "ja" : "vi"
        },
        { headers: getAuthHeader() }
      );

      setSearchResults([{
        type: "ai",
        original: searchQuery,
        translation: response.data.translation,
        pronunciation: response.data.pronunciation,
        example: response.data.example
      }]);
      setShowSearchResults(true);
      setTimeout(() => setShowSearchResults(false), 10000);
    } catch (error) {
      console.error(error);
      setSearchResults([{ error: true, message: "Dịch thất bại, vui lòng thử lại!" }]);
      setShowSearchResults(true);
    } finally {
      setAiLoading(false);
    }
  };

  // =========================
  // CREATE FLASHCARD
  // =========================
  const createFlashcard = async () => {
    if (!flashcardData.front || !flashcardData.back) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/flashcards",
        {
          front: flashcardData.front,
          back: flashcardData.back,
          type: flashcardData.type,
          tags: flashcardData.tags.split(",").map(t => t.trim()),
          example: flashcardData.example,
        },
        { headers: getAuthHeader() }
      );

      setShowFlashcardModal(false);
      setFlashcardData({
        front: "",
        back: "",
        type: "vocabulary",
        tags: "",
        example: "",
      });
      fetchUserStats();
      alert("Tạo flashcard thành công!");
    } catch (error) {
      console.error(error);
      alert("Tạo flashcard thất bại!");
    }
  };

  // =========================
  // ADD TO FLASHCARD FROM SEARCH
  // =========================
  const addToFlashcard = (item) => {
    setFlashcardData({
      front: item.word || item.kanji || item.grammar,
      back: item.meaning || item.reading || item.explanation,
      type: item.type,
      tags: item.tags?.join(", ") || "",
      example: item.example || "",
    });
    setShowFlashcardModal(true);
    setShowSearchResults(false);
  };

  // =========================
  // ASK AI
  // =========================
  const askAi = async () => {
    if (!message.trim()) return;

    setChatHistory([...chatHistory, { role: "user", content: message, timestamp: new Date() }]);
    setAiLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/ai/chat",
        { message: message },
        { headers: getAuthHeader() }
      );

      setChatHistory(prev => [...prev, {
        role: "ai",
        content: response.data.reply,
        timestamp: new Date()
      }]);
      setMessage("");
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, {
        role: "ai",
        content: "Xin lỗi, AI Sensei đang bận. Vui lòng thử lại sau! 😅",
        timestamp: new Date()
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  // =========================
  // HANDLE LOGOUT
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userSettings");
    navigate("/login");
  };

  // =========================
  // SIDEBAR MENU ITEMS
  // =========================
  const menuItems = [
    { id: "dashboard", label: "Trang chủ", icon: "📊", path: "/home" },
    { id: "flashcards", label: "Flashcards", icon: "🃏", path: "/flashcards", important: true },
    { id: "vocabulary", label: "Từ vựng", icon: "📚", path: "/vocabulary" },
    { id: "kanji", label: "Kanji", icon: "🈴", path: "/kanji" },
    { id: "grammar", label: "Ngữ pháp", icon: "📖", path: "/grammar" },
    { id: "quiz", label: "Luyện tập", icon: "🎯", path: "/quiz" },
    { id: "progress", label: "Tiến trình", icon: "📈", path: "/progress" },
    { id: "achievements", label: "Thành tựu", icon: "🏆", path: "/achievements" },
  ];

  // =========================
  // LEVEL BADGE
  // =========================
  const LevelBadge = ({ level }) => {
    const colors = {
      N5: "from-green-500 to-emerald-400",
      N4: "from-blue-500 to-cyan-400",
      N3: "from-yellow-500 to-orange-400",
      N2: "from-purple-500 to-pink-400",
      N1: "from-red-500 to-rose-400",
    };
    return (
      <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors[level]} text-white text-xs font-bold shadow-lg`}>
        {level}
      </span>
    );
  };

  return (
    <div className={`min-h-screen ${!settings.darkMode ? "bg-gray-50" : "bg-[#0F172A]"} overflow-hidden`}>

      {/* ========================= */}
      {/* MAIN LAYOUT WITH SIDEBAR */}
      {/* ========================= */}
      <div className="flex h-screen">

        {/* ===== SIDEBAR ===== */}
        <aside
          className={`fixed lg:relative z-30 h-full transition-all duration-300 backdrop-blur-xl border-r ${sidebarCollapsed ? "w-20" : "w-64"
            } ${!settings.darkMode
              ? "bg-white/95 border-gray-200"
              : "bg-[#0F172A]/95 border-white/10"
            }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-sm font-bold text-white">
                  日
                </div>
                <span className={`font-bold text-lg ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>
                  NihonAI
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-2 rounded-lg transition-all ${!settings.darkMode ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-white"}`}
            >
              {sidebarCollapsed ? "☰" : "✕"}
            </button>
          </div>

          {/* User Avatar - Click để vào Profile */}
          <div className={`p-5 border-b border-gray-200 dark:border-white/10 ${sidebarCollapsed ? "text-center" : ""}`}>
            <button
              onClick={() => navigate("/profile")}
              className="w-full group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xl mx-auto mb-2 hover:scale-105 transition cursor-pointer shadow-lg group-hover:shadow-purple-500/30 text-white">
                {user.avatar || "👤"}
              </div>
              {!sidebarCollapsed && (
                <>
                  <p className={`font-semibold text-center transition ${!settings.darkMode ? "text-gray-800 hover:text-purple-600" : "text-white hover:text-cyan-300"}`}>
                    {user.username || "Learner"}
                  </p>
                  <div className="flex justify-center mt-1">
                    <LevelBadge level={user.currentLevel} />
                  </div>

                </>
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="p-3 space-y-1 overflow-y-auto" style={{ height: "calc(100% - 280px)" }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "flashcards") {
                    alert("Trang Flashcards đang được phát triển! 🚀");
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.id === "dashboard"
                  ? "bg-gradient-to-r from-purple-500/20 to-cyan-400/20 text-cyan-600 dark:text-cyan-300"
                  : `${!settings.darkMode ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-white/10"}`
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="text-sm">{item.label}</span>
                    {item.important && (
                      <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300">
                        Sắp ra mắt
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </nav>

          {/* Copyright ở cuối sidebar */}
          <div className="absolute bottom-5 left-0 right-0 p-3 text-center">
            <p className={`text-xs ${!sidebarCollapsed ? "" : "text-center"} ${!settings.darkMode ? "text-gray-400" : "text-gray-600"}`}>
              © 2025 NihonAI
            </p>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 overflow-y-auto">

          {/* Overlay for mobile sidebar */}
          {!sidebarCollapsed && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarCollapsed(true)}
            />
          )}

          {/* ===== HEADER WITH SEARCH ===== */}
          <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-6 py-4 ${!settings.darkMode
            ? "bg-white/80 border-gray-200"
            : "bg-[#0F172A]/80 border-white/10"
            }`}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarCollapsed(false)}
                className={`lg:hidden p-2 rounded-lg transition-all ${!settings.darkMode ? "hover:bg-gray-100 text-gray-700" : "hover:bg-white/10 text-white"}`}
              >
                ☰
              </button>

              {/* Search Bar with Type Selector */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex gap-2">
                  {/* Search Type Dropdown */}
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className={`border rounded-xl px-4 py-3 outline-none text-sm ${!settings.darkMode
                      ? "bg-white border-gray-300 text-gray-900"
                      : "bg-[#1E293B] border-white/20 text-white"
                      }`}
                  >
                    <option value="vocabulary">📚 Từ vựng</option>
                    <option value="kanji">🈴 Kanji</option>
                    <option value="grammar">📖 Ngữ pháp</option>
                    <option value="ai">🤖 AI dịch</option>
                  </select>

                  {/* Direction Toggle - Chỉ hiện khi chọn AI dịch */}
                  {searchType === "ai" && (
                    <button
                      onClick={() => setTranslateDirection(translateDirection === "vi-ja" ? "ja-vi" : "vi-ja")}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${!settings.darkMode
                        ? "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                        : "bg-[#1E293B] border-cyan-400/30 text-white hover:bg-[#2D3A5E]"
                        }`}
                    >
                      {translateDirection === "vi-ja" ? "🇻🇳 → 🇯🇵" : "🇯🇵 → 🇻🇳"}
                    </button>
                  )}

                  {/* Search Input */}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={
                        searchType === "vocabulary" ? "Tìm từ vựng..." :
                          searchType === "kanji" ? "Tìm Kanji..." :
                            searchType === "grammar" ? "Tìm cấu trúc ngữ pháp..." :
                              translateDirection === "vi-ja" ? "Nhập tiếng Việt để dịch sang Nhật..." :
                                "Nhập tiếng Nhật để dịch sang Việt..."
                      }
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (searchType === "ai" ? handleAITranslate() : handleSearch())}
                      className={`w-full border rounded-xl px-5 py-3 pl-12 outline-none transition-all ${!settings.darkMode
                        ? "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-400"
                        : "bg-[#1E293B] border-white/20 text-white placeholder-gray-400 focus:border-cyan-400/50"
                        }`}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {searchType === "vocabulary" ? "📚" :
                        searchType === "kanji" ? "🈴" :
                          searchType === "grammar" ? "📖" :
                            translateDirection === "vi-ja" ? "🇻🇳" : "🇯🇵"}
                    </span>
                    <button
                      onClick={searchType === "ai" ? handleAITranslate : handleSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm hover:scale-105 transition font-medium shadow-lg"
                    >
                      {searchType === "ai" ? "Dịch" : "Tìm"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Header Right Icons: Notification + Settings Dropdown */}
              <div className="flex items-center gap-3">
                {/* Notification Button */}
                <button className={`p-2 rounded-lg relative group transition-all ${!settings.darkMode ? "hover:bg-gray-100" : "hover:bg-white/10"}`}>
                  <span className="text-xl">🔔</span>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    Thông báo
                  </span>
                </button>

                {/* Settings Button with Topdown Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    className={`p-2 rounded-lg relative group transition-all ${!settings.darkMode ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
                  >
                    <span className="text-xl">⚙️</span>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                      Cài đặt
                    </span>
                  </button>

                  {/* Settings Dropdown Menu */}
                  {showSettingsDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowSettingsDropdown(false)}
                      />
                      <div className={`absolute top-full right-0 mt-2 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden ${!settings.darkMode
                        ? "bg-white border-gray-200 shadow-gray-300"
                        : "bg-[#1E293B] border-white/10"
                        }`}>
                        <button
                          onClick={() => {
                            setShowSettingsDropdown(false);
                            navigate("/settings");
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition text-left ${!settings.darkMode
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                            }`}
                        >
                          <span>⚙️</span>
                          <span className="text-sm">Cài đặt chung</span>
                        </button>

                        <button
                          onClick={() => {
                            toggleDarkMode();
                            setShowSettingsDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition text-left ${!settings.darkMode
                            ? "text-gray-700 hover:bg-gray-100"
                            : "text-white hover:bg-white/10"
                            }`}
                        >
                          <span>{settings.darkMode ? "☀️" : "🌙"}</span>
                          <span className="text-sm">
                            {settings.darkMode ? "Chế độ sáng" : "Chế độ tối"}
                          </span>
                        </button>

                        <div className={`border-t ${!settings.darkMode ? "border-gray-200" : "border-white/10"}`}>
                          <button
                            onClick={() => {
                              setShowSettingsDropdown(false);
                              navigate("/profile");
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition text-left ${!settings.darkMode
                              ? "text-gray-700 hover:bg-gray-100"
                              : "text-white hover:bg-white/10"
                              }`}
                          >
                            <span>👤</span>
                            <span className="text-sm">Hồ sơ của tôi</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowSettingsDropdown(false);
                              handleLogout();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition text-left ${!settings.darkMode
                              ? "text-red-600 hover:bg-red-50"
                              : "text-red-400 hover:bg-red-500/10"
                              }`}
                          >
                            <span>🚪</span>
                            <span className="text-sm">Đăng xuất</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-2 mx-6 rounded-xl border shadow-2xl z-20 max-h-96 overflow-y-auto ${!settings.darkMode
                ? "bg-white border-gray-200"
                : "bg-[#1E293B] border-white/10"
                }`}>
                {searchResults.map((result, idx) => (
                  <div key={idx} className={`p-4 border-b transition cursor-pointer group ${!settings.darkMode
                    ? "border-gray-100 hover:bg-gray-50"
                    : "border-white/10 hover:bg-white/5"
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {result.type === "ai" ? (
                          <>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">🤖</span>
                              <span className={`font-semibold ${!settings.darkMode ? "text-purple-600" : "text-cyan-300"}`}>AI Dịch</span>
                              <span className="text-xs text-gray-500">
                                {translateDirection === "vi-ja" ? "🇻🇳 → 🇯🇵" : "🇯🇵 → 🇻🇳"}
                              </span>
                            </div>
                            <div className={`mb-3 p-3 rounded-xl ${!settings.darkMode ? "bg-gray-100" : "bg-white/5"}`}>
                              <p className="text-xs text-gray-400 mb-1">原文 / Gốc:</p>
                              <p className={`text-base font-medium ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>{result.original}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${!settings.darkMode ? "bg-purple-50" : "bg-gradient-to-r from-purple-500/20 to-cyan-400/20"}`}>
                              <p className="text-xs text-gray-400 mb-1">Dịch / 翻訳:</p>
                              <p className={`text-base font-semibold ${!settings.darkMode ? "text-purple-600" : "text-cyan-300"}`}>{result.translation}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">
                                {result.type === "vocabulary" ? "📚" :
                                  result.type === "kanji" ? "🈴" : "📖"}
                              </span>
                              <span className={`font-semibold ${!settings.darkMode ? "text-purple-600" : "text-cyan-300"}`}>
                                {result.word || result.kanji || result.grammar}
                              </span>
                              {result.reading && (
                                <span className="text-xs text-gray-400">[{result.reading}]</span>
                              )}
                            </div>
                            <p className={`text-sm ${!settings.darkMode ? "text-gray-600" : "text-gray-300"}`}>
                              {result.meaning || result.explanation}
                            </p>
                            {result.example && (
                              <p className="text-xs text-gray-500 mt-1">例: {result.example}</p>
                            )}
                          </>
                        )}
                      </div>

                      {result.type !== "ai" && result.type !== "error" && (
                        <button
                          onClick={() => addToFlashcard(result)}
                          className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/30 to-cyan-400/30 text-xs hover:scale-105 transition-all"
                        >
                          ➕ Thẻ học
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </header>

          {/* ===== MAIN DASHBOARD CONTENT ===== */}
          <div className="p-6">

            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>
                Chào mừng, <span className="bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">{user.username || "Học viên"}</span>
              </h1>
              <p className={`mt-1 ${!settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Tiếp tục hành trình chinh phục tiếng Nhật của bạn
              </p>
            </div>

            {/* ===== STATS CARDS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              {/* Vocabulary Card */}
              <div className={`p-6 rounded-2xl transition-all cursor-pointer ${!settings.darkMode
                ? "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                : "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:scale-105"
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${!settings.darkMode
                    ? "bg-gray-100"
                    : "bg-gradient-to-br from-blue-500 to-cyan-400"
                    }`}>
                    📚
                  </div>
                  <span className={`text-2xl font-bold ${!settings.darkMode ? "text-blue-600" : "text-blue-400"}`}>
                    {stats.vocabularyLearned}
                  </span>
                </div>
                <h3 className={`font-semibold ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>Từ vựng</h3>
                <p className={`text-xs ${!settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Mục tiêu: {stats.vocabularyTotal}
                </p>
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    style={{ width: `${(stats.vocabularyLearned / stats.vocabularyTotal) * 100}%` }} />
                </div>
              </div>

              {/* Kanji Card */}
              <div className={`p-6 rounded-2xl transition-all cursor-pointer ${!settings.darkMode
                ? "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                : "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:scale-105"
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${!settings.darkMode
                    ? "bg-gray-100"
                    : "bg-gradient-to-br from-purple-500 to-pink-400"
                    }`}>
                    🈴
                  </div>
                  <span className={`text-2xl font-bold ${!settings.darkMode ? "text-purple-600" : "text-purple-400"}`}>
                    {stats.kanjiLearned}
                  </span>
                </div>
                <h3 className={`font-semibold ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>Kanji</h3>
                <p className={`text-xs ${!settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Mục tiêu: {stats.kanjiTotal}
                </p>
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                    style={{ width: `${(stats.kanjiLearned / stats.kanjiTotal) * 100}%` }} />
                </div>
              </div>

              {/* Grammar Card */}
              <div className={`p-6 rounded-2xl transition-all cursor-pointer ${!settings.darkMode
                ? "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                : "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:scale-105"
                }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${!settings.darkMode
                    ? "bg-gray-100"
                    : "bg-gradient-to-br from-green-500 to-emerald-400"
                    }`}>
                    📖
                  </div>
                  <span className={`text-2xl font-bold ${!settings.darkMode ? "text-green-600" : "text-green-400"}`}>
                    {stats.grammarLearned}
                  </span>
                </div>
                <h3 className={`font-semibold ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>Ngữ pháp</h3>
                <p className={`text-xs ${!settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Mục tiêu: {stats.grammarTotal}
                </p>
                <div className="mt-2 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                    style={{ width: `${(stats.grammarLearned / stats.grammarTotal) * 100}%` }} />
                </div>
              </div>

              {/* Flashcards Card */}
              <div className={`p-6 rounded-2xl transition-all cursor-pointer ${!settings.darkMode
                ? "bg-white border border-gray-200 shadow-sm hover:shadow-md"
                : "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:scale-105"
                }`}
                onClick={() => alert("Trang Flashcards đang được phát triển! 🚀")}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${!settings.darkMode
                    ? "bg-gray-100"
                    : "bg-gradient-to-br from-yellow-500 to-orange-400"
                    }`}>
                    🃏
                  </div>
                  <span className={`text-2xl font-bold ${!settings.darkMode ? "text-yellow-600" : "text-yellow-400"}`}>
                    {stats.flashcardCount || 0}
                  </span>
                </div>
                <h3 className={`font-semibold ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>Flashcards</h3>
                <p className={`text-xs ${!settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  Thẻ học của bạn
                </p>
                <p className={`mt-2 text-xs ${!settings.darkMode ? "text-yellow-600" : "text-yellow-500/70"}`}>
                  Nhấn để xem chi tiết →
                </p>
              </div>
            </div>

            {/* Recent Activities */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm ${!settings.darkMode
              ? "bg-white border border-gray-200 shadow-sm"
              : "bg-white/5 border border-white/10"
              }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold flex items-center gap-2 ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>
                  <span>📝</span> Hoạt động gần đây
                </h3>
                <button className={`text-sm transition ${!settings.darkMode ? "text-purple-600 hover:text-purple-700" : "text-cyan-400 hover:text-cyan-300"}`}>
                  Xem tất cả →
                </button>
              </div>
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition ${!settings.darkMode
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-white/5 hover:bg-white/10"
                      }`}>
                      <div className="text-2xl">{activity.icon || "✅"}</div>
                      <div className="flex-1">
                        <p className={`text-sm ${!settings.darkMode ? "text-gray-700" : "text-white"}`}>
                          {activity.description}
                        </p>
                        <p className={`text-xs mt-0.5 ${!settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {activity.time}
                        </p>
                      </div>
                      <div className="text-xs text-cyan-400">+{activity.xp} XP</div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-8 ${!settings.darkMode ? "text-gray-400" : "text-gray-400"}`}>
                    <p>Chưa có hoạt động nào</p>
                    <p className="text-sm mt-1">Hãy bắt đầu học ngay!</p>
                  </div>
                )}
              </div>
            </div>
            {/* ===== FOOTER ===== */}
            <footer className={`mt-8 pt-6 pb-4 border-t ${!settings.darkMode
              ? "border-gray-200"
              : "border-white/10"
              }`}>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                {/* Left side - Copyright & Brand */}
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
                      日
                    </div>
                    <span className={`text-sm font-semibold ${!settings.darkMode ? "text-gray-700" : "text-white"}`}>
                      NihonAI
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${!settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    © 2025 NihonAI. All rights reserved.
                  </p>
                </div>

                {/* Center - Links */}
                <div className="flex flex-wrap gap-6 justify-center">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Giới thiệu về NihonAI"); }}
                    className={`text-xs transition ${!settings.darkMode ? "text-gray-500 hover:text-purple-600" : "text-gray-400 hover:text-cyan-300"}`}
                  >
                    Giới thiệu
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Điều khoản sử dụng"); }}
                    className={`text-xs transition ${!settings.darkMode ? "text-gray-500 hover:text-purple-600" : "text-gray-400 hover:text-cyan-300"}`}
                  >
                    Điều khoản
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Chính sách bảo mật"); }}
                    className={`text-xs transition ${!settings.darkMode ? "text-gray-500 hover:text-purple-600" : "text-gray-400 hover:text-cyan-300"}`}
                  >
                    Bảo mật
                  </a>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Hỗ trợ / Liên hệ"); }}
                    className={`text-xs transition ${!settings.darkMode ? "text-gray-500 hover:text-purple-600" : "text-gray-400 hover:text-cyan-300"}`}
                  >
                    Hỗ trợ
                  </a>
                </div>

                {/* Right side - Social links & Version */}
                <div className="flex flex-col items-center md:items-end gap-2">
                  <div className="flex gap-3">
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert("Facebook"); }}
                      className={`transition ${!settings.darkMode ? "text-gray-500 hover:text-blue-600" : "text-gray-400 hover:text-blue-400"}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert("Twitter"); }}
                      className={`transition ${!settings.darkMode ? "text-gray-500 hover:text-sky-500" : "text-gray-400 hover:text-sky-400"}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.68-11.792c0-.21-.005-.424-.015-.636A9.936 9.936 0 0024 4.59z" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert("GitHub"); }}
                      className={`transition ${!settings.darkMode ? "text-gray-500 hover:text-gray-800" : "text-gray-400 hover:text-white"}`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </a>
                  </div>
                  <p className={`text-xs ${!settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Version 2.0.0
                  </p>
                </div>
              </div>
            </footer>
          </div>

        </main>
      </div>

      {/* ========================= */}
      {/* CREATE FLASHCARD MODAL */}
      {/* ========================= */}
      {showFlashcardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl ${!settings.darkMode
            ? "bg-white border-gray-200"
            : "bg-[#0F172A] border-white/20"
            }`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                Tạo Flashcard mới
              </h3>
              <button
                onClick={() => setShowFlashcardModal(false)}
                className={`p-2 rounded-lg transition ${!settings.darkMode ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${!settings.darkMode ? "text-gray-600" : "text-gray-400"}`}>Loại thẻ</label>
                <select
                  value={flashcardData.type}
                  onChange={(e) => setFlashcardData({ ...flashcardData, type: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-2 outline-none ${!settings.darkMode
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-white/10 border-white/20 text-white"
                    }`}
                >
                  <option value="vocabulary">📚 Từ vựng</option>
                  <option value="kanji">🈴 Kanji</option>
                  <option value="grammar">📖 Ngữ pháp</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm mb-1 ${!settings.darkMode ? "text-gray-600" : "text-gray-400"}`}>Mặt trước</label>
                <textarea
                  value={flashcardData.front}
                  onChange={(e) => setFlashcardData({ ...flashcardData, front: e.target.value })}
                  placeholder="Nhập nội dung mặt trước..."
                  rows={2}
                  className={`w-full border rounded-xl px-4 py-2 outline-none resize-none ${!settings.darkMode
                    ? "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    : "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${!settings.darkMode ? "text-gray-600" : "text-gray-400"}`}>Mặt sau (Nghĩa)</label>
                <textarea
                  value={flashcardData.back}
                  onChange={(e) => setFlashcardData({ ...flashcardData, back: e.target.value })}
                  placeholder="Nhập nghĩa hoặc giải thích..."
                  rows={3}
                  className={`w-full border rounded-xl px-4 py-2 outline-none resize-none ${!settings.darkMode
                    ? "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    : "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${!settings.darkMode ? "text-gray-600" : "text-gray-400"}`}>Ví dụ (không bắt buộc)</label>
                <textarea
                  value={flashcardData.example}
                  onChange={(e) => setFlashcardData({ ...flashcardData, example: e.target.value })}
                  placeholder="Nhập câu ví dụ..."
                  rows={2}
                  className={`w-full border rounded-xl px-4 py-2 outline-none resize-none ${!settings.darkMode
                    ? "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    : "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    }`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${!settings.darkMode ? "text-gray-600" : "text-gray-400"}`}>Tags (cách nhau bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={flashcardData.tags}
                  onChange={(e) => setFlashcardData({ ...flashcardData, tags: e.target.value })}
                  placeholder="Ví dụ: N5, từ vựng, gia đình"
                  className={`w-full border rounded-xl px-4 py-2 outline-none ${!settings.darkMode
                    ? "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    : "bg-white/10 border-white/20 text-white placeholder-gray-400"
                    }`}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowFlashcardModal(false)}
                  className={`flex-1 py-2 rounded-xl border transition ${!settings.darkMode
                    ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                    : "border-white/20 text-white hover:bg-white/10"
                    }`}
                >
                  Hủy
                </button>
                <button
                  onClick={createFlashcard}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition"
                >
                  Tạo Flashcard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* FLOATING AI CHATBOX */}
      {/* ========================= */}

      {!chatboxOpen && (
        <button
          onClick={() => setChatboxOpen(true)}
          className="fixed bottom-[80px] right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 shadow-2xl shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl text-white"
        >
          🤖
        </button>
      )}

      {chatboxOpen && (
        <div className={`fixed bottom-[80px] right-6 z-40 w-96 h-[500px] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${!settings.darkMode
            ? "bg-white border-gray-200 shadow-gray-300"
            : "bg-[#0F172A] border-white/10 shadow-purple-500/20"
          }`}>
          {/* Chat Header */}
          <div className={`flex items-center justify-between p-4 border-b ${!settings.darkMode
              ? "bg-gray-50 border-gray-200"
              : "bg-gradient-to-r from-purple-500/20 to-cyan-400/20 border-white/10"
            }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-white">
                🤖
              </div>
              <div>
                <h4 className={`font-semibold text-sm ${!settings.darkMode ? "text-gray-800" : "text-white"}`}>
                  AI Sensei
                </h4>
                <p className="text-xs text-cyan-300">Online</p>
              </div>
            </div>
            <button onClick={() => setChatboxOpen(false)} className={`p-2 rounded-lg transition ${!settings.darkMode ? "hover:bg-gray-200" : "hover:bg-white/10"}`}>
              ✕
            </button>
          </div>

          {/* Chat Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${!settings.darkMode ? "bg-gray-50" : ""}`}>
            {chatHistory.length === 0 ? (
              <div className={`text-center py-8 ${!settings.darkMode ? "text-gray-400" : "text-gray-400"}`}>
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-sm">Chào bạn! Mình là AI Sensei</p>
                <p className="text-xs mt-2">Hãy hỏi mình bất cứ điều gì về tiếng Nhật nhé!</p>
              </div>
            ) : (
              chatHistory.map((chat, idx) => (
                <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl ${chat.role === "user"
                      ? "bg-gradient-to-r from-purple-500/30 to-cyan-400/30 rounded-br-sm"
                      : `${!settings.darkMode ? "bg-gray-200 text-gray-800" : "bg-white/10 text-white"} rounded-bl-sm`
                    }`}>
                    <p className="text-sm whitespace-pre-line">{chat.content}</p>
                    <p className={`text-[10px] mt-1 ${!settings.darkMode ? "text-gray-500" : "text-gray-500"}`}>
                      {new Date(chat.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {aiLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-bl-sm ${!settings.darkMode ? "bg-gray-200" : "bg-white/10"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!settings.darkMode ? "text-gray-600" : "text-white"}`}>AI Sensei đang nghĩ</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-2 h-2 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className={`p-4 border-t ${!settings.darkMode ? "border-gray-200" : "border-white/10"}`}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Hỏi AI Sensei..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askAi()}
                className={`flex-1 border rounded-xl px-4 py-2 text-sm outline-none ${!settings.darkMode
                    ? "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400"
                    : "bg-white/10 border-white/20 text-white placeholder-gray-400"
                  }`}
              />
              <button
                onClick={askAi}
                disabled={aiLoading}
                className="px-4 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-sm font-semibold hover:scale-105 transition disabled:opacity-50"
              >
                {aiLoading ? "..." : "Gửi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}