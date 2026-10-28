import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../../../shared/components/layout/AppLayout";

export default function MySetsPage() {
  const navigate = useNavigate();

  // State
  const [mySets, setMySets] = useState([]);
  const [savedSets, setSavedSets] = useState([]);
  const [publicSets, setPublicSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my"); // "my", "saved", "public"
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showUnsaveConfirm, setShowUnsaveConfirm] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  // Fetch API
  const fetchMySets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/flashcard-sets/my", {
        headers: getAuthHeader(),
      });
      setMySets(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [getAuthHeader]);

  const fetchSavedSets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/flashcard-sets/saved", {
        headers: getAuthHeader(),
      });
      setSavedSets(response.data || []);
    } catch (error) {
      console.error(error);
    }
  }, [getAuthHeader]);

  const fetchPublicSets = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/flashcard-sets/public", {
        headers: getAuthHeader(),
      });
      setPublicSets(response.data.content || response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    fetchMySets();
    fetchSavedSets();
    fetchPublicSets();
  }, [fetchMySets, fetchSavedSets, fetchPublicSets]);

  // Delete Set
  const deleteSet = async (id, title) => {
    try {
      await axios.delete(`http://localhost:8080/api/flashcard-sets/${id}`, {
        headers: getAuthHeader(),
      });
      showToast(`Đã xóa bộ thẻ "${title}" thành công!`, "success");
      fetchMySets();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error(error);
      showToast("Xóa bộ thẻ thất bại!", "error");
    }
  };

  // Toggle Public / Private
  const toggleVisibility = async (id, isPublic) => {
    try {
      await axios.put(
        `http://localhost:8080/api/flashcard-sets/${id}/visibility`,
        { isPublic: !isPublic },
        { headers: getAuthHeader() }
      );
      showToast(!isPublic ? "Đã chuyển thành bộ thẻ công khai 🌍" : "Đã chuyển về riêng tư 🔒", "success");
      fetchMySets();
    } catch (error) {
      console.error(error);
      showToast("Cập nhật quyền riêng tư thất bại!", "error");
    }
  };

  // Save / Unsave
  const saveSet = async (id) => {
    try {
      await axios.post(
        `http://localhost:8080/api/flashcard-sets/${id}/save`,
        {},
        { headers: getAuthHeader() }
      );
      showToast("Đã lưu bộ thẻ vào danh sách của bạn! ⭐", "success");
      fetchSavedSets();
      fetchPublicSets();
    } catch (error) {
      console.error(error);
      showToast("Lưu bộ thẻ thất bại!", "error");
    }
  };

  const unsaveSet = async (id) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/flashcard-sets/${id}/save`,
        { headers: getAuthHeader() }
      );
      showToast("Đã bỏ lưu bộ thẻ", "success");
      fetchSavedSets();
      fetchPublicSets();
      setShowUnsaveConfirm(null);
    } catch (error) {
      console.error(error);
      showToast("Bỏ lưu thất bại!", "error");
    }
  };

  // Current display list based on active tab & search
  const getCurrentSets = () => {
    const list = activeTab === "my" ? mySets : activeTab === "saved" ? savedSets : publicSets;

    if (!searchTerm.trim()) return list;
    return list.filter(
      (s) =>
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const displaySets = getCurrentSets();

  return (
    <AppLayout activePage="flashcards">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
        
        {/* ========================================================= */}
        {/* HEADER SECTION */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60">
              <span>🃏</span> Spaced Repetition (SRS)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Thư viện bộ thẻ Flashcards
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Ôn luyện lặp lại ngắt quãng khoa học, lật thẻ 3D và theo dõi tỉ lệ ghi nhớ dài hạn.
            </p>
          </div>

          <Link
            to="/create-set"
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <span>➕</span> Tạo bộ thẻ mới
          </Link>
        </div>

        {/* ========================================================= */}
        {/* TABS & SEARCH CONTROLS */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          
          {/* Segmented Control Tabs */}
          <div className="flex gap-1.5 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 self-start">
            <button
              onClick={() => setActiveTab("my")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === "my"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🃏</span> Bộ thẻ của tôi
              <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-600 text-[10px]">
                {mySets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === "saved"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>⭐</span> Đã lưu
              <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-600 text-[10px]">
                {savedSets.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("public")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === "public"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🌐</span> Cộng đồng
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 text-[10px]">
                {publicSets.length}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm bộ thẻ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

        </div>

        {/* ========================================================= */}
        {/* FLASHCARD SETS GRID */}
        {/* ========================================================= */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang tải bộ thẻ...</p>
          </div>
        ) : displaySets.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4">
            <span className="text-4xl">🃏</span>
            <h3 className="font-extrabold text-base text-slate-800">
              {activeTab === "my"
                ? "Bạn chưa có bộ thẻ nào"
                : activeTab === "saved"
                ? "Chưa có bộ thẻ nào được lưu"
                : "Không tìm thấy bộ thẻ cộng đồng"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeTab === "my"
                ? "Tạo bộ thẻ đầu tiên của bạn hoặc thêm từ vựng/kanji từ kho bài học để bắt đầu ôn tập nhé!"
                : "Khám phá các bộ thẻ cộng đồng để lưu lại và luyện tập mỗi ngày."}
            </p>
            {activeTab === "my" && (
              <Link
                to="/create-set"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
              >
                <span>➕</span> Tạo bộ thẻ ngay
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySets.map((set) => {
              const cardCount = set.cards?.length || set.cardCount || 0;
              const isOwner = activeTab === "my";

              return (
                <div
                  key={set.id}
                  className="group relative p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
                >
                  {/* Card Header: Visibility & Menu */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-black border border-indigo-200/60">
                          {cardCount} thẻ
                        </span>
                        {isOwner ? (
                          <button
                            onClick={() => toggleVisibility(set.id, set.isPublic)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                              set.isPublic
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                            title="Click để đổi trạng thái"
                          >
                            {set.isPublic ? "🌍 Công khai" : "🔒 Riêng tư"}
                          </button>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-500">
                            Bởi {set.authorUsername || "Cộng đồng"}
                          </span>
                        )}
                      </div>

                      {/* Owner Delete or Public Bookmark */}
                      {isOwner ? (
                        <button
                          onClick={() => setShowDeleteConfirm(set)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Xóa bộ thẻ"
                        >
                          🗑️
                        </button>
                      ) : activeTab === "saved" ? (
                        <button
                          onClick={() => setShowUnsaveConfirm(set)}
                          className="p-1.5 rounded-xl text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition"
                          title="Bỏ lưu"
                        >
                          ⭐
                        </button>
                      ) : (
                        <button
                          onClick={() => saveSet(set.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition"
                          title="Lưu bộ thẻ"
                        >
                          ☆
                        </button>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-black text-lg text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 mb-1">
                      {set.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {set.description || "Bộ thẻ ôn tập tiếng Nhật hiệu quả với phương pháp SRS."}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600">
                      Spaced Repetition
                    </span>

                    <button
                      onClick={() => navigate(`/flashcards/${set.id}/study`)}
                      disabled={cardCount === 0}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <span>🚀 Học ngay</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* DELETE CONFIRM MODAL */}
        {/* ========================================================= */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl z-10 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-base font-black text-slate-900">Xác nhận xóa bộ thẻ</h3>
                <p className="text-xs text-slate-600">
                  Bạn có chắc muốn xóa vĩnh viễn bộ thẻ <strong className="text-slate-900 font-bold">"{showDeleteConfirm.title}"</strong>? Toàn bộ thẻ trong bộ sẽ bị xóa.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => deleteSet(showDeleteConfirm.id, showDeleteConfirm.title)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* UNSAVE CONFIRM MODAL */}
        {/* ========================================================= */}
        {showUnsaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl z-10 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-4xl">⭐</span>
                <h3 className="text-base font-black text-slate-900">Bỏ lưu bộ thẻ</h3>
                <p className="text-xs text-slate-600">
                  Bạn có chắc muốn bỏ lưu bộ thẻ <strong className="text-slate-900 font-bold">"{showUnsaveConfirm.title}"</strong> khỏi danh sách yêu thích?
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowUnsaveConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => unsaveSet(showUnsaveConfirm.id)}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-sm"
                >
                  Xác nhận bỏ lưu
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