import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AppLayout from "../../../shared/components/layout/AppLayout";
import { isTokenValid } from "../../auth/utils/authSession";

export default function GrammarPage() {
  // State dữ liệu
  const [lessons, setLessons] = useState([]);
  const [grammars, setGrammars] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bộ lọc
  const [viewMode, setViewMode] = useState("BY_LESSON"); // "BY_LESSON" or "ALL"
  const [activeLesson, setActiveLesson] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedTopic, setSelectedTopic] = useState("ALL");

  // Modal chi tiết & Flashcard
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  const [flashcardModal, setFlashcardModal] = useState({ show: false, grammar: null });
  const [mySets, setMySets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [addingToSet, setAddingToSet] = useState(false);

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

  // Web Speech API phát âm
  const speakJapanese = (text, e) => {
    if (e) e.stopPropagation();
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Tải danh sách bài học ngữ pháp
  const fetchLessons = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/grammar/lessons");
      setLessons(res.data || []);
      if (res.data && res.data.length > 0 && !activeLesson) {
        setActiveLesson(res.data[0].lessonNumber);
      }
    } catch (err) {
      console.log("Dùng bài học mặc định:", err);
      setLessons([
        { lessonNumber: 1, lessonTitle: "Câu khẳng định, phủ định & nghi vấn です", grammarCount: 4 },
        { lessonNumber: 2, lessonTitle: "Đại từ chỉ thị これ, それ, あれ & この, その, あの", grammarCount: 4 },
        { lessonNumber: 3, lessonTitle: "Chỉ nơi chốn ここ, そこ, あそこ & どこ", grammarCount: 4 },
        { lessonNumber: 4, lessonTitle: "Thời gian, ngày tháng & Động từ chia thì", grammarCount: 5 },
        { lessonNumber: 5, lessonTitle: "Phương tiện đi lại, địa điểm & đi cùng ai", grammarCount: 4 },
      ]);
    }
  }, [activeLesson]);

  // Tải danh sách chủ đề
  const fetchTopics = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/grammar/topics");
      setTopics(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }, []);

  // Tải danh sách ngữ pháp
  const fetchGrammars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (viewMode === "BY_LESSON" && activeLesson) {
        params.lesson = activeLesson;
      }
      if (selectedLevel !== "ALL") params.level = selectedLevel;
      if (selectedTopic !== "ALL") params.topic = selectedTopic;
      if (searchKeyword.trim()) params.keyword = searchKeyword.trim();

      const res = await axios.get("http://localhost:8080/api/grammar", {
        params,
        headers: getAuthHeader(),
      });
      setGrammars(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách ngữ pháp. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedLevel, selectedTopic, viewMode, activeLesson, getAuthHeader]);

  useEffect(() => {
    fetchLessons();
    fetchTopics();
  }, [fetchLessons, fetchTopics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGrammars();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchGrammars]);

  // Mở modal thêm vào Flashcard
  const handleOpenFlashcardModal = async (grammarItem, e) => {
    if (e) e.stopPropagation();
    if (!isTokenValid()) {
      showToast("Phiên đăng nhập đã hết hạn (1 tiếng) hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại!", "error");
      return;
    }

    setFlashcardModal({ show: true, grammar: grammarItem });

    try {
      const res = await axios.get("http://localhost:8080/api/flashcard-sets/my-sets", {
        headers: getAuthHeader(),
      });
      setMySets(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedSetId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể tải danh sách bộ thẻ của bạn", "error");
    }
  };

  // Lưu ngữ pháp vào bộ thẻ Flashcard
  const handleConfirmAddToSet = async () => {
    if (!selectedSetId) {
      showToast("Vui lòng chọn 1 bộ thẻ!", "error");
      return;
    }

    try {
      setAddingToSet(true);
      await axios.post(
        `http://localhost:8080/api/grammar/${flashcardModal.grammar.id}/add-to-set`,
        { setId: Number(selectedSetId) },
        { headers: getAuthHeader() }
      );
      showToast(`Đã thêm cấu trúc "${flashcardModal.grammar.structure || flashcardModal.grammar.title}" vào bộ thẻ thành công! 🎉`, "success");
      setFlashcardModal({ show: false, grammar: null });
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Không thể thêm vào bộ thẻ!", "error");
    } finally {
      setAddingToSet(false);
    }
  };

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case "N5": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "N4": return "bg-sky-50 text-sky-700 border-sky-200";
      case "N3": return "bg-amber-50 text-amber-700 border-amber-200";
      case "N2": return "bg-purple-50 text-purple-700 border-purple-200";
      case "N1": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <AppLayout activePage="grammar">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-7">
        
        {/* ========================================================= */}
        {/* HEADER SECTION */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/60">
              <span>📖</span> Ngữ pháp Minna no Nihongo • N5 - N1
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Kho cấu trúc ngữ pháp theo bài
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Công thức chia thể trực quan, câu ví dụ thực tế kèm Romaji và bản dịch chi tiết.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/flashcards"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <span>🃏</span> Bộ thẻ Flashcard Ngữ pháp
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LESSON SELECTOR PILLS */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Chọn bài học ngữ pháp:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode("BY_LESSON")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  viewMode === "BY_LESSON" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600"
                }`}
              >
                Theo bài
              </button>
              <button
                onClick={() => setViewMode("ALL")}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  viewMode === "ALL" ? "bg-white text-amber-700 shadow-xs" : "text-slate-600"
                }`}
              >
                Tất cả ngữ pháp
              </button>
            </div>
          </div>

          {viewMode === "BY_LESSON" && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {lessons.map((lesson) => {
                const active = activeLesson === lesson.lessonNumber;
                return (
                  <button
                    key={lesson.lessonNumber}
                    onClick={() => setActiveLesson(lesson.lessonNumber)}
                    className={`px-4 py-3 rounded-2xl border text-left whitespace-nowrap transition-all flex items-center gap-3 flex-shrink-0 ${
                      active
                        ? "bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]"
                        : "bg-white border-slate-200/90 text-slate-700 hover:border-amber-300 hover:bg-amber-50/40"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                        active ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700 font-extrabold"
                      }`}
                    >
                      {lesson.lessonNumber}
                    </span>
                    <div>
                      <p className={`text-xs font-extrabold leading-none ${active ? "text-white" : "text-slate-900"}`}>
                        Bài {lesson.lessonNumber}
                      </p>
                      <p className={`text-[10px] mt-1 ${active ? "text-amber-100" : "text-slate-600"} truncate max-w-[140px]`}>
                        {lesson.lessonTitle || "Bài học ngữ pháp"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SEARCH & FILTER BAR */}
        {/* ========================================================= */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px] relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Tìm theo cấu trúc (〜てしまう, 〜なければならない), ý nghĩa..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 outline-none focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-100 transition"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition"
          >
            <option value="ALL">Cấp độ: Tất cả</option>
            <option value="N5">Cấp độ: JLPT N5</option>
            <option value="N4">Cấp độ: JLPT N4</option>
            <option value="N3">Cấp độ: JLPT N3</option>
            <option value="N2">Cấp độ: JLPT N2</option>
            <option value="N1">Cấp độ: JLPT N1</option>
          </select>

          {topics.length > 0 && (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-700 outline-none focus:border-amber-500 transition"
            >
              <option value="ALL">Chủ đề: Tất cả</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          <span className="text-xs font-bold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 ml-auto">
            {grammars.length} cấu trúc
          </span>
        </div>

        {/* ========================================================= */}
        {/* GRAMMAR CARDS GRID */}
        {/* ========================================================= */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang tải cấu trúc ngữ pháp...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <p className="text-rose-700 font-bold text-sm">{error}</p>
            <button
              onClick={fetchGrammars}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-sm"
            >
              Thử lại
            </button>
          </div>
        ) : grammars.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
            <span className="text-4xl">📖</span>
            <h3 className="font-extrabold text-base text-slate-800">Không tìm thấy cấu trúc ngữ pháp nào</h3>
            <p className="text-xs text-slate-500">Hãy thử đổi bài học hoặc từ khóa tìm kiếm nhé!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grammars.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGrammar(item)}
                className="group relative p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/5 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Card Top: Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase ${getLevelBadgeClass(item.level)}`}>
                    {item.level || "N5"}
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                    Bài {item.lessonNumber || activeLesson}
                  </span>
                </div>

                {/* Structure Formula Pill */}
                <div className="my-2 space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/70 font-mono text-sm sm:text-base font-black text-amber-900 group-hover:bg-amber-100/70 transition">
                    {item.structure || item.title}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2">
                    {item.meaning || item.explanation}
                  </h3>
                </div>

                {/* Example Preview */}
                {item.exampleSentence && (
                  <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
                    <p className="text-xs font-semibold text-slate-800 font-japanese line-clamp-1">
                      {item.exampleSentence}
                    </p>
                    {item.exampleMeaning && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-1">
                        → {item.exampleMeaning}
                      </p>
                    )}
                  </div>
                )}

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => speakJapanese(item.exampleSentence || item.structure, e)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                    title="Nghe ví dụ"
                  >
                    <span>🔊</span>
                    <span>Phát âm</span>
                  </button>

                  <button
                    onClick={(e) => handleOpenFlashcardModal(item, e)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 hover:border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                    title="Lưu vào bộ thẻ Flashcard"
                  >
                    <span>🃏</span>
                    <span>Lưu thẻ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: CHI TIẾT NGỮ PHÁP */}
        {/* ========================================================= */}
        {selectedGrammar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="fixed inset-0"
              onClick={() => setSelectedGrammar(null)}
            />
            <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getLevelBadgeClass(selectedGrammar.level)}`}>
                    {selectedGrammar.level || "N5"}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                    Bài {selectedGrammar.lessonNumber}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGrammar(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  ✕
                </button>
              </div>

              {/* Big Formula Block */}
              <div className="text-center space-y-2 py-2">
                <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-xl sm:text-2xl font-black text-amber-950 font-mono shadow-xs">
                  {selectedGrammar.structure || selectedGrammar.title}
                </div>
                <h2 className="text-lg font-black text-slate-900 pt-1">
                  Ý nghĩa: {selectedGrammar.meaning}
                </h2>
              </div>

              {/* Explanation */}
              {selectedGrammar.explanation && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cách dùng & Lưu ý</p>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed whitespace-pre-line">
                    {selectedGrammar.explanation}
                  </p>
                </div>
              )}

              {/* Example with Speech */}
              {selectedGrammar.exampleSentence && (
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Ví dụ minh họa</p>
                    <button
                      onClick={() => speakJapanese(selectedGrammar.exampleSentence)}
                      className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                    >
                      <span>🔊</span> Nghe câu ví dụ
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-japanese leading-relaxed">
                    {selectedGrammar.exampleSentence}
                  </p>
                  {selectedGrammar.exampleMeaning && (
                    <p className="text-xs text-slate-600 italic">
                      → {selectedGrammar.exampleMeaning}
                    </p>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    const g = selectedGrammar;
                    setSelectedGrammar(null);
                    handleOpenFlashcardModal(g);
                  }}
                  className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>🃏</span> Thêm cấu trúc này vào bộ thẻ Flashcard
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: THÊM VÀO BỘ THẺ FLASHCARD */}
        {/* ========================================================= */}
        {flashcardModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div
              className="fixed inset-0"
              onClick={() => setFlashcardModal({ show: false, grammar: null })}
            />
            <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl z-10 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <span>🃏</span> Lưu Ngữ pháp vào bộ thẻ Flashcard
                </h3>
                <button
                  onClick={() => setFlashcardModal({ show: false, grammar: null })}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 space-y-1">
                <p className="text-sm font-black text-slate-900 font-mono">
                  {flashcardModal.grammar?.structure || flashcardModal.grammar?.title}
                </p>
                <p className="text-xs text-amber-800 font-semibold">{flashcardModal.grammar?.meaning}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chọn bộ thẻ của bạn:
                </label>
                {mySets.length > 0 ? (
                  <select
                    value={selectedSetId}
                    onChange={(e) => setSelectedSetId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 transition"
                  >
                    {mySets.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.cardCount || 0} thẻ)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                    <p className="font-bold">Bạn chưa tạo bộ thẻ flashcard nào.</p>
                    <Link to="/create-set" className="inline-block text-amber-700 font-black underline">
                      Bấm vào đây để tạo bộ thẻ đầu tiên →
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFlashcardModal({ show: false, grammar: null })}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToSet}
                  disabled={addingToSet || mySets.length === 0}
                  className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
                >
                  {addingToSet ? "Đang lưu..." : "Xác nhận lưu 💾"}
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
