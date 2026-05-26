import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Sửa lại đường dẫn chính xác vào thư mục page
import HomePage from './page/homePage'; 
import Login from './page/auth';
import Home from './page/user'; // Bạn đặt tên file đăng nhập là auth.jsx nên import từ đây

function App() {
  return (
    <Router>
      <Routes>
        {/* Khi người dùng vào trang web mặc định (localhost:5173), hiển thị Trang Chủ */}
        <Route path="/" element={<HomePage />} />

        {/* Khi người dùng gõ thêm /login trên trình duyệt, hiển thị Trang Đăng Nhập */}
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;