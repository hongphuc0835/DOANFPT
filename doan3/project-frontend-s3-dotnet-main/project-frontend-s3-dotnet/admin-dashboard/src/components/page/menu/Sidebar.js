import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Drawer, List, Typography, Divider, Collapse, Button, Box, IconButton, Switch } from "@mui/material";
import { Home as HomeIcon, People as PeopleIcon, Menu as MenuIcon, RocketLaunch as RocketLaunchIcon, Web, FlightTakeoff, Assignment } from "@mui/icons-material";
import { ThemeContext } from "./ThemeContext";
import "./Sidebar.css";
import Logout from "./Logout";

const Sidebar = () => {
  const { isDarkMode, setIsDarkMode, collapsed, toggleSidebar } = useContext(ThemeContext);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/users") || location.pathname.startsWith("/adduser") || location.pathname.startsWith("/feedback")) {
      setOpenKeys(["users"]);
    } else if (location.pathname.startsWith("/news") || location.pathname.startsWith("/addnews") || location.pathname.startsWith("/about_us") || location.pathname.startsWith("/add_about") || location.pathname.startsWith("/contact_us") || location.pathname.startsWith("/add_contact")) {
      setOpenKeys(["web"]);
    } else if (location.pathname.startsWith("/tour") || location.pathname.startsWith("/destination") || location.pathname.startsWith("/tourschedule") || location.pathname.startsWith("/hotel") || location.pathname.startsWith("/restaurant")) {
      setOpenKeys(["/tour"]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  const toggleSubMenu = (key) => {
    setOpenKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const menuItems = [
    { key: "/", icon: <HomeIcon />, label: "Overview", link: "/" },
    { key: "/booking", icon: <Assignment />, label: "Booking", link: "/booking" },
    {
      key: "/tour",
      icon: <FlightTakeoff />,
      label: "Tours",
      children: [
        { key: "/tour", label: "Tour List", link: "/tour" },
        { key: "/destination", label: "Destination List", link: "/destination" },
        { key: "/tourschedule", label: "Tour Schedule List", link: "/tourschedule" },

        // { key: "/hotel", label: "Hotel", link: "/hotel" },
        // { key: "/restaurant", label: "Restaurant", link: "/restaurant" },
      ],
    },
    {
      key: "users",
      icon: <PeopleIcon />,
      label: "Users",
      children: [
        { key: "/users", label: "User List", link: "/users" },
        { key: "/feedback", label: "Feedback List", link: "/feedback" },
      ],
    },
    {
      key: "web",
      icon: <Web />,
      label: "Web",
      children: [
        { key: "/news", label: "News", link: "/news" },
        { key: "/about_us", label: "About Us", link: "/about_us" },
        { key: "/contact_us", label: "Contact", link: "/contact_us" },
        { key: "/404", label: "404", link: "*" },
      ],
    },
  ];

  return (
    <Drawer
      variant="permanent"
      open={!collapsed}
      PaperProps={{
        className: isDarkMode ? "dark-mode" : "light-mode",
        style: {
          position: "sticky",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 100,
          width: collapsed ? 80 : 250,
          transition: "width 0.3s ease, background-color 0.3s ease",
        },
      }}
    >
      <Box>
        <div className="sidebar-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottom: isDarkMode ? "1px solid #fff" : "" }}>
          <Typography
            variant="h6"
            component="div"
            className="title"
            style={{
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "transparent", // Make the text itself invisible
              background: "linear-gradient(45deg, #56CCF2, #2F80ED)", // Gradient for light mode
              WebkitBackgroundClip: "text", // Clip the gradient to the text
              WebkitTextFillColor: "transparent", // Ensure the gradient is visible in the text
              transition: "background 0.3s ease", // Smooth transition between modes
            }}
          >
            {!collapsed && (
              <RocketLaunchIcon
                sx={{
                  marginRight: 1,
                  fontSize: "30px",
                  color: "#2F80ED", // Solid color for the icon
                }}
              />
            )}
            {!collapsed && "Karnel"}
          </Typography>

          <IconButton onClick={toggleSidebar}>
            <MenuIcon sx={{ color: isDarkMode ? "#fff" : "#000", fontSize: "30px" }} />
          </IconButton>
        </div>
        <Divider sx={{ marginBottom: 1 }} />
        <List sx={{ paddingTop: 0, borderBottom: isDarkMode ? "1px solid #fff" : "" }}>
          {menuItems.map((item) => (
            <Box key={item.key}>
              <Button
                onClick={item.children ? () => toggleSubMenu(item.key) : () => navigate(item.link)}
                startIcon={item.icon}
                fullWidth
                sx={{
                  textAlign: "left",
                  justifyContent: collapsed ? "center" : "flex-start",
                  paddingLeft: collapsed ? 1 : 4,
                  paddingY: 1.5,
                  backgroundColor: openKeys.includes(item.key)
                    ? isDarkMode
                      ? "#1a3447"
                      : "#f0f0f0" // Darker gray for selected item in dark mode, light gray for light mode
                    : "transparent",

                  color: isDarkMode ? "#fff" : "#000",
                  borderRadius: 2,
                  fontSize: "15px",
                  boxShadow: openKeys.includes(item.key) ? (isDarkMode ? "0px 2px 5px rgba(255, 255, 255, 0.2)" : "0px 2px 5px rgba(0, 0, 0, 0.2)") : "none",
                  "&:hover": {
                    backgroundColor: isDarkMode ? "#1a3447" : "#e0e0e0",
                    transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: isDarkMode ? "0px 2px 8px rgba(255, 255, 255, 0.4)" : "0px 2px 8px rgba(0, 0, 0, 0.4)",
                  },
                }}
              >
                <span className="menu-item-label">{!collapsed && item.label}</span>
              </Button>

              {item.children && (
                <Collapse
                  in={openKeys.includes(item.key)}
                  timeout="auto"
                  unmountOnExit
                  style={{
                    borderLeft: isDarkMode ? "4px solid #444" : "4px solid #ccc",

                    position: collapsed ? "fixed" : "relative",
                    width: collapsed ? "200px" : "auto",
                    zIndex: 1000,
                    backgroundColor: collapsed
                      ? isDarkMode
                        ? "#002b46"
                        : "#f0f0f0" // Darker shade of navy for dark mode, light gray for light mode
                      : isDarkMode
                      ? "#002b46" // A consistent dark navy for expanded state in dark mode
                      : "#ffffff", // White background for expanded state in light mode
                  }}
                >
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <Button
                        key={child.key}
                        onClick={() => navigate(child.link)}
                        sx={{
                          textAlign: "left",
                          justifyContent: collapsed ? "flex-start" : "flex-start",
                          color: isDarkMode ? "#fff" : "#333", // Adjusted text color for better contrast
                          paddingY: 1.5,
                          paddingX: collapsed ? 2 : 4, // More padding when expanded for readability
                          fontSize: "15px",
                          borderRadius: 2, // Softer rounded corners for a modern look
                          width: "100%",
                          backgroundColor: isDarkMode ? "transparent" : "transparent", // Keeping background transparent by default
                          transition: "background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",

                          "&:hover": {
                            backgroundColor: isDarkMode ? "#1a3447" : "#e0e0e0", // Lighter shade of navy or light gray for hover
                            transition: "background-color 0.3s ease, box-shadow 0.3s ease",
                            boxShadow: isDarkMode ? "0px 2px 8px rgba(255, 255, 255, 0.4)" : "0px 2px 8px rgba(0, 0, 0, 0.4)",
                          },
                        }}
                      >
                        <span className="menu-item-label">
                          {" "}
                          {!collapsed && <span style={{ marginRight: 10 }}>{child.icon}</span>} {/* Optional icon next to label */}
                          {child.label}
                        </span>
                      </Button>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>

        <Divider sx={{ marginTop: 1 }} />
        {/* Sidebar Header and Menu Items */}
        <Logout collapsed={collapsed} isDarkMode={isDarkMode} />

        <div className="dark-mode-toggle">
          <Switch
            checked={isDarkMode}
            onChange={() => setIsDarkMode(!isDarkMode)}
            icon={<span style={{ fontSize: "20px" }}>🌞</span>}
            checkedIcon={<span style={{ fontSize: "20px" }}>🌙</span>}
            sx={{
              "& .MuiSwitch-thumb": {
                backgroundColor: isDarkMode ? "#fff" : "#000",
              },
              "& .MuiSwitch-track": {
                backgroundColor: isDarkMode ? "#333" : "#ccc",
              },
            }}
          />
        </div>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
