import React from "react";
import Sidebar from "./Sidebar"; // Sidebar component
import { Outlet } from "react-router-dom"; // Render các component con
import ContentHeader from "./ContentHeader";
import { Box, Typography } from "@mui/material";

const MainLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar /> {/* Sidebar component */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "rgb(233, 237, 247)" }}>
        <ContentHeader />
        <div style={{ flex: 1 }}>
          <Outlet /> {/* Nội dung trang sẽ được render ở đây */}
        </div>
        {/* Footer */}
        <Box sx={{ textAlign: "center", padding: "24px", backgroundColor: "#f5f5f5", mt: 10 }}>
          <Typography variant="body2">© {new Date().getFullYear()} Karnel Company. All Rights Reserved.</Typography>
        </Box>
      </div>
    </div>
  );
};

export default MainLayout;
