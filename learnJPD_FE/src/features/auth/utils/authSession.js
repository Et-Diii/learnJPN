import axios from "axios";

// Hằng số thời gian không hoạt động: 1 tiếng (3600000 ms)
export const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const LAST_ACTIVITY_KEY = "nihonai_last_activity_ts";

let lastRecordedLocalTs = 0;

/**
 * Ghi nhận tương tác của người dùng trên trang web (throttled mỗi 2s để tối ưu hiệu năng)
 */
export function recordUserActivity() {
  const now = Date.now();
  if (now - lastRecordedLocalTs > 2000) {
    lastRecordedLocalTs = now;
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    } catch {
      // Bỏ qua nếu localStorage bị đầy hoặc lỗi truy cập
    }
  }
}

/**
 * Lấy thời điểm hoạt động cuối cùng của người dùng
 */
export function getLastActivityTime() {
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {
    // Dự phòng
  }
  return Date.now();
}

/**
 * Kiểm tra xem người dùng có bị nhàn rỗi (idle) quá 1 tiếng không
 */
export function isUserIdleTooLong() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const lastActivity = getLastActivityTime();
  return Date.now() - lastActivity >= IDLE_TIMEOUT_MS;
}

/**
 * Giải mã phần payload của JWT token mà không cần thư viện ngoài
 */
export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Lỗi giải mã JWT token:", error);
    return null;
  }
}

/**
 * Kiểm tra xem phiên còn hợp lệ không:
 * - Có token
 * - JWT token chưa hết hạn backend
 * - KHÔNG bị bỏ trống (không thao tác) quá 1 tiếng
 */
export function isTokenValid() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  // 1. Kiểm tra JWT token payload
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    clearAuthStorage();
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (payload.exp <= nowSeconds) {
    clearAuthStorage();
    return false;
  }

  // 2. Kiểm tra Inactivity Timeout (sau 1 tiếng không dùng web thì đăng xuất)
  if (isUserIdleTooLong()) {
    clearAuthStorage();
    return false;
  }

  return true;
}

/**
 * Dọn dẹp token và dữ liệu phiên trong storage
 */
export function clearAuthStorage() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

/**
 * Đăng xuất người dùng thủ công
 */
export function logoutUser() {
  clearAuthStorage();
  localStorage.removeItem("userSettings");
  sessionStorage.removeItem("auth_expired_notice");
  window.location.href = "/login";
}

/**
 * Xử lý khi phiên làm việc hết hạn sau 1 tiếng không sử dụng web
 */
export function handleSessionExpired(customMessage) {
  clearAuthStorage();
  sessionStorage.setItem(
    "auth_expired_notice",
    customMessage ||
      "Bạn đã không thao tác trên trang web trong 1 tiếng. Phiên đăng nhập đã tự động kết thúc để bảo mật."
  );

  // Điều hướng về trang đăng nhập nếu chưa ở đó
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login?expired=1";
  }
}

/**
 * Khởi tạo Interceptor toàn cục cho Axios
 * - Tự động gắn Bearer Token nếu còn hạn
 * - Chặn request và chuyển hướng nếu không thao tác quá 1 tiếng
 * - Bắt mã 401 khi Backend từ chối
 */
let interceptorInitialized = false;

export function setupAxiosAuthInterceptors() {
  if (interceptorInitialized) return;
  interceptorInitialized = true;

  // Request Interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        if (!isTokenValid()) {
          handleSessionExpired();
          return Promise.reject(new Error("Phiên đăng nhập đã kết thúc sau 1 tiếng không hoạt động"));
        }
        // Có request gửi đi => người dùng đang tương tác
        recordUserActivity();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response Interceptor
  axios.interceptors.response.use(
    (response) => {
      // Có phản hồi thành công => ghi nhận hoạt động
      recordUserActivity();
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        // Backend trả về 401 do token không hợp lệ hoặc hết hạn
        handleSessionExpired();
      }
      return Promise.reject(error);
    }
  );
}

/**
 * Lắng nghe tất cả các tương tác người dùng trên giao diện web
 */
let activityListenersAttached = false;

export function setupActivityListeners() {
  if (activityListenersAttached || typeof window === "undefined") return;
  activityListenersAttached = true;

  const handleActivity = () => {
    // Chỉ cập nhật khi người dùng đã đăng nhập (có token)
    if (localStorage.getItem("token")) {
      recordUserActivity();
    }
  };

  const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"];
  events.forEach((evt) => {
    window.addEventListener(evt, handleActivity, { passive: true });
  });

  // Đồng bộ giữa các tab trình duyệt
  window.addEventListener("storage", (e) => {
    if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
      const ts = parseInt(e.newValue, 10);
      if (!Number.isNaN(ts) && ts > lastRecordedLocalTs) {
        lastRecordedLocalTs = ts;
      }
    }
    // Nếu tab khác vừa đăng xuất (xóa token), tab này cũng đăng xuất
    if (e.key === "token" && !e.newValue) {
      handleSessionExpired("Tài khoản đã đăng xuất từ một cửa sổ khác.");
    }
  });
}

/**
 * Bộ theo dõi kiểm tra Inactivity Timeout định kỳ và khi chuyển lại tab
 */
let watcherInterval = null;

export function startSessionWatcher() {
  // Gắn các bộ lắng nghe hành vi người dùng
  setupActivityListeners();

  if (watcherInterval) clearInterval(watcherInterval);

  const check = () => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isUserIdleTooLong() || !isTokenValid()) {
        handleSessionExpired(
          "Bạn đã không thao tác trên trang web trong 1 tiếng. Phiên đăng nhập đã tự động kết thúc để bảo mật."
        );
      }
    }
  };

  // Kiểm tra mỗi 15 giây
  watcherInterval = setInterval(check, 15000);

  // Kiểm tra ngay khi người dùng chuyển lại tab (focus / visibility)
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      check();
      // Nếu vẫn còn hợp lệ thì ghi nhận vừa quay lại web
      if (localStorage.getItem("token")) {
        recordUserActivity();
      }
    }
  });

  window.addEventListener("focus", () => {
    check();
    if (localStorage.getItem("token")) {
      recordUserActivity();
    }
  });
}
