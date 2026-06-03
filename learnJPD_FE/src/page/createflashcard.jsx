import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateSetPage() {
  const navigate = useNavigate();

  // =========================
  // STATE
  // =========================
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Set information
  const [setInfo, setSetInfo] = useState({
    title: "",
    description: "",
    isPublic: false,
  });

  // Cards in set
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState({ front: "", back: "", example: "" });

  // Batch import
  const [batchText, setBatchText] = useState("");
  const [separator, setSeparator] = useState(":");
  const [batchPreview, setBatchPreview] = useState([]);
  const [showBatchImport, setShowBatchImport] = useState(false);

  // Card type
  const [cardType, setCardType] = useState("VOCAB");

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
  // ADD CARD
  // =========================
  const addCard = () => {
    if (!currentCard.front.trim() || !currentCard.back.trim()) {
      showToast("Vui lòng nhập đầy đủ mặt trước và mặt sau!", "error");
      return;
    }

    setCards([...cards, { ...currentCard, id: Date.now() }]);
    setCurrentCard({ front: "", back: "", example: "" });
    showToast(`✅ Đã thêm thẻ: ${currentCard.front}`, "success");
  };

  // =========================
  // REMOVE CARD
  // =========================
  const removeCard = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  // =========================
  // EDIT CARD
  // =========================
  const editCard = (card) => {
    setCurrentCard({ front: card.front, back: card.back, example: card.example || "" });
    removeCard(card.id);
  };

  // =========================
  // PARSE BATCH TEXT
  // =========================
  const parseBatchText = () => {
    const lines = batchText.trim().split("\n");
    const parsed = [];

    for (const line of lines) {
      if (line.trim() === "") continue;
      const separatorIndex = line.indexOf(separator);
      if (separatorIndex === -1) {
        parsed.push({ front: line.trim(), back: "", error: true });
        continue;
      }
      const front = line.substring(0, separatorIndex).trim();
      const back = line.substring(separatorIndex + 1).trim();
      if (front && back) {
        parsed.push({ front, back, example: "" });
      }
    }

    setBatchPreview(parsed);
  };

  // =========================
  // IMPORT BATCH
  // =========================
  const importBatch = () => {
    if (batchPreview.length === 0) {
      showToast("Không có thẻ hợp lệ nào để import!", "error");
      return;
    }

    const newCards = batchPreview.map((card, idx) => ({
      ...card,
      id: Date.now() + idx,
    }));

    setCards([...cards, ...newCards]);
    setBatchText("");
    setBatchPreview([]);
    setShowBatchImport(false);
    showToast(`✅ Đã import ${newCards.length} thẻ thành công!`, "success");
  };

  // =========================
  // CREATE SET
  // =========================
  const createSet = async () => {
    if (!setInfo.title.trim()) {
      showToast("Vui lòng nhập tên bộ thẻ!", "error");
      return;
    }

    if (cards.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 thẻ vào bộ!", "error");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        title: setInfo.title,
        description: setInfo.description,
        isPublic: setInfo.isPublic,
        cardType: cardType,
        cards: cards.map(card => ({
          frontText: card.front,
          backText: card.back,
          exampleText: card.example || "",
          cardType: cardType,
        })),
      };

      console.log("Sending data:", requestData);
      console.log(localStorage.getItem("token"));
      await axios.post("http://localhost:8080/api/flashcard-sets", requestData, {
        headers: getAuthHeader(),
      });

      showToast(`✅ Tạo thành công bộ thẻ "${setInfo.title}" với ${cards.length} thẻ!`, "success");

      setTimeout(() => {
        navigate("/myflashcards");
      }, 1500);

    } catch (error) {
      console.error("FULL ERROR:", error);

      if (error.response) {
        console.log("STATUS:", error.response.status);
        console.log("DATA:", error.response.data);
      }

      showToast(
        error.response?.data ||
        error.message ||
        "Tạo bộ thẻ thất bại",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setSetInfo({ title: "", description: "", isPublic: false });
    setCards([]);
    setCurrentCard({ front: "", back: "", example: "" });
    setBatchText("");
    setBatchPreview([]);
    setCardType("VOCAB");
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
  // GET TYPE ICON
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

  return (
    <div className={`min-h-screen ${!darkMode ? "bg-gray-50" : "bg-[#0F172A]"} transition-colors duration-300`}>

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-20 right-6 z-50 animate-slide-in-right px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
          }`}>
          <span className="text-xl">{toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}</span>
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: "", type: "success" })} className="text-white/70 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-6 py-4 ${!darkMode ? "bg-white/80 border-gray-200" : "bg-[#0F172A]/80 border-white/10"
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/myflashcards")}
              className={`p-2 rounded-lg transition-all ${!darkMode ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-white"}`}
            >
              ← Quay lại
            </button>
            <h1 className={`text-2xl font-bold ${!darkMode ? "text-gray-800" : "text-white"}`}>
              📦 Tạo bộ thẻ mới
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all ${!darkMode ? "hover:bg-gray-100 text-gray-600" : "hover:bg-white/10 text-white"}`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 gap-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${cards.length > 0 ? "bg-green-500 text-white" : "bg-purple-500 text-white"}`}>
              1
            </div>
            <span className={`ml-2 text-sm ${!darkMode ? "text-gray-600" : "text-gray-400"}`}>Thông tin bộ thẻ</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${cards.length > 0 ? "bg-purple-500 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-500"}`}>
              2
            </div>
            <span className={`ml-2 text-sm ${cards.length > 0 ? (darkMode ? "text-white" : "text-gray-800") : (darkMode ? "text-gray-500" : "text-gray-400")}`}>
              Thêm thẻ ({cards.length})
            </span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-gray-300 dark:bg-gray-600 text-gray-500`}>
              3
            </div>
            <span className={`ml-2 text-sm ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Hoàn tất</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* LEFT COLUMN - Set Information & Add Cards */}
          <div className="space-y-6">

            {/* Set Information Card */}
            <div className={`rounded-2xl p-6 ${!darkMode ? "bg-white border border-gray-200 shadow-sm" : "bg-white/5 border border-white/10"}`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${!darkMode ? "text-gray-800" : "text-white"}`}>
                <span>📋</span> Thông tin bộ thẻ
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-1 ${!darkMode ? "text-gray-600" : "text-gray-400"}`}>
                    Tên bộ thẻ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={setInfo.title}
                    onChange={(e) => setSetInfo({ ...setInfo, title: e.target.value })}
                    placeholder="VD: N5 Từ vựng cơ bản"
                    className={`w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 transition ${!darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
                      }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-1 ${!darkMode ? "text-gray-600" : "text-gray-400"}`}>
                    Mô tả
                  </label>
                  <textarea
                    value={setInfo.description}
                    onChange={(e) => setSetInfo({ ...setInfo, description: e.target.value })}
                    placeholder="Mô tả về bộ thẻ này..."
                    rows={3}
                    className={`w-full border rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-purple-500 transition ${!darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
                      }`}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className={`block text-sm mb-1 ${!darkMode ? "text-gray-600" : "text-gray-400"}`}>
                      Loại thẻ
                    </label>
                    <select
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value)}
                      className={`border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 ${!darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
                        }`}
                    >
                      <option value="VOCAB">📚 Từ vựng</option>
                      <option value="KANJI">🈴 Kanji</option>
                      <option value="GRAMMAR">📖 Ngữ pháp</option>
                      <option value="CUSTOM">✨ Tùy chỉnh</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer mt-4">
                    <input
                      type="checkbox"
                      checked={setInfo.isPublic}
                      onChange={(e) => setSetInfo({ ...setInfo, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500"
                    />
                    <span className={`text-sm ${!darkMode ? "text-gray-700" : "text-gray-300"}`}>
                      🌍 Công khai
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Add Single Card */}
            <div className={`rounded-2xl p-6 ${!darkMode ? "bg-white border border-gray-200 shadow-sm" : "bg-white/5 border border-white/10"}`}>
              <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${!darkMode ? "text-gray-800" : "text-white"}`}>
                <span>➕</span> Thêm thẻ thủ công
              </h2>

              <div className="space-y-3">
                <input
                  type="text"
                  value={currentCard.front}
                  onChange={(e) => setCurrentCard({ ...currentCard, front: e.target.value })}
                  placeholder="Mặt trước (VD: こんにちは)"
                  className={`w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 ${!darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
                    }`}
                />
                <input
                  type="text"
                  value={currentCard.back}
                  onChange={(e) => setCurrentCard({ ...currentCard, back: e.target.value })}
                  placeholder="Mặt sau (VD: Xin chào)"
                  className={`w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 ${!darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
                    }`}
                />
                <input
                  type="text"
                  value={currentCard.example}
                  onChange={(e) => setCurrentCard({ ...currentCard, example: e.target.value })}
                  placeholder="Ví dụ (không bắt buộc)"
                  className={`w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500 ${!darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
                    }`}
                />
                <button
                  onClick={addCard}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition"
                >
                  + Thêm thẻ
                </button>
              </div>
            </div>

            {/* Batch Import */}
            <div className={`rounded-2xl p-6 ${!darkMode ? "bg-white border border-gray-200 shadow-sm" : "bg-white/5 border border-white/10"}`}>
              <button
                onClick={() => setShowBatchImport(!showBatchImport)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className={`text-lg font-semibold flex items-center gap-2 ${!darkMode ? "text-gray-800" : "text-white"}`}>
                  <span>📥</span> Import hàng loạt
                </h2>
                <span className="text-2xl text-gray-400">{showBatchImport ? "▼" : "▶"}</span>
              </button>

              {showBatchImport && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${!darkMode ? "text-gray-600" : "text-gray-400"}`}>Ký tự phân cách:</span>
                    <input
                      type="text"
                      value={separator}
                      onChange={(e) => setSeparator(e.target.value)}
                      maxLength={3}
                      className="w-16 border rounded-lg px-2 py-1 text-center font-mono text-sm"
                    />
                  </div>

                  <textarea
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    placeholder={`Nhập danh sách thẻ, mỗi dòng 1 thẻ:
こんにちは : Xin chào
ありがとう : Cảm ơn
さようなら : Tạm biệt`}
                    rows={6}
                    className={`w-full border rounded-xl px-4 py-2 outline-none resize-none font-mono text-sm focus:ring-2 focus:ring-purple-500 ${!darkMode ? "bg-white border-gray-300 text-gray-900" : "bg-[#1E293B] border-white/20 text-white"
                      }`}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={parseBatchText}
                      className="flex-1 py-2 rounded-xl border border-cyan-500 text-cyan-500 font-semibold hover:bg-cyan-500/10 transition"
                    >
                      👁️ Xem trước
                    </button>
                    <button
                      onClick={importBatch}
                      disabled={batchPreview.length === 0}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
                    >
                      📥 Import {batchPreview.length} thẻ
                    </button>
                  </div>

                  {batchPreview.length > 0 && (
                    <div className={`p-3 rounded-lg max-h-40 overflow-y-auto ${!darkMode ? "bg-green-50" : "bg-green-500/20"}`}>
                      <p className="text-sm font-semibold mb-2">📋 Xem trước:</p>
                      {batchPreview.slice(0, 5).map((card, idx) => (
                        <div key={idx} className="text-xs p-1 rounded flex justify-between">
                          <span className="font-semibold">{card.front}</span>
                          <span className="mx-2">→</span>
                          <span>{card.back}</span>
                        </div>
                      ))}
                      {batchPreview.length > 5 && <p className="text-xs mt-1">... và {batchPreview.length - 5} thẻ khác</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Card List Preview */}
          <div className={`rounded-2xl p-6 ${!darkMode ? "bg-white border border-gray-200 shadow-sm" : "bg-white/5 border border-white/10"}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${!darkMode ? "text-gray-800" : "text-white"}`}>
                <span>🃏</span> Danh sách thẻ ({cards.length})
              </h2>
              {cards.length > 0 && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-cyan-500 hover:text-cyan-400"
                >
                  {showPreview ? "Thu gọn" : "Xem trước"}
                </button>
              )}
            </div>

            {cards.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${!darkMode ? "bg-gray-50" : "bg-white/5"}`}>
                <div className="text-5xl mb-3">🃏</div>
                <p className={!darkMode ? "text-gray-500" : "text-gray-400"}>Chưa có thẻ nào</p>
                <p className="text-sm mt-1 text-gray-400">Hãy thêm thẻ bằng form bên trái</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`group p-3 rounded-xl transition-all hover:scale-[1.02] ${!darkMode ? "bg-gray-50 border border-gray-100" : "bg-white/10 border border-white/5"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-purple-500">#{index + 1}</span>
                          <span className="text-sm font-semibold">{card.front}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="text-sm">{card.back}</span>
                        </div>
                        {card.example && (
                          <p className="text-xs text-gray-400 mt-1">📝 {card.example}</p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => editCard(card)}
                          className="p-1 rounded hover:bg-yellow-500/20"
                          title="Sửa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => removeCard(card.id)}
                          className="p-1 rounded hover:bg-red-500/20"
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Preview Mode - Flashcard Style */}
            {showPreview && cards.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                <h3 className={`text-sm font-semibold mb-3 ${!darkMode ? "text-gray-700" : "text-gray-300"}`}>
                  🎯 Xem trước dạng thẻ học
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {cards.slice(0, 4).map((card, idx) => (
                    <div key={card.id} className={`p-2 rounded-lg text-center text-xs ${!darkMode ? "bg-purple-50" : "bg-purple-500/20"
                      }`}>
                      <div className="font-semibold">{card.front}</div>
                      <div className="text-gray-500 mt-1">{card.back}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
          <button
            onClick={() => navigate("/myflashcards")}
            className="px-6 py-3 rounded-xl border border-gray-300 dark:border-white/20 font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            Hủy
          </button>
          <button
            onClick={resetForm}
            className="px-6 py-3 rounded-xl border border-yellow-500 text-yellow-500 font-medium hover:bg-yellow-500/10 transition"
          >
            Reset
          </button>
          <button
            onClick={createSet}
            disabled={loading || cards.length === 0 || !setInfo.title}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-semibold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                📦 Tạo bộ thẻ ({cards.length} thẻ)
              </>
            )}
          </button>
        </div>

        {/* Stats Summary */}
        {cards.length > 0 && (
          <div className={`mt-6 p-4 rounded-xl text-center ${!darkMode ? "bg-purple-50" : "bg-purple-500/10"}`}>
            <p className="text-sm">
              📊 Tóm tắt: <strong className="text-purple-500">{setInfo.title || "Chưa đặt tên"}</strong> |
              {getTypeIcon(cardType)} {cardType === "VOCAB" ? "Từ vựng" : cardType === "KANJI" ? "Kanji" : cardType === "GRAMMAR" ? "Ngữ pháp" : "Tùy chỉnh"} |
              🃏 {cards.length} thẻ |
              {setInfo.isPublic ? " 🌍 Công khai" : " 🔒 Riêng tư"}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </div>
  );
}