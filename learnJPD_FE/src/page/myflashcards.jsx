import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MySetsPage() {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================
  const [mySets, setMySets] = useState([]);
  const [publicSets, setPublicSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my"); // my, public
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Dark mode
  const [darkMode, setDarkMode] = useState(false);

  // =========================
  // TOAST NOTIFICATION
  // =========================
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // =========================
  // GET AUTH HEADER
  // =========================
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // =========================
  // FETCH DATA
  // =========================
  const fetchMySets = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/flashcard-sets/my", {
        headers: getAuthHeader(),
      });
      setMySets(response.data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải bộ thẻ của bạn", "error");
    }
  };

  const fetchPublicSets = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/flashcard-sets/public");
      setPublicSets(response.data);
    } catch (error) {
      console.error(error);
      showToast("Không thể tải bộ thẻ công khai", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchMySets();
      fetchPublicSets();
    }
  }, []);

  // =========================
  // DELETE SET
  // =========================
  const deleteSet = async (id, title) => {
    try {
      await axios.delete(`http://localhost:8080/api/flashcard-sets/${id}`, {
        headers: getAuthHeader(),
      });
      showToast(`🗑️ Đã xóa bộ thẻ "${title}"`, "success");
      fetchMySets();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error(error);
      showToast("❌ Xóa thất bại!", "error");
    }
  };

  // =========================
  // TOGGLE PUBLIC/PRIVATE
  // =========================
  const toggleVisibility = async (id, isPublic) => {
    try {
      await axios.put(
        `http://localhost:8080/api/flashcard-sets/${id}/visibility`,
        { isPublic: !isPublic },
        { headers: getAuthHeader() }
      );
      showToast(!isPublic ? "🌍 Đã chuyển thành công khai" : "🔒 Đã chuyển thành riêng tư", "success");
      fetchMySets();
    } catch (error) {
      showToast("❌ Cập nhật thất bại!", "error");
    }
  };

  // =========================
  // LOAD DARK MODE
  // =========================
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode || false);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("userSettings", JSON.stringify({ darkMode: newDarkMode }));
  };

  // =========================
  // GET TYPE INFO
  // =========================
  const getTypeIcon = (type) => {
    switch (type) {
      case "VOCAB": return "📚";
      case "KANJI": return "🈴";
      case "GRAMMAR": return "📖";
      case "CUSTOM": return "✨";
      default: return "📝";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "VOCAB": return "bg-blue-500/20 text-blue-400";
      case "KANJI": return "bg-purple-500/20 text-purple-400";
      case "GRAMMAR": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "VOCAB": return "Từ vựng";
      case "KANJI": return "Kanji";
      case "GRAMMAR": return "Ngữ pháp";
      case "CUSTOM": return "Tùy chỉnh";
      default: return "Từ vựng";
    }
  };

  // =========================
  // FILTER SETS
  // =========================
  const setsToShow = activeTab === "my" ? mySets : publicSets;
  const filteredSets = setsToShow.filter(set => {
    const matchesSearch = searchTerm === "" || 
      set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (set.description && set.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className={`min-h-screen ${!darkMode ? "bg-gray-50" : "bg-[#0F172A]"} transition-colors duration-300`}>
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-6 z-50 animate-slide-in-right px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white ${
          toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
        }`}>
          <span className="text-xl">{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: "", type: "success" })} className="text-white/70 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-6 py-4 ${
        !darkMode ? "bg-white/80 border-gray-200" : "bg-[#0F172A]/80 border-white/10"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className={`p-2 rounded-lg transition-all ${!darkMode ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-white"}`}
            >
              ← Quay lại
            </button>
            <h1 className={`text-2xl font-bold ${!darkMode ? "text-gray-800" : "text-white"}`}>
              📦 Bộ thẻ của tôi
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${!darkMode ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-white"}`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button
              onClick={() => navigate("/create-set")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition"
            >
              + Tạo bộ thẻ
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              activeTab === "my"
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white"
                : !darkMode ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-white/10"
            }`}
          >
            📖 Bộ của tôi ({mySets.length})
          </button>
          <button
            onClick={() => setActiveTab("public")}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              activeTab === "public"
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white"
                : !darkMode ? "text-gray-600 hover:bg-gray-100" : "text-gray-400 hover:bg-white/10"
            }`}
          >
            🌍 Công khai ({publicSets.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className={`rounded-xl p-4 mb-6 ${
          !darkMode ? "bg-white border border-gray-200" : "bg-white/5 border border-white/10"
        }`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm bộ thẻ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-xl px-4 py-3 pl-12 outline-none focus:ring-2 focus:ring-purple-500 ${
                !darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
              }`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Stats */}
        <div className={`mb-6 p-4 rounded-xl ${
          !darkMode ? "bg-white border border-gray-200" : "bg-white/5 border border-white/10"
        }`}>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <span className={`text-sm ${!darkMode ? "text-gray-500" : "text-gray-400"}`}>
              📊 Tổng số bộ thẻ: <span className="font-bold">{filteredSets.length}</span>
            </span>
            {activeTab === "my" && (
              <span className={`text-sm ${!darkMode ? "text-gray-500" : "text-gray-400"}`}>
                🔓 Công khai: {mySets.filter(s => s.isPublic).length} | 
                🔒 Riêng tư: {mySets.filter(s => !s.isPublic).length}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredSets.length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${!darkMode ? "bg-white" : "bg-white/5"}`}>
            <div className="text-6xl mb-4">📦</div>
            <p className={`text-lg ${!darkMode ? "text-gray-500" : "text-gray-400"}`}>
              {activeTab === "my" ? "Bạn chưa có bộ thẻ nào!" : "Chưa có bộ thẻ công khai nào!"}
            </p>
            {activeTab === "my" && (
              <button
                onClick={() => navigate("/create-set")}
                className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition"
              >
                + Tạo bộ thẻ đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSets.map((set) => (
              <div
                key={set.id}
                className={`group rounded-xl p-5 transition-all hover:scale-105 cursor-pointer ${
                  !darkMode
                    ? "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
                onClick={() => navigate(`/set/${set.id}`)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{getTypeIcon(set.cardType)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(set.cardType)}`}>
                      {getTypeLabel(set.cardType)}
                    </span>
                    {set.isPublic ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400" title="Công khai">
                        🔓
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400" title="Riêng tư">
                        🔒
                      </span>
                    )}
                  </div>
                  
                  {activeTab === "my" && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(set.id, set.isPublic); }}
                        className="p-1 rounded hover:bg-yellow-500/20"
                        title={set.isPublic ? "Chuyển thành riêng tư" : "Chuyển thành công khai"}
                      >
                        {set.isPublic ? "🔒" : "🌍"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(set.id); }}
                        className="p-1 rounded hover:bg-red-500/20"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${!darkMode ? "text-gray-800" : "text-white"}`}>
                  {set.title}
                </h3>
                {set.description && (
                  <p className={`text-sm mb-3 line-clamp-2 ${!darkMode ? "text-gray-500" : "text-gray-400"}`}>
                    {set.description}
                  </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>🃏</span> {set.cardCount || set.flashcards?.length || 0} thẻ
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>👤</span> {set.username || set.user?.username || "Bạn"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${
            !darkMode ? "bg-white border-gray-200" : "bg-[#0F172A] border-white/20"
          }`}>
            <h3 className="text-xl font-bold mb-4">Xác nhận xóa</h3>
            <p className={`mb-6 ${!darkMode ? "text-gray-600" : "text-gray-300"}`}>
              Bạn có chắc muốn xóa bộ thẻ này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl border hover:bg-white/10 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteSet(showDeleteConfirm, filteredSets.find(s => s.id === showDeleteConfirm)?.title)}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}