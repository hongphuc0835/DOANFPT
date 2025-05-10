import { Typography, Chip, Box, Alert, Pagination, TextField, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, LinearProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { CheckCircle, Cancel, HourglassEmpty, Search, ArrowForward } from "@mui/icons-material";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Booking = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchEmail, setSearchEmail] = useState("");
  const itemsPerPage = 10;
  const [tours, setTours] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleAutoCancelBooking = useCallback(async (bookingId) => {
    if (!bookingId) {
      console.error("Booking ID is undefined or invalid, skipping.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5018/api/Booking/${bookingId}`);
      const booking = response.data;
      if (booking.status === "Pending") {
        const currentDate = new Date();
        const departureDate = new Date(booking.departureDate);
        const oneWeekAfterDeparture = new Date(departureDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        if (currentDate > oneWeekAfterDeparture) {
          booking.status = "Cancelled";
          await axios.put(`http://localhost:5018/api/Booking/${bookingId}`, booking);
        }
      }
    } catch (error) {
      console.error(`Error processing booking ${bookingId}:`, error);
    }
  }, []);

  const fetchAllBookings = useCallback(async () => {
    try {
      const cachedBookings = localStorage.getItem("bookings");

      if (cachedBookings) {
        const today = new Date().toISOString().split("T")[0];
        const bookingsToday = JSON.parse(cachedBookings).filter((booking) => booking.departureDate.split("T")[0] === today);
        const completedBookings = bookingsToday.filter((booking) => booking.status === "Completed");
        const sortedData = completedBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
        setBookings(sortedData);
        setFilteredBookings(sortedData);

        // Auto-cancel process for cached bookings
        for (const booking of sortedData) {
          await handleAutoCancelBooking(booking.bookingId);
        }
      }

      const response = await axios.get("http://localhost:5018/api/Booking");
      const today = new Date().toISOString().split("T")[0]; // Lấy ngày hôm nay
      const bookingsToday = response.data.filter((booking) => booking.departureDate.split("T")[0] === today);
      const completedBookings = bookingsToday.filter((booking) => booking.status === "Completed");
      const sortedData = completedBookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
      const cachedData = cachedBookings ? JSON.parse(cachedBookings) : null;

      if (!cachedData || JSON.stringify(cachedData) !== JSON.stringify(sortedData)) {
        setBookings(sortedData);
        setFilteredBookings(sortedData);
      }

      for (const booking of sortedData) {
        await handleAutoCancelBooking(booking.bookingId);
      }
    } catch (error) {
      const errorMessage = error.response ? `Error ${error.response.status}: ${error.response.data.message || error.response.statusText}` : error.message || "An unexpected error occurred.";
      setMessage(errorMessage);
    }
  }, [handleAutoCancelBooking]);
  useEffect(() => {
    fetchAllBookings();
    fetchAllTours();
  }, [fetchAllBookings]);

  const toggleFilterUpcomingBookings = () => {
    if (isFiltered) {
      setFilteredBookings(bookings);
    } else {
      const today = new Date();
      const upcomingBookings = bookings.filter((booking) => new Date(booking?.departureDate) >= today && booking?.status === "Pending");
      setFilteredBookings(upcomingBookings);
    }
    setIsFiltered(!isFiltered);
  };

  const fetchAllTours = async () => {
    try {
      // Retrieve data from cache
      const cachedTours = localStorage.getItem("tours");

      if (cachedTours) {
        setTours(JSON.parse(cachedTours));
      }
      const response = await axios.get("http://localhost:5089/api/tour/GetAllWithTours");

      setTours(response.data.sort((a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId)));
    } catch (error) {
      const errorMessage = error.response ? `Error ${error.response.status}: ${error.response.data.message || error.response.statusText}` : error.message || "An unexpected error occurred.";
      setMessage(errorMessage);
    }
  };

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (message) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 2, 100);
          return newProgress;
        });
      }, 20);
      const timeout = setTimeout(() => {
        setMessage(null);
        clearInterval(interval);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [message, setMessage]);

  const [searchStatus, setSearchStatus] = useState("");
  const [searchPackage, setSearchPackage] = useState("");
  const [searchDestination, setSearchDestination] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    // Create an array of filters that are not empty
    const filters = [
      { key: "email", value: searchEmail },
      { key: "tourPackage", value: searchPackage },
      { key: "status", value: searchStatus },
      { key: "destination", value: searchDestination },
    ];

    // Filter bookings based on the non-empty filters
    const filteredBookings = bookings.filter((book) => {
      return filters.every(({ key, value }) => {
        if (value) {
          if (key === "destination") {
            return getDestination(book?.tourId).toLowerCase().includes(value.toLowerCase());
          } else {
            return book[key].toLowerCase().includes(value.toLowerCase());
          }
        }
        return true; // If value is empty, skip the filter for that key
      });
    });

    // Filter by date range
    const filteredByDateRange = filteredBookings.filter((book) => {
      const departureDate = new Date(book?.departureDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      return (!start || departureDate >= start) && (!end || departureDate <= end);
    });

    setFilteredBookings(filteredByDateRange);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchEmail, searchPackage, searchStatus, searchDestination, bookings, startDate, endDate]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (date) => {
    return date
      ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
        }).format(new Date(date))
      : "Invalid Date";
  };

  // Function to find the tour name based on tourId
  const getTourName = (tourId) => {
    const tour = tours.find((tour) => tour?.tour?.tourId === tourId);
    return tour ? tour?.tour?.name : "N/A";
  };

  const getDestination = (tourId) => {
    const tour = tours.find((tour) => tour?.tour?.tourId === tourId);
    return tour ? tour?.tour?.destinations?.name : "N/A";
  };

  return (
    <>
      <Box sx={{ padding: 3, marginBottom: 2 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
          Booking Management
        </Typography>

        {/* Search Inputs */}
        <Box display="flex" flexDirection="column" gap={3} component={Paper} padding={3}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h5" sx={{ display: "flex", alignItems: "center" }}>
              <Search sx={{ mr: 1 }} />
              Search
            </Typography>
            <Button onClick={toggleFilterUpcomingBookings}>Filter Upcoming Bookings</Button>
          </Box>
          {/* Filter Section 2 (Date Filters) */}
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            <TextField
              label="Start Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
            />
          </Box>

          {/* Filter Section 1 */}
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={2}>
            {/* Destination Search */}
            <FormControl fullWidth>
              <InputLabel>Search by Destination</InputLabel>
              <Select label="Search by Destination" value={searchDestination} onChange={(e) => setSearchDestination(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {Array.from(new Set(tours.map((tour) => tour?.tour?.destinations?.name))) // Filter unique destinations
                  .map((destinationName, index) => (
                    <MenuItem key={index} value={destinationName}>
                      {destinationName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            {/* Tour Package Search */}
            <FormControl fullWidth>
              <InputLabel>Search by Tour Package</InputLabel>
              <Select label="Search by Tour Package" value={searchPackage} onChange={(e) => setSearchPackage(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Luxury">Luxury</MenuItem>
                <MenuItem value="Vip">Vip</MenuItem>
              </Select>
            </FormControl>

            {/* Status Search */}
            <FormControl fullWidth>
              <InputLabel>Search by Status</InputLabel>
              <Select
                label="Search by Status"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                renderValue={(selected) => {
                  if (selected === "") {
                    return "All";
                  }
                  return selected;
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {/* Email Search */}
          <TextField label="Search by Email" variant="outlined" fullWidth value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
        </Box>

        {/* Display the number of search results */}
        <Typography sx={{ textAlign: "center", mb: 3 }}>
          {filteredBookings.length} {filteredBookings.length === 1 ? "booking" : "bookings"} found
        </Typography>

        <TableContainer component={Paper} fullWidt sx={{ marginTop: 3, borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>ID</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Tour Name</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Destination</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Tour Package</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Departure Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Total</TableCell>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f6f8" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentBookings.map((book) => (
                <TableRow key={book?.bookingId} sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                  <TableCell>{book?.bookingId}</TableCell>

                  <TableCell
                    sx={{
                      maxWidth: 350, // Set the maximum width for the column
                      whiteSpace: "nowrap", // Prevent wrapping of text
                      overflow: "hidden", // Hide overflowed content
                      textOverflow: "ellipsis", // Display ellipsis when content overflows
                    }}
                  >
                    {getTourName(book?.tourId)}
                  </TableCell>

                  <TableCell>{getDestination(book?.tourId)}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200, // Set the maximum width for the column
                      whiteSpace: "nowrap", // Prevent wrapping of text
                      overflow: "hidden", // Hide overflowed content
                      textOverflow: "ellipsis", // Display ellipsis when content overflows
                    }}
                  >
                    {book?.email}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={book?.tourPackage}
                      color={
                        book?.tourPackage === "Basic" ? "default" : book?.tourPackage === "Luxury" ? "secondary" : book?.tourPackage === "Vip" ? "error" : "primary" // mặc định nếu không phải là "Basic", "Luxury", hoặc "Vip"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={book?.status === "Completed" ? <CheckCircle /> : book?.status === "Pending" ? <HourglassEmpty /> : book?.status === "Cancelled" ? <Cancel /> : null}
                      label={book?.status}
                      color={book?.status === "Completed" ? "success" : book?.status === "Pending" ? "info" : "error"}
                      size="small"
                      sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(book?.departureDate)}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: "bold", color: "#2E7D32" }}>${new Intl.NumberFormat("en-US").format(book?.totalPrice).replace(/,/g, ".")}</Typography>
                  </TableCell>
                  <TableCell>
                    <Link to={`/booking/${book?.bookingId}`} style={{ textDecoration: "none" }}>
                      <Button size="medium" color="primary" sx={{ textTransform: "capitalize", borderRadius: 1, boxShadow: 1 }} endIcon={<ArrowForward />}>
                        View Detail
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <Pagination count={Math.ceil(filteredBookings.length / itemsPerPage)} page={currentPage} onChange={handlePageChange} shape="rounded" />
        </Box>
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
    </>
  );
};

export default Booking;
