import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  // =========================
  // USER STATE
  // =========================
  const [user, setUser] = useState({
    id: null,
    username: "",
    email: "",
    currentLevel: "N5",
    joinDate: "",
    totalStudyTime: 0,
    streak: 0,
    xp: 0,
  });

  // =========================
  // LEARNING STATS
  // =========================
  const [stats, setStats] = useState({
    vocabularyLearned: 0,
    kanjiLearned: 0,
    grammarLearned: 0,
    totalQuizzes: 0,
    averageScore: 0,
    completedLessons: 0,
  });

  // =========================
  // RECENT ACTIVITY
  // =========================
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // =========================
  // AI CHAT (User-specific)
  // =========================
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // UI STATE
  // =========================
  const [activeTab, setActiveTab] = useState("overview"); // overview, progress, ai, settings
  const [loadingData, setLoadingData] = useState(true);

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
      fetchRecentActivity();
      fetchAchievements();
    }
  }, []);

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
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
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
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // =========================
  // FETCH RECENT ACTIVITY
  // =========================
  const fetchRecentActivity = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/activities", {
        headers: getAuthHeader(),
      });
      setRecentActivities(response.data.activities || []);
      setUpcomingReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  // =========================
  // FETCH ACHIEVEMENTS
  // =========================
  const fetchAchievements = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/user/achievements", {
        headers: getAuthHeader(),
      });
      setAchievements(response.data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  // =========================
  // ASK AI (User context)
  // =========================
  const askAi = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/ai/chat",
        { message: message },
        { headers: getAuthHeader() }
      );

      setReply(response.data.reply);
      
      // Add to chat history
      setChatHistory([
        ...chatHistory,
        { role: "user", content: message, timestamp: new Date() },
        { role: "ai", content: response.data.reply, timestamp: new Date() },
      ]);
      
      setMessage("");
    } catch (error) {
      console.error("AI Error:", error);
      setReply("Xin lỗi, AI Sensei đang bận. Vui lòng thử lại sau! 😅");
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
    navigate("/login");
  };

  // =========================
  // UPDATE USER LEVEL
  // =========================
  const updateLevel = async (newLevel) => {
    try {
      await axios.put(
        "http://localhost:8080/api/user/level",
        { level: newLevel },
        { headers: getAuthHeader() }
      );
      setUser({ ...user, currentLevel: newLevel });
    } catch (error) {
      console.error("Error updating level:", error);
    }
  };

  // =========================
  // LEVEL BADGE COMPONENT
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
      <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${colors[level]} text-white text-sm font-bold shadow-lg`}>
        {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-hidden relative">
      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute top-1/3 left-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/10 backdrop-blur-md bg-[#0F172A]/60">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-lg font-bold shadow-lg">
            日
          </div>
          <h1 className="text-xl font-black tracking-wide">NihonAI</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-cyan-300 text-sm hidden md:block">
              {user.username || user.email?.split('@')[0]}
            </span>
            <LevelBadge level={user.currentLevel} />
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-red-500/30 hover:bg-red-500/10 transition-all duration-300 text-red-300 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">{user.username || "Learner"}!</span>
          </h1>
          <p className="text-gray-400">Continue your Japanese learning journey with AI Sensei</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">📚</span>
              <span className="text-xs text-cyan-400">Learned</span>
            </div>
            <h3 className="text-2xl font-bold text-cyan-300">{stats.vocabularyLearned}</h3>
            <p className="text-gray-400 text-sm">Từ vựng</p>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full" style={{ width: `${Math.min((stats.vocabularyLearned / 500) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🈴</span>
              <span className="text-xs text-purple-400">Learned</span>
            </div>
            <h3 className="text-2xl font-bold text-purple-300">{stats.kanjiLearned}</h3>
            <p className="text-gray-400 text-sm">Chữ Kanji</p>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" style={{ width: `${Math.min((stats.kanjiLearned / 2136) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">🔥</span>
              <span className="text-xs text-orange-400">Streak</span>
            </div>
            <h3 className="text-2xl font-bold text-orange-300">{user.streak} days</h3>
            <p className="text-gray-400 text-sm">Học liên tục</p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">⭐</span>
              <span className="text-xs text-yellow-400">XP</span>
            </div>
            <h3 className="text-2xl font-bold text-yellow-300">{user.xp} XP</h3>
            <p className="text-gray-400 text-sm">Tổng điểm kinh nghiệm</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
          {[
            { id: "overview", label: "📊 Tổng quan", icon: "📊" },
            { id: "progress", label: "📈 Tiến trình", icon: "📈" },
            { id: "ai", label: "🤖 AI Sensei", icon: "🤖" },
            { id: "settings", label: "⚙️ Cài đặt", icon: "⚙️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg shadow-purple-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📝</span> Hoạt động gần đây
                </h3>
                <div className="space-y-3">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <div className="text-2xl">{activity.icon || "✅"}</div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                        <div className="text-xs text-cyan-400">+{activity.xp} XP</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Chưa có hoạt động nào. Hãy bắt đầu học ngay!</p>
                  )}
                </div>
              </div>

              {/* Upcoming Reviews */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>🔄</span> Ôn tập hôm nay
                </h3>
                <div className="grid gap-3">
                  {upcomingReviews.length > 0 ? (
                    upcomingReviews.map((review, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-400/20 border border-cyan-400/20">
                        <div>
                          <p className="font-medium">{review.item}</p>
                          <p className="text-xs text-gray-400">{review.type}</p>
                        </div>
                        <button className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-sm hover:bg-cyan-500/30 transition">
                          Ôn tập
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-4">🎉 Tốt lắm! Hôm nay không có bài ôn tập nào.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🏆</span> Thành tựu
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {achievements.length > 0 ? (
                  achievements.map((ach, idx) => (
                    <div key={idx} className={`text-center p-3 rounded-xl ${ach.unlocked ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30' : 'bg-white/5 opacity-50'}`}>
                      <div className="text-3xl mb-1">{ach.icon || "🏅"}</div>
                      <p className="text-xs font-medium">{ach.name}</p>
                      {!ach.unlocked && <p className="text-[10px] text-gray-500 mt-1">{ach.progress}%</p>}
                    </div>
                  ))
                ) : (
                  <>
                    {["🥇", "🥈", "🥉", "🎯"].map((icon, idx) => (
                      <div key={idx} className="text-center p-3 rounded-xl bg-white/5 opacity-50">
                        <div className="text-3xl mb-1">{icon}</div>
                        <p className="text-xs">Coming Soon</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6">
            {/* Level Progress */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Trình độ hiện tại</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Tiến trình lên {user.currentLevel === "N5" ? "N4" : user.currentLevel === "N4" ? "N3" : user.currentLevel === "N3" ? "N2" : "N1"}</span>
                <span className="text-sm text-cyan-300">{Math.min(Math.floor((stats.vocabularyLearned / 100) * 100), 100)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" style={{ width: `${Math.min((stats.vocabularyLearned / 100) * 100, 100)}%` }}></div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                  <div key={level} className="text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      user.currentLevel === level 
                        ? "bg-gradient-to-r from-purple-500 to-cyan-400 shadow-lg"
                        : (user.currentLevel === "N5" && level === "N5") || 
                          (user.currentLevel === "N4" && ["N5", "N4"].includes(level)) ||
                          (user.currentLevel === "N3" && ["N5", "N4", "N3"].includes(level)) ||
                          (user.currentLevel === "N2" && ["N5", "N4", "N3", "N2"].includes(level)) ||
                          (user.currentLevel === "N1" && true)
                          ? "bg-green-500/50 border border-green-400/50"
                          : "bg-white/10"
                    }`}>
                      {level === user.currentLevel ? "⭐" : 
                        ((user.currentLevel === "N5" && level === "N5") || 
                         (user.currentLevel === "N4" && ["N5", "N4"].includes(level)) ||
                         (user.currentLevel === "N3" && ["N5", "N4", "N3"].includes(level)) ||
                         (user.currentLevel === "N2" && ["N5", "N4", "N3", "N2"].includes(level)) ||
                         (user.currentLevel === "N1" && true)) ? "✅" : "🔒"}
                    </div>
                    <p className="text-xs font-semibold">{level}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-3">Chi tiết học tập</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bài học đã hoàn thành</span>
                    <span className="font-semibold">{stats.completedLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tổng số quiz</span>
                    <span className="font-semibold">{stats.totalQuizzes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Điểm trung bình</span>
                    <span className="font-semibold text-cyan-300">{stats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ngữ pháp đã học</span>
                    <span className="font-semibold">{stats.grammarLearned} bài</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-bold mb-3">Gợi ý từ AI</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-400/30">
                    <p className="text-sm">📖 Bạn nên ôn tập thêm Kanji bài 12-15</p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/20 border border-cyan-400/30">
                    <p className="text-sm">🎯 Làm quiz ngữ pháp N4 để củng cố kiến thức</p>
                  </div>
                  <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-400/30">
                    <p className="text-sm">🔥 Duy trì streak thêm 3 ngày để nhận huy hiệu mới</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg">
                  🤖
                </div>
                <div>
                  <h3 className="text-2xl font-bold">AI Sensei</h3>
                  <p className="text-cyan-300 text-sm">{loading ? "Đang suy nghĩ..." : `Sẵn sàng giúp bạn học ${user.currentLevel}`}</p>
                </div>
              </div>

              {/* Chat History */}
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p>🤖 Chào bạn! Mình là AI Sensei.</p>
                    <p className="text-sm mt-2">Hãy hỏi mình bất cứ điều gì về tiếng Nhật nhé!</p>
                  </div>
                ) : (
                  chatHistory.map((chat, idx) => (
                    <div key={idx} className={chat.role === "user" ? "flex justify-end" : "flex justify-start"}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${chat.role === "user" ? "bg-gradient-to-r from-purple-500/30 to-cyan-400/30" : "bg-white/10"}`}>
                        <p className="text-sm whitespace-pre-line">{chat.content}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{new Date(chat.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">AI Sensei đang nghĩ</span>
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

              {/* Current Reply */}
              {reply && !loading && (
                <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-400/20 border border-cyan-400/20">
                  <p className="text-white leading-relaxed whitespace-pre-line">{reply}</p>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Hỏi AI Sensei về tiếng Nhật..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && askAi()}
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-5 py-3 outline-none focus:border-cyan-400/50"
                />
                <button
                  onClick={askAi}
                  disabled={loading}
                  className="px-6 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? "..." : "Gửi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Thông tin cá nhân</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tên người dùng</label>
                  <input type="text" value={user.username || ""} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 outline-none focus:border-cyan-400/50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input type="email" value={user.email || ""} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 outline-none focus:border-cyan-400/50" disabled />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Trình độ hiện tại</label>
                  <select value={user.currentLevel} onChange={(e) => updateLevel(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 outline-none focus:border-cyan-400/50">
                    <option value="N5">N5 - Beginner</option>
                    <option value="N4">N4 - Elementary</option>
                    <option value="N3">N3 - Intermediate</option>
                    <option value="N2">N2 - Upper Intermediate</option>
                    <option value="N1">N1 - Advanced</option>
                  </select>
                </div>
                <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 font-semibold hover:scale-105 transition">
                  Cập nhật
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Cài đặt học tập</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Nhắc nhở học tập hàng ngày</span>
                  <input type="checkbox" className="w-5 h-5 rounded bg-white/10" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Gửi báo cáo tuần qua email</span>
                  <input type="checkbox" className="w-5 h-5 rounded bg-white/10" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>Chế độ tối (Dark mode)</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-white/10" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}