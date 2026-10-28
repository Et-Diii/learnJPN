import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { isTokenValid, clearAuthStorage, recordUserActivity } from "../utils/authSession";

export default function LoginRegisterPage() {
  const navigate = useNavigate();

  // Thông báo phiên đăng nhập hết hạn (1 tiếng)
  const [sessionNotice, setSessionNotice] = useState("");

  // Kiểm tra nếu đã có phiên đăng nhập HỢP LỆ (< 1 tiếng) thì chuyển vào Dashboard
  useEffect(() => {
    // Lấy thông báo phiên hết hạn từ sessionStorage hoặc URL
    const urlParams = new URLSearchParams(window.location.search);
    const expiredParam = urlParams.get("expired");
    const storedNotice = sessionStorage.getItem("auth_expired_notice");

    if (expiredParam || storedNotice) {
      setSessionNotice(
        storedNotice ||
          "Bạn đã không thao tác trên trang web trong 1 tiếng. Vui lòng đăng nhập lại để tiếp tục học tập!"
      );
      sessionStorage.removeItem("auth_expired_notice");
    }

    if (isTokenValid()) {
      navigate("/home", { replace: true });
    } else {
      clearAuthStorage();
    }
  }, [navigate]);

  // =========================
  // UI STATE
  // =========================
  const [activeTab, setActiveTab] = useState("login"); // "login" or "register"
  const [loading, setLoading] = useState(false);

  // =========================
  // FORM DATA
  // =========================
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  // =========================
  // ERROR & SUCCESS MESSAGES
  // =========================
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // =========================
  // SHOW/HIDE PASSWORD
  // =========================
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================
  // API BASE URL (cấu hình theo môi trường)
  // =========================
  const API_BASE_URL = "http://localhost:8080/api";

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // =========================
  // SWITCH TAB
  // =========================
  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccessMsg("");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    });
  };

  // =========================
  // VALIDATION
  // =========================
  const validateForm = () => {
    if (!formData.email || !formData.email.includes("@")) {
      setError("Vui lòng nhập email hợp lệ");
      return false;
    }
    if (!formData.password || formData.password.length < 4) {
      setError("Mật khẩu phải có ít nhất 4 ký tự");
      return false;
    }
    if (activeTab === "register") {
      if (!formData.username || formData.username.length < 2) {
        setError("Tên người dùng phải có ít nhất 2 ký tự");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return false;
      }
    }
    return true;
  };

  // =========================
  // HANDLE LOGIN (khớp với BE)
  // =========================
  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      // BE trả về String token (JWT)
      const token = response.data;
      
      // Lưu token vào localStorage
      localStorage.setItem("token", token);
      
      // Giải mã token để lấy thông tin user (nếu cần)
      // Token từ BE chứa email, bạn có thể decode nếu muốn
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userData = JSON.parse(jsonPayload);
      localStorage.setItem("userEmail", userData.sub); // sub là email từ JWT
      
      // Ghi nhận thời điểm hoạt động
      recordUserActivity();
      
      return token;
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 500 || error.response?.data?.includes("User not found")) {
        throw new Error("Email hoặc mật khẩu không đúng", { cause: error });
      }
      if (error.response?.data?.includes("Wrong password")) {
        throw new Error("Mật khẩu không chính xác", { cause: error });
      }
      throw new Error("Đăng nhập thất bại, vui lòng thử lại", { cause: error });
    }
  };

  // =========================
  // HANDLE REGISTER (khớp với BE)
  // =========================
  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // BE trả về String token (JWT) ngay sau khi register
      const token = response.data;
      
      // Lưu token vào localStorage
      localStorage.setItem("token", token);
      
      // Decode token lấy email
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const userData = JSON.parse(jsonPayload);
      localStorage.setItem("userEmail", userData.sub);
      
      // Ghi nhận thời điểm hoạt động
      recordUserActivity();
      
      return token;
    } catch (error) {
      console.error("Register error:", error);
      if (error.response?.data?.includes("Email already exists")) {
        throw new Error("Email đã được đăng ký", { cause: error });
      }
      throw new Error("Đăng ký thất bại, vui lòng thử lại", { cause: error });
    }
  };

  // =========================
  // HANDLE SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (activeTab === "login") {
        await handleLogin();
        setSuccessMsg("Đăng nhập thành công! Đang chuyển đến Dashboard...");
        
        setTimeout(() => {
          navigate("/home");
        }, 800);
      } else {
        await handleRegister();
        setSuccessMsg("Đăng ký thành công! Đang chuyển đến Dashboard...");
        
        setTimeout(() => {
          navigate("/home");
        }, 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DEMO CREDENTIALS
  // =========================
  const fillDemoCredentials = () => {
    setFormData({
      email: "demo@nihonai.com",
      password: "password123",
      confirmPassword: "",
      username: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden relative">
      {/* Soft Ambient Light Glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100/60 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-100/50 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-50/50 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center text-xl font-bold text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            日
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">NihonAI</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 -mt-1">
              Japanese Learning
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12 md:py-16">
        <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT COLUMN - Brand Message */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold mx-auto lg:mx-0 shadow-sm">
              ✨ {activeTab === "login" ? "Chào mừng trở lại" : "Bắt đầu hành trình"}
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black leading-tight text-slate-900 tracking-tight">
              {activeTab === "login" ? "Tiếp tục học cùng" : "Gia nhập cộng đồng"}
              <span className="block mt-1 bg-gradient-to-r from-indigo-600 to-rose-600 bg-clip-text text-transparent">
                {activeTab === "login" ? "NihonAI Sensei" : "học tiếng Nhật"}
              </span>
            </h2>
            
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              {activeTab === "login"
                ? "Đăng nhập để tiếp tục lộ trình ôn tập Kanji, từ vựng và ngữ pháp thông minh. Theo dõi chuỗi ngày học tập và nâng cao trình độ JLPT mỗi ngày."
                : "Tạo tài khoản miễn phí để trải nghiệm phương pháp học lặp lại ngắt quãng (Spaced Repetition) kết hợp trí tuệ nhân tạo cá nhân hóa."}
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-indigo-600">🤖</span>
                <span className="text-xs font-bold text-slate-700">AI Sensei 24/7</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-purple-600">📚</span>
                <span className="text-xs font-bold text-slate-700">5000+ từ vựng</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                <span className="text-rose-500">🎯</span>
                <span className="text-xs font-bold text-slate-700">Flashcard Spaced Repetition</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="hidden lg:block p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm mt-6">
              <div className="flex items-start gap-3">
                <span className="text-indigo-500 text-2xl font-serif">“</span>
                <div>
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    Học với AI Sensei giúp mình hiểu ngữ pháp nhanh hơn hẳn, các bộ thẻ flashcard lật cực mượt và dễ nhớ!
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      MT
                    </div>
                    <span className="text-xs font-bold text-slate-600">Minh Thu — Học viên N3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Login/Register Form */}
          <div className="w-full">
            <div className="relative rounded-3xl border border-slate-200/90 bg-white p-7 md:p-9 shadow-xl shadow-indigo-500/5">
              
              {/* Header with Icon & Tabs */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center text-2xl mx-auto mb-4 text-white shadow-md shadow-indigo-500/20">
                  {activeTab === "login" ? "🔐" : "✨"}
                </div>
                
                {/* TABS BUTTONS (Segmented control) */}
                <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 max-w-[280px] mx-auto mb-6">
                  <button
                    onClick={() => switchTab("login")}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                      activeTab === "login"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => switchTab("register")}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all duration-200 ${
                      activeTab === "register"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>
              </div>

              {/* Session Notice / Error & Success Messages */}
              {sessionNotice && (
                <div className="mb-4 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-800 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
                  <span className="text-base leading-none">⏱️</span>
                  <div>
                    <strong className="block font-bold text-amber-900 mb-0.5">Tự động đăng xuất do 1 tiếng không sử dụng web</strong>
                    <span>{sessionNotice}</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                  <span>✅</span> {successMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username - Only for Register */}
                {activeTab === "register" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="VD: nguyen_van_a"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password - Only for Register */}
                {activeTab === "register" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember me - Only for Login */}
                {activeTab === "login" && (
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
                    </label>
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold transition"
                      onClick={() => setError("Chức năng quên mật khẩu đang được phát triển")}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold text-white shadow-md shadow-indigo-500/20 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      {activeTab === "login" ? "Đang đăng nhập..." : "Đang đăng ký..."}
                    </>
                  ) : (
                    <>{activeTab === "login" ? "Đăng nhập ngay" : "Tạo tài khoản"}</>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400 font-medium">
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setError("Tính năng đăng nhập Google đang được tích hợp")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs font-bold text-slate-700 shadow-sm"
                >
                  <span className="text-rose-500 font-bold text-sm">G</span> Google
                </button>
                <button
                  type="button"
                  onClick={() => setError("Tính năng đăng nhập X đang được tích hợp")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-xs font-bold text-slate-700 shadow-sm"
                >
                  <span className="text-slate-900 font-bold text-sm">𝕏</span> X (Twitter)
                </button>
              </div>

              {/* Demo Credentials Hint - Only for Login */}
              {activeTab === "login" && (
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
                  >
                    🎮 Điền nhanh tài khoản demo: demo@nihonai.com
                  </button>
                </div>
              )}

              {/* Security info: 1-hour session */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <span className="text-emerald-500">🛡️</span>
                <span>Bảo mật: Tự động đăng xuất sau <strong>1 tiếng không sử dụng web</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-slate-500 text-xs border-t border-slate-200 bg-white/50">
        <p>© 2025 NihonAI — Nền tảng học tiếng Nhật thông minh với AI • 安全・便利</p>
      </footer>
    </div>
  );
}