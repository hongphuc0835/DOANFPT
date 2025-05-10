import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Button, CircularProgress, FormControl, FormControlLabel, Checkbox, Box, Paper, Typography, Alert } from "@mui/material";
import "./ChangePassword.css";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Check if new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      setMessage("New password and confirm password do not match.");
      setIsLoading(false);
      return;
    }

    // Check if new password is the same as old password
    if (oldPassword === newPassword) {
      setMessage("New password cannot be the same as old password.");

      return;
    }

    try {
      const userEmail = localStorage.getItem("userEmail");
      const token = localStorage.getItem("token");

      // If email or token is not found in localStorage
      if (!userEmail || !token) {
        alert("You need to log in again to change your password.");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      // Send request to change password to API
      const response = await axios.post(
        "http://localhost:5119/api/user/change-password",
        {
          email: userEmail,
          oldPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle API response
      if (response.data && response.data.Message) {
        setMessage(response.data.Message);
      } else {
        setMessage("You have successfully changed your password!");
      }

      // Clear user information from localStorage and navigate
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      // Handle error
      if (error.response && error.response.data && error.response.data.Message) {
        setMessage(error.response.data.Message);
      } else {
        setMessage("Password change failed. Please check your information!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="change-password-wrapper">
      <Box display="flex" justifyContent="center">
        <Paper
          elevation={4}
          sx={{
            padding: 4,
            width: "50%",
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: "white",
          }}
        >
          <Typography variant="h5" align="center" marginBottom={3}>
            Change Password
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2, color: "#757575" }}>
            Fill out the form below to change your password or <Link to="/userprofile">back</Link>.
          </Typography>
          <form onSubmit={handleChangePassword}>
            <FormControl fullWidth margin="normal">
              <TextField label="Old Password" type={showPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required fullWidth variant="outlined" margin="dense" InputLabelProps={{ shrink: true }} />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField label="New Password" type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required fullWidth variant="outlined" margin="dense" InputLabelProps={{ shrink: true }} />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <TextField label="Confirm New Password" type={showPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required fullWidth variant="outlined" margin="dense" InputLabelProps={{ shrink: true }} />
            </FormControl>

            <FormControl fullWidth margin="normal">
              <Box display="flex" justifyContent="center">
                <FormControlLabel control={<Checkbox checked={showPassword} onChange={() => setShowPassword(!showPassword)} />} label="Show Password" />
              </Box>
            </FormControl>

            <Box marginTop={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={isLoading}
                sx={{
                  padding: "10px",
                  textTransform: "none",
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Change Password"}
              </Button>
            </Box>
          </form>

          {message && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>
            </Box>
          )}
        </Paper>
      </Box>
    </div>
  );
};

export default ChangePassword;
