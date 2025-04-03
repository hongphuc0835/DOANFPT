import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, CircularProgress, FormControl, FormControlLabel, Checkbox, Box, Paper, Typography, Alert } from "@mui/material";
import AdminsService from "./AdminsService";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to control password visibility
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setIsLoading(true);

    if (newPassword !== confirmNewPassword) {
      setMessage("New password and confirmation password do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await AdminsService.changePassword(oldPassword, newPassword);
      setMessage("Password changed successfully!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setMessage("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          Fill out the form below to change your password or <Link to="/profileinfo">back</Link>.
        </Typography>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleChangePassword();
          }}
        >
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
  );
};

export default ChangePassword;
