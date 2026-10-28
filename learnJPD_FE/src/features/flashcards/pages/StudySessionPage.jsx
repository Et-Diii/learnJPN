import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { isTokenValid, handleSessionExpired } from "../../auth/utils/authSession";

export default function StudySessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State chung
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setDetail, setSetDetail] = useState(null);
  const [session, setSession] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [summary, setSummary] = useState(null);

  // Chế độ học: "FLIP" hoặc "TYPE"
  const [studyMode, setStudyMode] = useState("FLIP");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typeFeedback, setTypeFeedback] = useState(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  // Resume dialog
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingResumeIndex, setPendingResumeIndex] = useState(0);

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

  const formatTimer = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Khởi động phiên học
  const startNewSession = useCallback(async (resume = false, startIndex = 0) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8080/api/flashcard-sets/${id}/study/start`,
        {
          mode: studyMode,
          resumeExisting: resume,
          shuffle: false,
        },
        { headers: getAuthHeader() }
      );

      const sessionData = res.data;
      setSession(sessionData);
      setCards(sessionData.cards || []);
      setCurrentIndex(resume ? sessionData.lastCardIndex || 0 : startIndex);
      setIsFlipped(false);
      setIsCompleted(false);
      setTypedAnswer("");
      setTypeFeedback(null);
      setShowResumeModal(false);

      setTimerSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Không thể khởi động phiên học!");
    } finally {
      setLoading(false);
    }
  }, [id, studyMode, getAuthHeader]);

  // Tải chi tiết bộ thẻ
  const fetchSetAndInitSession = useCallback(async () => {
    if (!isTokenValid()) {
      handleSessionExpired();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const detailRes = await axios.get(`http://localhost:8080/api/flashcard-sets/${id}`, {
        headers: getAuthHeader(),
      });
      const data = detailRes.data;
      setSetDetail(data);

      if (!data.cards || data.cards.length === 0) {
        setError("Bộ thẻ này hiện chưa có thẻ nào để học. Vui lòng thêm thẻ trước!");
        setLoading(false);
        return;
      }

      if (data.activeSessionId && data.activeSessionLastIndex > 0) {
        setPendingResumeIndex(data.activeSessionLastIndex);
        setShowResumeModal(true);
        setLoading(false);
        return;
      }

      await startNewSession(true, 0);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data || "Không thể tải bộ thẻ học!");
    } finally {
      setLoading(false);
    }
  }, [id, getAuthHeader, startNewSession]);

  useEffect(() => {
    fetchSetAndInitSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchSetAndInitSession]);

  // Hoàn thành phiên học
  const finishSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsCompleted(true);

    try {
      if (session) {
        const res = await axios.get(
          `http://localhost:8080/api/flashcard-sets/study/sessions/${session.sessionId}/summary`,
          { headers: getAuthHeader() }
        );
        setSummary(res.data);
      }
    } catch (err) {
      console.error("Lỗi lấy tổng kết phiên:", err);
      setSummary({
        totalReviewed: cards.length,
        accuracyRate: 90,
        correctCount: cards.length,
      });
    }
  }, [session, cards.length, getAuthHeader]);

  // Chuyển thẻ tiếp theo
  const goToNextCard = useCallback(() => {
    if (currentIndex + 1 >= cards.length) {
      finishSession();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setTypedAnswer("");
      setTypeFeedback(null);
    }
  }, [currentIndex, cards.length, finishSession]);

  // Đánh giá thẻ
  const handleRateCard = async (rating) => {
    if (!cards[currentIndex] || !session) return;
    const currentCard = cards[currentIndex];
    const isCorrect = rating === "GOOD" || rating === "EASY";

    try {
      await axios.post(
        `http://localhost:8080/api/flashcard-sets/study/review`,
        {
          sessionId: session.sessionId,
          cardId: currentCard.id,
          rating: rating,
          isCorrect: isCorrect,
          currentCardIndex: currentIndex + 1,
        },
        { headers: getAuthHeader() }
      );
    } catch (err) {
      console.error("Lỗi lưu đánh giá thẻ:", err);
    }

    goToNextCard();
  };

  // Type Mode Check
  const handleCheckTypedAnswer = () => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    const cleanInput = typedAnswer.trim().toLowerCase();
    const cleanTarget = (currentCard.frontText || "").trim().toLowerCase();
    const isCorrect = cleanInput === cleanTarget;

    setTypeFeedback({
      correct: isCorrect,
      expected: currentCard.frontText,
    });

    if (session) {
      axios.post(
        `http://localhost:8080/api/flashcard-sets/study/review`,
        {
          sessionId: session.sessionId,
          cardId: currentCard.id,
          rating: isCorrect ? "GOOD" : "AGAIN",
          isCorrect: isCorrect,
          currentCardIndex: currentIndex + 1,
        },
        { headers: getAuthHeader() }
      ).catch(console.error);
    }
  };

  // Keyboard Shortcuts (Space để lật, 1-4 đánh giá)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted || loading || showResumeModal) return;

      // Nếu đang gõ text trong ô input thì bỏ qua phím số
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        if (e.key === "Enter" && studyMode === "TYPE" && !typeFeedback) {
          handleCheckTypedAnswer();
        }
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped && studyMode === "FLIP") {
        if (e.key === "1") handleRateCard("AGAIN");
        else if (e.key === "2") handleRateCard("HARD");
        else if (e.key === "3") handleRateCard("GOOD");
        else if (e.key === "4") handleRateCard("EASY");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0 ? Math.round(((currentIndex) / cards.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans select-none">
      
      {/* ========================================================= */}
      {/* 1. TOP STUDY NAVBAR */}
      {/* ========================================================= */}
      <header className="h-16 px-4 sm:px-8 bg-white border-b border-slate-200/80 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/flashcards")}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <span>←</span> Thoát phiên học
          </button>
          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
          <h1 className="text-sm font-extrabold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
            {setDetail?.title || "Bộ thẻ ôn tập"}
          </h1>
        </div>

        {/* Study Mode Selector & Timer */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStudyMode("FLIP")}
              className={`px-3 py-1 rounded-lg transition ${
                studyMode === "FLIP" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
              }`}
            >
              🔄 Lật thẻ
            </button>
            <button
              onClick={() => setStudyMode("TYPE")}
              className={`px-3 py-1 rounded-lg transition ${
                studyMode === "TYPE" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
              }`}
            >
              ⌨️ Gõ từ
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-mono font-bold border border-indigo-200/60">
            <span>⏱️</span>
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5">
        <div
          className="bg-gradient-to-r from-indigo-600 to-rose-500 h-1.5 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN STUDY STAGE */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        
        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đang khởi tạo phòng học...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center max-w-md shadow-xl space-y-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              onClick={() => navigate("/flashcards")}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Về thư viện thẻ
            </button>
          </div>
        ) : isCompleted ? (
          /* ========================================================= */
          /* 3. SESSION SUMMARY SCREEN */
          /* ========================================================= */
          <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/20">
              🎉
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hoàn thành phiên học!</h2>
              <p className="text-xs text-slate-500 font-medium">Bạn đã hoàn thành toàn bộ thẻ trong bộ ôn tập.</p>
            </div>

            <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-center p-1">
                <p className="text-xl font-black text-indigo-600">{cards.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Tổng thẻ</p>
              </div>
              <div className="text-center p-1 border-x border-slate-200">
                <p className="text-xl font-black text-rose-500">{summary?.accuracyRate || 100}%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Ghi nhớ</p>
              </div>
              <div className="text-center p-1">
                <p className="text-xl font-black text-emerald-600">{formatTimer(timerSeconds)}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Thời gian</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => startNewSession(false, 0)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition"
              >
                🔄 Học lại lần nữa
              </button>
              <button
                onClick={() => navigate("/flashcards")}
                className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition"
              >
                Về thư viện thẻ
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* 4. ACTIVE FLASHCARD INTERACTION */
          /* ========================================================= */
          <div className="w-full max-w-2xl space-y-6">
            
            {/* Card Counter & Speak */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
              <span>Thẻ {currentIndex + 1} trên {cards.length}</span>
              <button
                onClick={(e) => speakJapanese(currentCard?.frontText, e)}
                className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
              >
                <span>🔊</span> Nghe phát âm
              </button>
            </div>

            {/* 3D Flip Card Container */}
            <div
              onClick={() => studyMode === "FLIP" && setIsFlipped(!isFlipped)}
              className="perspective-1000 h-80 sm:h-96 w-full cursor-pointer select-none"
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-3xl ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* FRONT FACE (Tiếng Nhật) */}
                <div className="absolute inset-0 backface-hidden rounded-3xl p-8 bg-white border border-slate-200 shadow-xl shadow-indigo-500/5 flex flex-col justify-between items-center text-center">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Mặt trước (Tiếng Nhật)
                  </span>

                  <div className="space-y-3">
                    <p className="text-4xl sm:text-6xl font-black text-slate-900 font-japanese tracking-wide">
                      {currentCard?.frontText}
                    </p>
                    <p className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 inline-block">
                      {currentCard?.cardType || "Từ vựng"}
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 font-medium">
                    {studyMode === "FLIP" ? "Bấm vào thẻ hoặc nhấn [Phím Cách] để xem đáp án" : "Nhập câu trả lời ở khung bên dưới"}
                  </p>
                </div>

                {/* BACK FACE (Tiếng Việt) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-8 bg-gradient-to-br from-indigo-900 to-slate-900 text-white flex flex-col justify-between items-center text-center shadow-2xl">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">
                    Mặt sau (Ý nghĩa)
                  </span>

                  <div className="space-y-3 max-w-lg">
                    <p className="text-2xl sm:text-3xl font-black">
                      {currentCard?.backText}
                    </p>
                    {currentCard?.exampleText && (
                      <p className="text-xs sm:text-sm text-indigo-200 bg-white/10 p-3 rounded-2xl italic leading-relaxed">
                        "{currentCard?.exampleText}"
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-indigo-300 font-medium">
                    Chọn mức độ ghi nhớ bên dưới để tiếp tục
                  </p>
                </div>
              </div>
            </div>

            {/* Interaction Buttons: FLIP MODE */}
            {studyMode === "FLIP" && isFlipped && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <p className="text-center text-xs font-bold text-slate-400">
                  Đánh giá mức độ ghi nhớ (Phím 1, 2, 3, 4):
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => handleRateCard("AGAIN")}
                    className="p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs sm:text-sm flex flex-col items-center gap-1 transition shadow-2xs hover:scale-105"
                  >
                    <span>🟥 Quên</span>
                    <span className="text-[10px] text-rose-500 font-mono">[1]</span>
                  </button>

                  <button
                    onClick={() => handleRateCard("HARD")}
                    className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-black text-xs sm:text-sm flex flex-col items-center gap-1 transition shadow-2xs hover:scale-105"
                  >
                    <span>🟧 Khó</span>
                    <span className="text-[10px] text-amber-500 font-mono">[2]</span>
                  </button>

                  <button
                    onClick={() => handleRateCard("GOOD")}
                    className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black text-xs sm:text-sm flex flex-col items-center gap-1 transition shadow-2xs hover:scale-105"
                  >
                    <span>🟩 Nhớ</span>
                    <span className="text-[10px] text-emerald-500 font-mono">[3]</span>
                  </button>

                  <button
                    onClick={() => handleRateCard("EASY")}
                    className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-black text-xs sm:text-sm flex flex-col items-center gap-1 transition shadow-2xs hover:scale-105"
                  >
                    <span>🟦 Dễ</span>
                    <span className="text-[10px] text-indigo-500 font-mono">[4]</span>
                  </button>
                </div>
              </div>
            )}

            {/* Interaction Buttons: TYPE MODE */}
            {studyMode === "TYPE" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Gõ từ tiếng Nhật tương ứng và bấm Enter..."
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    className="flex-1 px-5 py-3.5 rounded-2xl border border-slate-300 bg-white text-base font-japanese font-black outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    onClick={handleCheckTypedAnswer}
                    className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20"
                  >
                    Kiểm tra
                  </button>
                </div>

                {typeFeedback && (
                  <div
                    className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                      typeFeedback.correct
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border-rose-200 text-rose-800"
                    }`}
                  >
                    <span>{typeFeedback.correct ? "✅ Chính xác tuyệt đối!" : `❌ Chưa đúng. Đáp án: ${typeFeedback.expected}`}</span>
                    <button
                      onClick={goToNextCard}
                      className="px-3 py-1.5 rounded-xl bg-white border text-xs font-bold shadow-2xs"
                    >
                      Tiếp tục →
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* RESUME SESSION MODAL */}
      {/* ========================================================= */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl text-center space-y-4">
            <span className="text-4xl">⏯️</span>
            <h3 className="text-base font-black text-slate-900">Tiếp tục phiên học dở dang?</h3>
            <p className="text-xs text-slate-600">
              Bạn có một phiên học trước đó đang dừng ở thẻ số <strong className="text-slate-900 font-bold">{pendingResumeIndex + 1}</strong>. Bạn muốn tiếp tục hay học lại từ đầu?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => startNewSession(false, 0)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Học từ đầu
              </button>
              <button
                onClick={() => startNewSession(true, pendingResumeIndex)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-500/20"
              >
                Tiếp tục học
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
