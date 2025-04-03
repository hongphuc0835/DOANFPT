import React, { useState } from "react";
import AdminsService from "../page/admins/AdminsService";
import { Link, useNavigate } from "react-router-dom";

import { TextField, Button, IconButton, Typography, CircularProgress, Box } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isSendOtpLoading, setIsSendOtpLoading] = useState(false);
  const [isConfirmPasswordLoading, setIsConfirmPasswordLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Track OTP status
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setMessage(""); // Reset message
    try {
      const response = await AdminsService.login(email, password);
      if (response.data.token && response.data.admin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("adminEmail", response.data.admin.email);
        localStorage.setItem("adminId", response.data.admin.id);

        setMessage("Login successful! Welcome to the dashboard.");
        navigate("/");
      } else {
        setMessage("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      setMessage(error.response?.data || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleGetCode = async () => {
    if (!email) {
      setMessage("Please enter your email!");
      return;
    }
    setIsSendOtpLoading(true);
    setMessage(""); // Reset message
    try {
      const response = await AdminsService.sendOtp(email);
      setMessage(response.data.Message || "OTP sent successfully!");
      setOtpSent(true);
      let timer = 60;
      setCooldown(timer);
      const interval = setInterval(() => {
        timer -= 1;
        setCooldown(timer);
        if (timer === 0) clearInterval(interval);
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.Message || "An error occurred. Please try again.");
    } finally {
      setIsSendOtpLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!otpCode || !newPassword || !confirmPassword) {
      setMessage("Please fill in all the fields!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match!");
      return;
    }

    setIsConfirmPasswordLoading(true);
    setMessage(""); // Reset message
    try {
      const response = await AdminsService.resetPassword(email, otpCode, newPassword);
      setMessage(response.data.Message || "Password reset successfully!");
    } catch (error) {
      setMessage(error.response?.data?.Message || "An error occurred. Please try again.");
    } finally {
      setIsConfirmPasswordLoading(false);
    }
  };

  const toggleForgotPassword = () => {
    setShowForgotPassword((prev) => !prev);
    setMessage("");
    setOtpSent(false); // Reset OTP sent status when toggling
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f4f7fc" }}>
      <div className="login-container" style={{ width: 400, padding: 24, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", backgroundColor: "white" }}>
        {showForgotPassword ? (
          <form onSubmit={handlePasswordReset}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 600 }}>
              Forgot Password?
            </Typography>
            <TextField label="Email" variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required margin="normal" sx={{ marginBottom: 2 }} />
            <Button
              variant="contained"
              color="primary"
              onClick={handleGetCode}
              disabled={cooldown > 0 || isSendOtpLoading}
              fullWidth
              sx={{
                marginBottom: 2,
                backgroundColor: "#3f51b5",
                "&:hover": { backgroundColor: "#303f9f" },
              }}
            >
              {isSendOtpLoading ? "Sending..." : cooldown > 0 ? `Wait (${cooldown}s)` : "Send OTP"}
            </Button>
            {otpSent && (
              <>
                <TextField label="OTP Code" variant="outlined" fullWidth value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required margin="normal" sx={{ marginBottom: 2 }} />
                <TextField
                  label="New Password"
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    endAdornment: <IconButton onClick={togglePasswordVisibility}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>,
                  }}
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  label="Confirm Password"
                  variant="outlined"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  margin="normal"
                  InputProps={{
                    endAdornment: <IconButton onClick={togglePasswordVisibility}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>,
                  }}
                  sx={{ marginBottom: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isConfirmPasswordLoading}
                  fullWidth
                  sx={{
                    backgroundColor: "#3f51b5",
                    "&:hover": { backgroundColor: "#303f9f" },
                  }}
                >
                  {isConfirmPasswordLoading ? <CircularProgress size={24} /> : "Confirm"}
                </Button>
              </>
            )}
            <Link to="#" onClick={toggleForgotPassword} style={{ display: "block", marginTop: 16, textAlign: "center", color: "#3f51b5" }}>
              Back to Login
            </Link>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 600 }}>
              Login
            </Typography>
            <TextField label="Email" variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required margin="normal" sx={{ marginBottom: 2 }} />
            <TextField
              label="Password"
              variant="outlined"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              InputProps={{
                endAdornment: <IconButton onClick={togglePasswordVisibility}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>,
              }}
              sx={{ marginBottom: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={isLoginLoading}
              sx={{
                backgroundColor: "#3f51b5",
                "&:hover": { backgroundColor: "#303f9f" },
              }}
            >
              {isLoginLoading ? <CircularProgress size={24} /> : "Login"}
            </Button>
            <Link to="#" onClick={toggleForgotPassword} style={{ display: "block", marginTop: 16, textAlign: "center", color: "#3f51b5" }}>
              Forgot password?
            </Link>
            {message && (
              <div
                style={{
                  color: "red",
                  backgroundColor: "#fff",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                {message}
              </div>
            )}
          </form>
        )}
      </div>
    </Box>
  );
};

export default Login;
