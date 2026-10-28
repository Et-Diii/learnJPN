import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../../shared/components/layout/AppLayout";

export default function CreateSetPage() {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState("VOCAB"); // "VOCAB", "KANJI", "GRAMMAR"
  
  // Set information
  const [setInfo, setSetInfo] = useState({
    title: "",
    description: "",
    isPublic: true,
  });

  // Cards in set
  const [cards, setCards] = useState([
    { id: 1, front: "日本語", back: "Tiếng Nhật", example: "日本語を勉強します。" },
  ]);

  // Current adding card
  const [currentCard, setCurrentCard] = useState({ front: "", back: "", example: "" });
  const [isFlippedPreview, setIsFlippedPreview] = useState(false);

  // Batch import modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [separator, setSeparator] = useState(":");

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Add Card
  const addCard = () => {
    if (!currentCard.front.trim() || !currentCard.back.trim()) {
      showToast("Vui lòng nhập cả mặt trước (tiếng Nhật) và mặt sau (tiếng Việt)!", "error");
      return;
    }

    setCards([...cards, { ...currentCard, id: Date.now() }]);
    setCurrentCard({ front: "", back: "", example: "" });
    setIsFlippedPreview(false);
    showToast("Đã thêm thẻ mới vào bộ! 🎉", "success");
  };

  // Remove Card
  const removeCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  // Batch Import
  const handleBatchImport = () => {
    if (!batchText.trim()) return;

    const lines = batchText.split("\n");
    const newCards = [];

    lines.forEach((line) => {
      const parts = line.split(separator).map(s => s.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        newCards.push({
          id: Date.now() + Math.random(),
          front: parts[0],
          back: parts[1],
          example: parts[2] || "",
        });
      }
    });

    if (newCards.length === 0) {
      showToast("Không tìm thấy dòng hợp lệ. Vui lòng kiểm tra định dạng phân cách!", "error");
      return;
    }

    setCards([...cards, ...newCards]);
    setShowBatchModal(false);
    setBatchText("");
    showToast(`Đã thêm thành công ${newCards.length} thẻ từ danh sách hàng loạt!`, "success");
  };

  // Submit Flashcard Set
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!setInfo.title.trim()) {
      showToast("Vui lòng nhập tiêu đề cho bộ thẻ!", "error");
      return;
    }

    if (cards.length === 0) {
      showToast("Bộ thẻ cần có ít nhất 1 chiếc thẻ để tạo!", "error");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        title: setInfo.title,
        description: setInfo.description,
        isPublic: setInfo.isPublic,
        cardType: cardType,
        cards: cards.map(c => ({
          frontText: c.front,
          backText: c.back,
          exampleText: c.example || "",
          cardType: cardType,
        })),
      };

      await axios.post("http://localhost:8080/api/flashcard-sets", requestData, {
        headers: getAuthHeader(),
      });

      showToast(`Tạo thành công bộ thẻ "${setInfo.title}"! 🎉`, "success");
      setTimeout(() => {
        navigate("/flashcards");
      }, 1200);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Không thể tạo bộ thẻ, vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout activePage="create-set">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
        
        {/* ========================================================= */}
        {/* HEADER SECTION */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60">
              <span>🃏</span> Flashcard Creator Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tạo bộ thẻ Flashcard mới
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Thiết kế bộ thẻ cá nhân hóa, xem trước lật thẻ 3D thời gian thực và hỗ trợ nhập nhanh hàng loạt.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-xs text-slate-700 transition flex items-center gap-1.5"
            >
              <span>📋</span> Nhập hàng loạt
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              {loading ? "Đang lưu..." : "Lưu bộ thẻ 🚀"}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2-COLUMN STUDIO WORKSPACE */}
        {/* ========================================================= */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Forms */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Thông tin bộ thẻ */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>📁</span> 1. Thông tin tổng quan
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tiêu đề bộ thẻ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 50 Động từ thể て thông dụng N5"
                    value={setInfo.title}
                    onChange={(e) => setSetInfo({ ...setInfo, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mô tả ngắn gọn
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú mục tiêu học tập hoặc cấp độ bài..."
                    value={setInfo.description}
                    onChange={(e) => setSetInfo({ ...setInfo, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Loại thẻ:</span>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                      {["VOCAB", "KANJI", "GRAMMAR"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCardType(t)}
                          className={`px-3 py-1 rounded-lg font-bold transition ${
                            cardType === t
                              ? "bg-white text-indigo-700 shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {t === "VOCAB" ? "📚 Từ vựng" : t === "KANJI" ? "🈴 Kanji" : "📖 Ngữ pháp"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={setInfo.isPublic}
                      onChange={(e) => setSetInfo({ ...setInfo, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>🌍 Chia sẻ công khai</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Form thêm thẻ từng chiếc */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>➕</span> 2. Thêm thẻ mới
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mặt trước (Tiếng Nhật / Chữ Hán) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 食べる (taberu)"
                    value={currentCard.front}
                    onChange={(e) => setCurrentCard({ ...currentCard, front: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-base font-japanese font-black text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mặt sau (Nghĩa tiếng Việt / Giải nghĩa) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Ăn, dùng bữa"
                    value={currentCard.back}
                    onChange={(e) => setCurrentCard({ ...currentCard, back: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ví dụ câu minh họa (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 朝ご飯を食べます。(Ăn cơm sáng)"
                    value={currentCard.example}
                    onChange={(e) => setCurrentCard({ ...currentCard, example: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={addCard}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>＋</span> Thêm thẻ này vào danh sách
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive 3D Preview & Cards List */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live 3D Card Preview */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span>👁️</span> Xem trước thẻ 3D
                </span>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Click để lật
                </span>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlippedPreview(!isFlippedPreview)}
                className="perspective-1000 h-64 w-full cursor-pointer select-none"
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-3xl ${
                    isFlippedPreview ? "rotate-y-180" : ""
                  }`}
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 backface-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex flex-col justify-between shadow-xl shadow-indigo-500/15 border border-indigo-400/30">
                    <div className="flex items-center justify-between text-xs text-indigo-200 font-bold">
                      <span>MẶT TRƯỚC (JAPANESE)</span>
                      <span>🔄 Lật xem</span>
                    </div>

                    <div className="text-center py-4 space-y-1">
                      <p className="text-3xl sm:text-4xl font-black font-japanese tracking-wider">
                        {currentCard.front || "日本語"}
                      </p>
                      <p className="text-xs text-indigo-200">
                        {cardType === "VOCAB" ? "Từ vựng" : cardType === "KANJI" ? "Chữ Hán" : "Ngữ pháp"}
                      </p>
                    </div>

                    <p className="text-[11px] text-center text-indigo-200 italic">
                      Click vào thẻ để xem mặt dịch
                    </p>
                  </div>

                  {/* BACK FACE */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 bg-gradient-to-br from-rose-500 to-amber-500 text-white flex flex-col justify-between shadow-xl shadow-rose-500/15 border border-rose-400/30">
                    <div className="flex items-center justify-between text-xs text-rose-100 font-bold">
                      <span>MẶT SAU (TIẾNG VIỆT)</span>
                      <span>🔄 Lật lại</span>
                    </div>

                    <div className="text-center py-4 space-y-2">
                      <p className="text-2xl font-black">
                        {currentCard.back || "Tiếng Nhật, Nhật ngữ"}
                      </p>
                      {currentCard.example && (
                        <p className="text-xs text-white/90 bg-white/15 p-2 rounded-xl italic">
                          "{currentCard.example}"
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] text-center text-rose-100 italic">
                      Click để trở về mặt trước
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* List of cards added */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <span>📋</span> Danh sách thẻ trong bộ ({cards.length})
                </h3>
                <span className="text-xs text-slate-500">Kéo/xóa thẻ</span>
              </div>

              {cards.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Chưa có thẻ nào trong bộ.</p>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {cards.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-indigo-300 flex items-center justify-between gap-3 text-xs transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="truncate">
                          <p className="font-bold text-slate-900 font-japanese truncate">{c.front}</p>
                          <p className="text-slate-500 truncate">{c.back}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeCard(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Xóa thẻ"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* BATCH IMPORT MODAL */}
        {/* ========================================================= */}
        {showBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl z-10 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <span>📋</span> Nhập thẻ hàng loạt từ văn bản
                </h3>
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span>Ký tự phân cách:</span>
                  <select
                    value={separator}
                    onChange={(e) => setSeparator(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
                  >
                    <option value=":">Dấu hai chấm ( : )</option>
                    <option value="-">Dấu gạch ngang ( - )</option>
                    <option value=",">Dấu phẩy ( , )</option>
                    <option value="	">Phím Tab</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dán danh sách (mỗi dòng 1 thẻ: Mặt trước {separator} Mặt sau):
                  </label>
                  <textarea
                    rows={8}
                    placeholder={`食べる ${separator} Ăn\n飲む ${separator} Uống\n行く ${separator} Đi\n来る ${separator} Đến`}
                    value={batchText}
                    onChange={(e) => setBatchText(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500 transition leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleBatchImport}
                  className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20"
                >
                  Xác nhận nhập 📥
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Toast */}
        {toast.show && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border animate-in slide-in-from-bottom duration-200 ${
              toast.type === "error"
                ? "bg-rose-50 border-rose-300 text-rose-800"
                : "bg-emerald-50 border-emerald-300 text-emerald-800"
            }`}
          >
            <span>{toast.type === "error" ? "⚠️" : "✅"}</span>
            <span>{toast.message}</span>
          </div>
        )}

      </div>
    </AppLayout>
  );
}