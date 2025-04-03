import React, { useState, useEffect } from "react";
import { Box, Card, Grid, Typography, CircularProgress } from "@mui/material";
import { ShowChart } from "@mui/icons-material";
import axios from "axios";
import { Link } from "react-router-dom";

const BookingComplete = () => {
  const [bookingCompletion, setBookingCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookingCompletion = async () => {
      try {
        // Gọi API để lấy danh sách bookings
        const response = await axios.get("http://localhost:5018/api/Booking");

        if (response.data) {
          const today = new Date().toISOString().split("T")[0];
          const bookingsToday = response.data.filter((booking) => booking.departureDate.split("T")[0] === today);
          const bookings = bookingsToday;
          const totalBookings = bookings.length;
          const completedBookings = bookings.filter((booking) => booking.status === "Completed").length;

          if (totalBookings > 0) {
            const completionRate = ((completedBookings / totalBookings) * 100).toFixed(2);
            setBookingCompletion(completionRate);
          } else {
            setError("");
          }
        } else {
          setError("");
        }
      } catch (err) {
        console.error("Error fetching booking data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingCompletion(); // Gọi hàm fetchBookingCompletion
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
            <Link to="/booking_completed">
              <ShowChart sx={{ fontSize: 40, color: "white" }} />
            </Link>
          </Box>
          <Box>
            <Typography variant="body2" color="textSecondary">
              Booking Completed (%)
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={24} color="primary" />
              </Box>
            ) : error ? (
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            ) : (
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "#3BA0FF" }}>
                {bookingCompletion}%
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    </Grid>
  );
};

export default BookingComplete;
