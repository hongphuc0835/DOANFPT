import React, { useEffect, useState } from "react";
import UsersService from "../users/UsersService";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Login.css";
import { Alert, Box, LinearProgress } from "@mui/material";

const Login = () => {
  const [isRegisterTab, setIsRegisterTab] = useState(false); // Determines which form to show
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isSendOtpLoading, setIsSendOtpLoading] = useState(false);
  const [isConfirmPasswordLoading, setIsConfirmPasswordLoading] = useState(false);

  const [step, setStep] = useState(1); // Bước 1: Nhập email, Bước 2: Nhập OTP và mật khẩu mới
  const [showNewPassword, setShowNewPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  // Default values for fullName and phone
  const fullName = "User"; // Default full name
  const phone = "1234567890"; // Default phone number

  const toggleTab = (tab) => {
    setIsRegisterTab(tab);
    setMessage("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoginLoading(true);

    // Kiểm tra email và password không rỗng
    if (!email || !password) {
      setMessage("Email and password are required.");
      setIsLoginLoading(false);
      return;
    }

    try {
      const response = await UsersService.login(email, password);
      console.log("Login successfully");

      // Kiểm tra dữ liệu trả về từ backend
      if (response.data.token && response.data.user) {
        // Lưu token và thông tin người dùng vào localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userId", response.data.user.id);
        navigate("/"); // "/": Thay bằng đường dẫn trang bạn muốn redirect đến
      } else {
        setMessage(response.data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      // Cải thiện xử lý lỗi và thông báo cụ thể hơn
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "An unexpected error occurred.";

        if (status === 401) {
          setMessage("Invalid credentials. Please check your email and password.");
        } else {
          setMessage(message);
        }
      } else {
        // Lỗi mạng hoặc không có phản hồi từ server
        setMessage("Network error. Please try again.");
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("Registration successful!");
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setIsRegisterLoading(true);
    try {
      const response = await UsersService.register(email, newPassword, fullName, phone);

      if (response.status === 200) {
        setMessage("Registration successful! Redirecting to login...");
        toggleTab(false);
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data?.message || error.message);
      setMessage(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleGetCode = async () => {
    if (!email) {
      setMessage("Please enter your email!");
      return;
    }
    setIsSendOtpLoading(true);
    try {
      await UsersService.sendOtp(email);

      setStep(2);
      let timer = 60;
      setCooldown(timer);
      const interval = setInterval(() => {
        timer -= 1;
        setCooldown(timer);

        if (timer === 0) clearInterval(interval);
      }, 1000);
    } catch (error) {
      console.error("OTP request error:", error.response?.data?.Message || error.message);
      setMessage(error.response?.data?.Message || "An error occurred. Please try again.");
    } finally {
      setIsSendOtpLoading(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    console.log("Password reset attempted with email:", email, "otpCode:", otpCode, "newPassword:", newPassword, "confirmPassword:", confirmPassword);
    if (!otpCode || !newPassword || !confirmPassword) {
      setMessage("Please fill in all the fields!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match!");
      return;
    }
    setIsConfirmPasswordLoading(true);
    try {
      const response = await UsersService.resetPassword(email, otpCode, newPassword);
      console.log("Password reset response:", response.data);
      setMessage(response.data.Message || "Password reset successful!");
      setTimeout(() => {
        toggleForgotPassword(); // Gọi hàm này để quay về form login
      }, 2000);
    } catch (error) {
      console.error("Password reset error:", error.response?.data?.Message || error.message);
      setMessage(error.response?.data?.Message || "An error occurred. Please try again.");
    } finally {
      setIsConfirmPasswordLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword((prev) => !prev);

    setStep(1); // Reset về bước đầu tiên khi mở lại
  };

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (message) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 1, 100);
          return newProgress;
        });
      }, 25); // 3s = 3000ms, chia cho 100 step => mỗi step là 30ms

      // Tự động xóa thông báo sau 3 giây
      const timeout = setTimeout(() => {
        setMessage(null); // hoặc setMessage("") tùy thuộc vào cách bạn định nghĩa
        clearInterval(interval); // Xóa interval
      }, 3000);

      // Cleanup interval và timeout nếu component unmount
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [message, setMessage]);

  return (
    <div className="login">
      <div class="container-wrapper">
        <div className={`container1 ${isRegisterTab ? "right-panel-active" : ""}`} id="container1">
          {/* Sign Up Form */}
          <div className={`form-container1 sign-up-container1 ${isRegisterTab ? "active" : ""}`}>
            <form onSubmit={handleRegister}>
              <h1>Create Account</h1>
              <div className="social-container1">
                <a href="/f" className="social">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="/g" className="social">
                  <i className="fab fa-google-plus-g"></i>
                </a>
                <a href="/l" className="social">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
              <span>or use your email for registration</span>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="password-container1">
                <input type={showNewPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                <i className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowNewPassword((prev) => !prev)}></i>
              </div>

              <div className="password-container1">
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowConfirmPassword((prev) => !prev)}></i>
              </div>
              <button type="submit" disabled={isRegisterLoading}>
                {isRegisterLoading ? "Registering..." : "Sign Up"}
              </button>
            </form>
          </div>

          {/* Sign In Form */}
          <div className={`form-container1 sign-in-container1 ${!isRegisterTab ? "active" : ""}`}>
            {showForgotPassword ? (
              // Hiển thị Forgot Password Form
              <form className="forgot-pass-form" onSubmit={handlePasswordReset}>
                <h1>Forgot Password?</h1>
                {step === 1 ? (
                  <div>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <button type="button" onClick={handleGetCode} disabled={cooldown > 0 || isSendOtpLoading}>
                      {isSendOtpLoading ? "Sending..." : cooldown > 0 ? `Wait (${cooldown}s)` : "Send OTP"}
                    </button>
                  </div>
                ) : (
                  <div>
                    <input type="text" placeholder="OTP Code" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />

                    <div className="password-container1">
                      <input type={showNewPassword ? "text" : "password"} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                      <i className={`fa-solid ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowNewPassword((prev) => !prev)}></i>
                    </div>

                    <div className="password-container1">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                      <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={() => setShowConfirmPassword((prev) => !prev)}></i>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isConfirmPasswordLoading}>
                  {isConfirmPasswordLoading ? "Processing..." : "Confirm"}
                </button>
                <Link to="#" type="button" onClick={toggleForgotPassword}>
                  Back to Login
                </Link>
              </form>
            ) : (
              // Hiển thị Sign In Form
              <form onSubmit={handleLogin}>
                <h1>Sign in</h1>
                <div className="social-container1">
                  <a href="/f" className="social">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="/g" className="social">
                    <i className="fab fa-google-plus-g"></i>
                  </a>
                  <a href="/l" className="social">
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                </div>
                <span>or use your account</span>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <div className="password-container1">
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} onClick={togglePasswordVisibility}></i>
                </div>
                <Link to="#" onClick={toggleForgotPassword}>
                  Forgot your password?
                </Link>
                <button type="submit" disabled={isLoginLoading}>
                  {isLoginLoading ? "Logging in..." : "Sign In"}
                </button>
              </form>
            )}
          </div>

          {/* Overlay Panels */}
          <div className="overlay-container1">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1>Welcome Back!</h1>
                <p>To keep connected with us please login with your personal info</p>
                <button className="ghost" id="signIn" onClick={() => toggleTab(false)}>
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start journey with us</p>
                <button className="ghost" id="signUp" onClick={() => toggleTab(true)}>
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <>
        <style>
          {`
@keyframes slideInFromRight {
0% {
  transform: translateX(100%); /* Start from 100% to the right */
  opacity: 0;
}
100% {
  transform: translateX(0); /* End at the original position */
  opacity: 1;
}
}
`}
        </style>
        {message && (
          <Box
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              background: "#1a1a1a",
              opacity: 0.95,
              fontSize: "1rem",
              lineHeight: "1.5em",
              borderRadius: "8px",
              padding: 2,

              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
              animation: "slideInFromRight 0.5s ease-in-out" /* Apply the new animation */,
            }}
            className="alert-box"
          >
            <Alert
              sx={{
                margin: 0,
                fontSize: "1rem",
                background: "transparent",

                textAlign: "center",

                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              severity={message.toLowerCase().includes("error") ? "error" : "success"}
            >
              {message}
            </Alert>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: "6px",
                borderRadius: "8px",
                backgroundColor: "#444",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: message.toLowerCase().includes("error") ? "#f44336" : "#4caf50",
                },
              }}
            />
          </Box>
        )}
      </>
    </div>
  );
};

export default Login;
