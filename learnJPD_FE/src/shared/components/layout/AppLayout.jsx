import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  isTokenValid, 
  handleSessionExpired, 
  logoutUser, 
  recordUserActivity 
} from "../../../features/auth/utils/authSession";

export default function AppLayout({ children, activePage = "" }) {
  const location = useLocation();

  // Sidebar co giãn trên desktop & mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User info từ storage
  const [userEmail] = useState(() => localStorage.getItem("userEmail") || "Học viên");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Kiểm tra phiên đăng nhập hợp lệ (chưa bị idle quá 1 tiếng)
    if (!isTokenValid()) {
      handleSessionExpired();
      return;
    }
    // Ghi nhận tương tác khi người dùng vào trang
    recordUserActivity();
  }, []);

  // Menu items chuẩn hóa thống nhất
  const navItems = [
    { id: "dashboard", path: "/home", label: "Tổng quan", icon: "📊", badge: null },
    { id: "vocabulary", path: "/vocabulary", label: "Kho từ vựng", icon: "📚", badge: "Bài học" },
    { id: "kanji", path: "/kanji", label: "Chữ Hán Kanji", icon: "🈴", badge: "214 bộ" },
    { id: "grammar", path: "/grammar", label: "Ngữ pháp", icon: "📖", badge: "N5-N1" },
    { id: "flashcards", path: "/flashcards", label: "Bộ thẻ Flashcard", icon: "🃏", badge: null },
    { id: "create-set", path: "/create-set", label: "Tạo bộ thẻ mới", icon: "➕", badge: null },
  ];

  // Kiểm tra route active
  const isItemActive = (item) => {
    if (activePage && activePage === item.id) return true;
    return location.pathname === item.path;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex overflow-hidden font-sans">
      
      {/* ================================================= */}
      {/* 1. SIDEBAR (Desktop & Tablet) */}
      {/* ================================================= */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 z-30 select-none ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo Brand Header */}
        <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100">
          <Link
            to="/home"
            className={`flex items-center gap-3 group transition-transform ${
              sidebarCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              日
            </div>
            {!sidebarCollapsed && (
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-1.5">
                  NihonAI
                  <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-200/60 uppercase">
                    Pro
                  </span>
                </span>
                <p className="text-[10px] font-semibold tracking-wider text-slate-600 -mt-0.5 uppercase">
                  Nền tảng học tiếng Nhật
                </p>
              </div>
            )}
          </Link>

          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1.5 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Thu gọn menu"
            >
              <span className="text-sm">◀</span>
            </button>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="p-2 flex justify-center border-b border-slate-100">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition"
              title="Mở rộng menu"
            >
              <span>▶</span>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {!sidebarCollapsed && (
            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Menu học tập
            </p>
          )}

          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm transition-all group ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 scale-[1.01]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={`text-xl transition-transform group-hover:scale-110 ${active ? "animate-pulse" : ""}`}>
                  {item.icon}
                </span>

                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card ở cuối sidebar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div
            className={`flex items-center gap-3 p-2 rounded-2xl hover:bg-white transition border border-transparent hover:border-slate-200/80 ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
              {userEmail.charAt(0).toUpperCase()}
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{userEmail}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                    Đang học • N5
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ================================================= */}
      {/* 2. MOBILE DRAWER OVERLAY */}
      {/* ================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-18 px-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
                  日
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">NihonAI</span>
                  <p className="text-[10px] font-bold text-indigo-600 -mt-0.5 uppercase">Sensei Hub</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-bold text-sm transition-all ${
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logoutUser();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 transition"
              >
                <span>🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* 3. MAIN WRAPPER (Header + Content Area) */}
      {/* ================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Global Top Navbar */}
        <header className="h-18 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 z-20 flex-shrink-0">
          
          {/* Left: Mobile trigger & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 shadow-xs"
            >
              <span className="text-lg">☰</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Link to="/home" className="hover:text-indigo-600 transition">Trang chủ</Link>
              <span>/</span>
              <span className="text-slate-800 font-bold capitalize">
                {navItems.find(i => isItemActive(i))?.label || "Học tập"}
              </span>
            </div>
          </div>

          {/* Right: Quick Action & User Dropdown */}
          <div className="flex items-center gap-3">

            {/* Quick Action: Luyện Flashcard nhanh */}
            <Link
              to="/flashcards"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-700 transition"
            >
              <span>🃏</span>
              <span>Ôn tập</span>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[120px] truncate">
                  {userEmail.split("@")[0]}
                </span>
                <span className="text-slate-600 text-xs">▼</span>
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{userEmail}</p>
                      <p className="text-[11px] text-slate-600">Trình độ mục tiêu: JLPT N5</p>
                    </div>

                    <Link
                      to="/home"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span>📊</span>
                      <span>Bảng điều khiển</span>
                    </Link>

                    <Link
                      to="/create-set"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span>➕</span>
                      <span>Tạo bộ thẻ Flashcard</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logoutUser();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <span>🚪</span>
                      <span>Đăng xuất (Kết thúc phiên)</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
