import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, CircularProgress, Chip, Button, Container, LinearProgress, Alert, Pagination, Select, MenuItem } from "@mui/material";
import { Cancel, CheckCircle, HourglassEmpty, ArrowForward } from "@mui/icons-material";
import { Link } from "react-router-dom";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);

  useEffect(() => {
    const cachedBookings = localStorage.getItem("bookings");
    if (cachedBookings) {
      setBookings(JSON.parse(cachedBookings));
    } else {
      axios
        .get(`http://localhost:5018/api/Booking`)
        .then((response) => {
          const sortedData = response.data.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
          const filteredBookings = sortedData.filter((booking) => booking.email === localStorage.getItem("userEmail"));
          setBookings(filteredBookings);
          localStorage.setItem("bookings", JSON.stringify(filteredBookings));
        })
        .catch(() => {
          setMessage("User is not logged in!");
        });
    }

    const cachedTours = localStorage.getItem("tours");
    if (cachedTours) {
      setTours(JSON.parse(cachedTours));
      setLoading(false);
    } else {
      axios
        .get(`http://localhost:5089/api/tour/GetAllWithTours`)
        .then((response) => {
          setTours(response.data);
          setLoading(false);
          localStorage.setItem("tours", JSON.stringify(response.data));
        })
        .catch(() => {
          setMessage("Error fetching tours.");
          setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (statusFilter) {
      const sortedByStatus = bookings.filter((booking) => booking.status === statusFilter).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      setFilteredBookings(sortedByStatus);
    } else {
      setFilteredBookings(bookings);
    }
  }, [bookings, statusFilter]);

  const getTourName = (tourId) => {
    const tour = tours.find((tour) => tour.tour.tourId === tourId);
    return tour ? tour.tour.name : "Tour not found";
  };

  const getTourImage = (tourId) => {
    const tour = tours.find((tour) => tour.tour.tourId === tourId);
    return tour ? tour.tour.imageUrl.split(";")[0] : "https://via.placeholder.com/150";
  };

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (message) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((oldProgress) => Math.min(oldProgress + 1, 100));
      }, 25);

      const timeout = setTimeout(() => {
        setMessage(null);
        clearInterval(interval);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [message]);

  const [page, setPage] = useState(1);
  const [paginatedBookings, setPaginatedBookings] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedBookings(filteredBookings.slice(startIndex, endIndex));
  }, [filteredBookings, page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
    setPage(1); // Reset to the first page

    const filteredAndSortedBookings = bookings.filter((booking) => newStatus === "" || booking.status === newStatus).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    setFilteredBookings(filteredAndSortedBookings);
  };
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
        Booking List
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Select value={statusFilter} onChange={handleStatusChange} displayEmpty fullWidth>
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading Bookings...
          </Typography>
        </Box>
      ) : (
        <Box>
          {paginatedBookings.map((booking) => (
            <Box
              key={booking.bookingId}
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                mb: 3,
                p: 2,
                boxShadow: 3,
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Box sx={{ flexShrink: 0, mr: 2 }}>
                <img
                  src={getTourImage(booking.tourId)}
                  alt={getTourName(booking.tourId)}
                  style={{
                    width: "268px",
                    height: "150px",
                    borderRadius: "8px",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  component={Link}
                  to={`/tour/${booking.tourId}`}
                  variant="h6"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                    fontWeight: "bold",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {getTourName(booking.tourId)}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Tour Package:</strong> {booking.tourPackage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Total Price:</strong> ${new Intl.NumberFormat().format(booking.totalPrice)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Departure Date:</strong> {new Date(booking.departureDate).toLocaleDateString()}
                </Typography>

                <Chip
                  icon={booking.status === "Completed" ? <CheckCircle /> : booking.status === "Pending" ? <HourglassEmpty /> : booking.status === "Cancelled" ? <Cancel /> : null}
                  label={booking.status}
                  color={booking.status === "Completed" ? "success" : booking.status === "Pending" ? "info" : booking.status === "Cancelled" ? "error" : "default"}
                  size="medium"
                  sx={{ mt: 2 }}
                />
              </Box>
              <Box sx={{ ml: 2 }}>
                <Link to={`/booking_list/${booking.bookingId}`} style={{ textDecoration: "none" }}>
                  <Button variant="contained" color="primary" endIcon={<ArrowForward />}>
                    View Details
                  </Button>
                </Link>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      {/* Pagination*/}
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
        <Pagination count={Math.ceil(bookings.length / itemsPerPage)} page={page} onChange={handlePageChange} color="primary" />
      </Box>
      {/* Message */}
      <>
        <style>
          {`
            @keyframes slideInFromRight {
              0% {
                transform: translateX(100%); /* Start from 100% to the right */
                opacity: 0;
              }
              100% {
                transform: translateX(0); /* End at the original position */
                opacity: 1;
              }
            }
          `}
        </style>
        {message && (
          <Box
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              background: "#1a1a1a",
              opacity: 0.95,
              fontSize: "1rem",
              lineHeight: "1.5em",
              borderRadius: "8px",
              padding: 2,

              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
              animation: "slideInFromRight 0.5s ease-in-out" /* Apply the new animation */,
            }}
            className="alert-box"
          >
            <Alert
              sx={{
                margin: 0,
                fontSize: "1rem",
                background: "transparent",

                textAlign: "center",

                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              severity={message.toLowerCase().includes("error") ? "error" : "success"}
            >
              {message}
            </Alert>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: "6px",
                borderRadius: "8px",
                backgroundColor: "#444",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: message.toLowerCase().includes("error") ? "#f44336" : "#4caf50",
                },
              }}
            />
          </Box>
        )}
      </>
    </Container>
  );
};

export default BookingList;
