import React, { useState, useEffect } from "react";
import { Box, Card, CircularProgress, Grid, Typography } from "@mui/material";
import { AttachMoney } from "@mui/icons-material";
import axios from "axios";

const Income = () => {
  const [income, setIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://localhost:5018/api/Booking");
        if (response.data) {
          const today = new Date().toISOString().split("T")[0]; // Lấy ngày hiện tại
          const bookingsToday = response.data.filter((booking) => booking.bookingDate.split("T")[0] === today); // Lọc các booking trong ngày hôm nay
          const totalIncome = bookingsToday.reduce((sum, booking) => sum + booking.totalPrice, 0); // Tính tổng thu nhập
          setIncome(totalIncome); // Cập nhật thu nhập
        } else {
          setError("No booking data available.");
        }
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

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
          <Box
            sx={{
              backgroundColor: "#3BA0FF",
              borderRadius: "50%",
              padding: 2,
              marginRight: 2,
              boxShadow: 3,
            }}
          >
            <AttachMoney sx={{ fontSize: 40, color: "white" }} />
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Today's Income
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
                ${income.toLocaleString()}
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

export default Income;
