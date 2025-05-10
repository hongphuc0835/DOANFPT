import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, Menu, MenuItem, Typography, Box, Divider } from "@mui/material";
import { Settings } from "@mui/icons-material";
import "./ContentHeader.css";
import AdminsService from "../admins/AdminsService";
import Logout from "./Logout"; // Import the Logout component

const ContentHeader = () => {
  const [time, setTime] = useState({
    date: new Date().toLocaleDateString(),
  });

  const [adminData, setAdminData] = useState(null);
  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const data = await AdminsService.getAdminData(adminId);
        setAdminData(data);
      } catch (error) {
        console.error(error.message);
        setAdminData(null);
      }
    };

    if (adminId) {
      fetchAdminData();
    }
  }, [adminId]);

  // Update the date every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTime({
        date: new Date().toLocaleDateString(),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Profile Menu using MUI Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div className="content-header">
      {/* Time Display */}
      <Box className="time">
        <Typography variant="body1" style={{ fontSize: "16px" }}>
          📅 System Date: {time.date}
        </Typography>
      </Box>

      {/* Notification and Admin Info */}
      <Box className="header-actions" display="flex" alignItems="center">
        <Link to="/profileinfo" style={{ textDecoration: "none" }}>
          <Typography variant="body1" fontWeight="bold" style={{ fontSize: "16px", color: "#333" }}>
            {adminData?.fullName || "Guest Admin"}
          </Typography>
        </Link>

        {/* Avatar with Popover for menu */}
        <Avatar
          size={48}
          onClick={handleClick}
          sx={{
            backgroundColor: "#87d068",
            cursor: "pointer",
            marginRight: "10px",
          }}
          src={adminData?.avatar || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/800px-Flag_of_Vietnam.svg.png"}
        />

        {/* Menu for Profile Options */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleClose} component={Link} to="/profileinfo" style={{ fontSize: "17px", background: "none", textAlign: "left" }}>
            <Settings sx={{ marginRight: 1 }} /> View Profile
          </MenuItem>
          <Divider />
          <MenuItem style={{ background: "none" }}>
            <Logout /> {/* Use the Logout component directly */}
          </MenuItem>
        </Menu>
      </Box>
    </div>
  );
};

export default ContentHeader;
