import { useState } from "react";
import axios from "axios";

export default function LoginRegisterPage() {
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
      
      return token;
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 500 || error.response?.data?.includes("User not found")) {
        throw new Error("Email hoặc mật khẩu không đúng");
      }
      if (error.response?.data?.includes("Wrong password")) {
        throw new Error("Mật khẩu không chính xác");
      }
      throw new Error("Đăng nhập thất bại, vui lòng thử lại");
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
      
      return token;
    } catch (error) {
      console.error("Register error:", error);
      if (error.response?.data?.includes("Email already exists")) {
        throw new Error("Email đã được đăng ký");
      }
      throw new Error("Đăng ký thất bại, vui lòng thử lại");
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
        setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
        
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        await handleRegister();
        setSuccessMsg("Đăng ký thành công! Đang chuyển hướng...");
        
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
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
    <div className="min-h-screen bg-[#0F172A] text-white overflow-hidden relative">
      {/* Glow orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[100px] rounded-full" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-md bg-[#0F172A]/50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = "/"}>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-500/30">
            日
          </div>
          <h1 className="text-2xl font-black tracking-wide">NihonAI</h1>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center px-6 py-16 md:py-24">
        <div className="max-w-6xl w-full mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT COLUMN - Brand Message */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-sm mx-auto lg:mx-0">
              ✨ {activeTab === "login" ? "Chào mừng trở lại" : "Bắt đầu hành trình"}
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              {activeTab === "login" ? "Chào mừng" : "Gia nhập cộng đồng"}
              <span className="block bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
                {activeTab === "login" ? "NihonAI" : "học tiếng Nhật"}
              </span>
            </h2>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
              {activeTab === "login"
                ? "Đăng nhập để tiếp tục hành trình chinh phục tiếng Nhật cùng AI Sensei. Theo dõi tiến độ, ôn tập thông minh và nâng cấp kỹ năng mỗi ngày."
                : "Tạo tài khoản miễn phí và trải nghiệm phương pháp học tiếng Nhật thông minh với AI. Học Kanji, từ vựng, ngữ pháp theo lộ trình cá nhân hóa."}
            </p>

            {/* Feature highlights */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-cyan-400">🤖</span>
                <span className="text-sm">AI Sensei</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-purple-400">📚</span>
                <span className="text-sm">5000+ từ vựng</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-pink-400">🎯</span>
                <span className="text-sm">Quiz thông minh</span>
              </div>
            </div>

            {/* Testimonial */}
            <div className="hidden lg:block p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mt-8">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-quote-left text-cyan-400/60 text-xl"></i>
                <div>
                  <p className="text-gray-200 text-sm leading-relaxed italic">
                    “Học với AI Sensei giúp mình hiểu ngữ pháp nhanh hơn hẳn. Lộ trình cá nhân hóa cực kỳ hiệu quả!”
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-xs font-bold">
                      MT
                    </div>
                    <span className="text-xs text-gray-400">– Minh Thu, N3 candidate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Login/Register Form */}
          <div className="w-full">
            <div className="relative rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-purple-500/10">
              
              {/* Header with Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-400 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                  {activeTab === "login" ? "🔐" : "✨"}
                </div>
                
                {/* TABS BUTTONS */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 max-w-[280px] mx-auto mb-6">
                  <button
                    onClick={() => switchTab("login")}
                    className={`flex-1 py-2.5 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === "login"
                        ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => switchTab("register")}
                    className={`flex-1 py-2.5 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === "register"
                        ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white shadow-lg shadow-purple-500/30"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Đăng ký
                  </button>
                </div>
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-sm flex items-center gap-2">
                  <span>✅</span> {successMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username - Only for Register */}
                {activeTab === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="VD: japanese_learner"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-500 focus:border-cyan-400/70 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-500 focus:border-cyan-400/70 outline-none transition-all"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-500 focus:border-cyan-400/70 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password - Only for Register */}
                {activeTab === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-3.5 text-white placeholder:text-gray-500 focus:border-cyan-400/70 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Remember me - Only for Login */}
                {activeTab === "login" && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/5" />
                      <span className="text-gray-300">Ghi nhớ đăng nhập</span>
                    </label>
                    <button
                      type="button"
                      className="text-cyan-300 hover:text-cyan-200 transition"
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
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {activeTab === "login" ? "Đang đăng nhập..." : "Đang đăng ký..."}
                    </>
                  ) : (
                    <>{activeTab === "login" ? "Đăng nhập" : "Đăng ký"}</>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0F172A]/80 backdrop-blur-sm px-3 text-gray-400">
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setError("Tính năng đang phát triển")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  <span className="text-rose-400">G</span> Google
                </button>
                <button
                  type="button"
                  onClick={() => setError("Tính năng đang phát triển")}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
                >
                  <span className="text-gray-300">𝕏</span> X (Twitter)
                </button>
              </div>

              {/* Demo Credentials Hint - Only for Login */}
              {activeTab === "login" && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-xs text-gray-500 hover:text-cyan-400 transition"
                  >
                    🎮 Dùng tài khoản demo: demo@nihonai.com / password123
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-gray-500 text-xs border-t border-white/5">
        <p>© 2025 NihonAI — Học tiếng Nhật thông minh với AI • 安全・便利</p>
      </footer>
    </div>
  );
}