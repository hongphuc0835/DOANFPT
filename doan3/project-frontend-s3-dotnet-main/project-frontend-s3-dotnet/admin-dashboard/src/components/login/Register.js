import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, Typography, CircularProgress, Box, Snackbar, Alert } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AdminsService from "../page/admins/AdminsService";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' or 'error'
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegisterLoading(true);
    try {
      await AdminsService.register(email, password, fullName, phone);
      setSnackbarMessage("You have successfully registered. Please check your email for further instructions.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      navigate("/login");
    } catch (error) {
      // Check if error.response?.data is an object, and extract a meaningful string from it
      const errorMessage = typeof error.response?.data === "string" ? error.response?.data : "An error occurred. Please try again.";
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f4f7fc" }}>
      <div className="register-container" style={{ width: 400, padding: 24, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", backgroundColor: "white" }}>
        <form onSubmit={handleRegister}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 600 }}>
            Register
          </Typography>
          <TextField label="Full Name" variant="outlined" fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} required margin="normal" sx={{ marginBottom: 2 }} />
          <TextField label="Email" variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} required margin="normal" sx={{ marginBottom: 2 }} />
          <TextField label="Phone" variant="outlined" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} required margin="normal" sx={{ marginBottom: 2 }} />
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
          <Button variant="contained" color="primary" type="submit" fullWidth disabled={isRegisterLoading} sx={{ backgroundColor: "#3f51b5", "&:hover": { backgroundColor: "#303f9f" } }}>
            {isRegisterLoading ? <CircularProgress size={24} /> : "Register"}
          </Button>
        </form>
      </div>

      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;
