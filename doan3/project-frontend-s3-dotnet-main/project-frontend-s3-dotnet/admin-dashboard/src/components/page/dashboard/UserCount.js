import React, { useState, useEffect } from "react";
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";
import { Person } from "@mui/icons-material"; // MUI icon for users
import UsersService from "../users/UsersService";
import { Link } from "react-router-dom";

const UserCount = () => {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hàm lấy danh sách người dùng từ API
    const fetchUsers = async () => {
      try {
        const response = await UsersService.getAllUsers(); // Gọi API

        const users = response; // Lấy dữ liệu trực tiếp từ response
        if (Array.isArray(users) && users.length > 0) {
          setUserCount(users.length); // Cập nhật tổng số người dùng
        } else {
          console.warn("Users data is not an array:", users);
          setError("No users found.");
        }
      } catch (err) {
        console.error("API error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers(); // Gọi hàm fetchUsers
  }, []); // Chỉ chạy một lần khi component được render

  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card
        sx={{
          padding: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "#f5f5f5",
          borderLeft: "5px solid #3BA0FF",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link to="/users" style={{ textDecoration: "none", color: "inherit" }}>
            <Box
              sx={{
                backgroundColor: "#3BA0FF",
                borderRadius: "50%",
                padding: 2,
                marginRight: 2,
                boxShadow: 3,
              }}
            >
              <Person sx={{ fontSize: 40, color: "white" }} />
            </Box>
          </Link>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Total Users
            </Typography>
            {loading ? (
              <Typography variant="body2" color="textSecondary">
                <CircularProgress size={24} color="primary" />
              </Typography>
            ) : error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#3BA0FF" }}>
                {userCount}
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

export default UserCount;
