import React, { useState } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Logout = ({ collapsed, isDarkMode, onClose }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => setOpenDialog(true);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <Button
        onClick={handleLogoutClick}
        startIcon={<LogoutIcon />}
        fullWidth
        sx={{
          color: isDarkMode ? "#fff" : "#000",
          fontSize: "17px",
          background: "none",
          textAlign: "left",
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <span className="menu-item-label">{!collapsed && "Logout"}</span>
      </Button>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
            padding: 2,
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" color="text.primary" textAlign="center">
            Confirm logout
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Are you sure you want to sign out?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{
              "&:hover": {
                transition: "background-color 0.3s ease",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            color="error"
            sx={{
              "&:hover": {
                transition: "background-color 0.3s ease",
              },
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Logout;
