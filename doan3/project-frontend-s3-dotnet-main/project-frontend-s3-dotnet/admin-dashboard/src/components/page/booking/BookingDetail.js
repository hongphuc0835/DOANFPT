import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowBack, AttachMoney, Cancel, CheckCircle, Edit, HourglassEmpty } from "@mui/icons-material";
import BookingText from "./BookingText";
import { format } from "date-fns";

const BookingDetail = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [bookingDetail, setBookingDetail] = useState(null);
  const [message, setMessage] = useState("");
  const [tours, setTours] = useState([]);
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllPayments();
    const cachedBooking = localStorage.getItem("bookings");
    const cachedTours = localStorage.getItem("tours");

    if (cachedBooking) {
      setBookingDetail(JSON.parse(cachedBooking));
    }
    axios
      .get(`http://localhost:5018/api/Booking/${bookingId}`)
      .then((response) => {
        const cachedData = cachedBooking ? JSON.parse(cachedBooking) : null;

        if (!cachedData || JSON.stringify(cachedData) !== JSON.stringify(response.data)) {
          const bookings = cachedData || [];
          const updatedBookings = bookings.map((booking) => (booking.id === bookingId ? { ...booking, ...response.data } : booking));

          localStorage.setItem("bookings", JSON.stringify(updatedBookings));
          setBookingDetail(response.data);
        }
      })

      .catch(() => {
        setMessage("Error fetching booking details.");
      });

    if (cachedTours) {
      setTours(JSON.parse(cachedTours));
    }
    axios
      .get(`http://localhost:5089/api/tour/GetAllWithTours`)
      .then((response) => {
        // Compare with cached data
        const cachedData = cachedTours ? JSON.parse(cachedTours) : null;

        if (
          !cachedData || // If there is no cached data
          JSON.stringify(cachedData) !== JSON.stringify(response.data) // Or the data has changed
        ) {
          const sortedTours = response.data.sort((a, b) => new Date(b.tour.createdAt) - new Date(a.tour.createdAt));
          // Save the new data to the cache
          localStorage.setItem("tours", JSON.stringify(sortedTours));
          setTours(response.data);
        }
      })
      .catch(() => {
        setMessage("Error fetching tours.");
      });
  }, [bookingId]);

  const getTourName = (tourId) => {
    const tour = tours.find((tour) => tour.tour.tourId === tourId);
    return tour ? tour.tour.name : "";
  };
  const getDestination = (tourId) => {
    const tour = tours.find((tour) => tour.tour.tourId === tourId);
    return tour ? tour.tour.destinations.name : "N/A";
  };

  const getTourImage = (tourId) => {
    const tour = tours.find((tour) => tour.tour.tourId === tourId);
    if (tour) {
      const imageUrl = tour.tour.imageUrl.split(";")[0];
      return imageUrl;
    } else {
      return "https://via.placeholder.com/500";
    }
  };

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (message) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 1, 100);
          return newProgress;
        });
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
  }, [message, setMessage]);

  const paymentMethods = {
    1: "Cash Payment",
    2: "Pay by PayPal",
  };

  const [pay, setPay] = useState([]);

  const getPay = (bookingId) => {
    const pays = pay.find((pay) => parseInt(pay?.bookingId) === parseInt(bookingId));
    return pays?.status;
  };
  const getRefund = (bookingId) => {
    const pays = pay.find((pay) => parseInt(pay?.bookingId) === parseInt(bookingId));
    return pays?.refundAmount;
  };

  const fetchAllPayments = async () => {
    try {
      // Retrieve data from cache
      const cachedPayments = localStorage.getItem("payments");

      if (cachedPayments) {
        setPay(JSON.parse(cachedPayments));
      }

      // Send request to the server to check for new data
      const response = await axios.get("http://localhost:5239/api/paypal/payments");

      // Compare with cached data
      const cachedData = cachedPayments ? JSON.parse(cachedPayments) : null;

      if (
        !cachedData || // If there is no cached data
        JSON.stringify(cachedData) !== JSON.stringify(response.data) // Or the data has changed
      ) {
        // Save the new data to the cache
        localStorage.setItem("payments", JSON.stringify(response.data));
        setPay(response.data);
      }
    } catch (error) {
      const errorMessage = error.response ? `Error ${error.response.status}: ${error.response.data.message || error.response.statusText}` : error.message || "An unexpected error occurred.";
      setMessage(errorMessage);
    }
  };

  // Handle refund
  const handleRefund = async () => {
    setLoading(true);
    if (!bookingId || !refundAmount) {
      setMessage("Please provide both Booking ID and Refund Amount.");
      return;
    }

    try {
      const payment = pay.find((payment) => parseInt(payment?.bookingId) === parseInt(bookingId));

      if (!payment) {
        setMessage("No payment found for the provided Booking ID.");
        return;
      }

      await axios.post(`http://localhost:5239/api/paypal/refund/${payment.payPalOrderId}`, {
        RefundAmount: refundAmount,
      });

      setMessage("Refund successful.");
      fetchAllPayments(); // Refresh payment data
      setOpen(false);
    } catch (error) {
      setMessage("Error Refund");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  // Mở form edit booking
  const handleEditClick = () => {
    if (bookingDetail?.status === "Completed") {
      // Show a message or handle the case when editing is not allowed
      setMessage("Editing is not allowed for completed bookings.");
      return;
    }

    // Set the selected booking and open the edit dialog
    setSelectedBooking(bookingDetail);
    setOpenEditDialog(true);
  };

  // Close Edit Dialog
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedBooking(null);
  };

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  // Open confirmation dialog
  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  // Close confirmation dialog
  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleUpdateBooking = async () => {
    try {
      // Update the booking
      await axios.put(`http://localhost:5018/api/Booking/${selectedBooking.bookingId}`, selectedBooking);

      setMessage("Booking updated successfully");

      // Fetch updated booking details
      const response = await axios.get(`http://localhost:5018/api/Booking/${selectedBooking.bookingId}`);
      setBookingDetail(response.data);

      // Call the auto-cancel function if needed
      await handleAutoCancelBooking(selectedBooking.bookingId);

      // Close the dialogs
      handleCloseEditDialog();
      handleCloseConfirmDialog();
      navigate(0);
    } catch (error) {
      setMessage("Error updating booking");
      handleCloseConfirmDialog();
    }
  };

  const handleAutoCancelBooking = async (bookingId) => {
    try {
      // Fetch booking details from the API
      const response = await axios.get(`http://localhost:5018/api/Booking/${bookingId}`);
      const booking = response.data;

      // Check the status and time
      if (booking.status === "Pending") {
        const currentDate = new Date();
        const departureDate = new Date(booking.departureDate);
        const oneWeekAfterDeparture = new Date(departureDate.getTime() + 7 * 24 * 60 * 60 * 1000); // Add 1 week

        if (currentDate > oneWeekAfterDeparture) {
          // If more than 1 week has passed and the status is still Pending -> Update the status to Cancelled
          booking.status = "Cancelled";

          await axios.put(`http://localhost:5018/api/Booking/${bookingId}`, booking);
          console.log(`Booking ${bookingId} has been auto-cancelled.`);
        }
      }
    } catch (error) {
      console.error("Error during auto-cancel process:", error);
    }
  };

  const [formattedDate, setFormattedDate] = useState("");

  // Format the date when the component is loaded or selectedBooking changes
  useEffect(() => {
    if (selectedBooking?.departureDate) {
      setFormattedDate(format(new Date(selectedBooking.departureDate), "yyyy-MM-dd")); // Use 'yyyy-MM-dd' for input type="date"
    }
  }, [selectedBooking?.departureDate]);

  const handleDateChange = (event) => {
    const dateValue = event.target.value;
    setFormattedDate(dateValue); // Set formatted date for input display
    handleInputChange({ target: { name: "departureDate", value: new Date(dateValue) } }); // Pass new Date to handleInputChange
  };

  // Handle Checkbox Change (status change)
  const handleCheckboxChange = (e) => {
    const { checked } = e.target;

    // Update status based on checkbox state, but only if status is not "Completed"
    if (selectedBooking?.status !== "Completed") {
      setSelectedBooking({
        ...selectedBooking,
        status: checked ? "Completed" : "Pending", // Set the status to "Completed" or "Pending" based on the checkbox
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Check if the 'adult' field is being updated
    if (name === "adult") {
      // Get the current tourSchedule based on the selected tourPackage (tourScheduleId)
      const selectedTourSchedule = tours
        .filter((tour) => tour.tour?.tourId === selectedBooking?.tourId) // Filter by selected tourId
        .flatMap((tour) => tour.tourSchedules)
        .find((schedule) => schedule.name === selectedBooking?.tourPackage);

      const packagePrice = selectedTourSchedule?.packagePrice; // Get the packagePrice of the selected tourSchedule
      const newAdultCount = parseInt(value, 10); // Parse the new adult count from the input value
      // Calculate the new totalPrice
      const newTotalPrice = newAdultCount * packagePrice;

      // Update the selectedBooking with the new adult count and total price
      setSelectedBooking({
        ...selectedBooking,
        [name]: value,
        totalPrice: newTotalPrice, // Update total price
      });
    } else {
      // For other fields, just update as normal
      setSelectedBooking({
        ...selectedBooking,
        [name]: value,
      });
    }
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box m={3}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            marginBottom: "20px",
            color: " #0b5da7;",
            textAlign: "center",
            fontSize: "1.7rem",
            letterSpacing: "0.3px",
            lineHeight: "1",
            textTransform: "uppercase",
          }}
        >
          Booking Invoice
        </Typography>

        {bookingDetail && (
          <Paper
            elevation={4}
            sx={{
              padding: 4,
              backgroundColor: "#fff",
              borderRadius: "12px", // Slightly more rounded edges for modern feel
              boxShadow: "0 6px 8px rgba(0,0,0,0.12)", // Softer, more diffused shadow
            }}
          >
            <Grid container>
              {/* Left Column: Tour Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ maxWidth: 500 }}>
                  <CardMedia component="img" height="300" image={getTourImage(bookingDetail?.tourId)} alt={getTourName(bookingDetail?.tourId)} />
                  <CardContent>
                    <Link
                      to={`/tour/${bookingDetail?.tourId}`}
                      variant="h5"
                      sx={{
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      <Typography variant="body2" sx={{ textDecoration: "none" }}>
                        {getTourName(bookingDetail?.tourId)}
                      </Typography>
                    </Link>
                    <Typography variant="body2" color="textSecondary">
                      {bookingDetail?.tourPackage}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ borderLeft: "2px solid #ddd", paddingLeft: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2, color: "#333" }}>
                    Booking Details : #{bookingDetail?.bookingId}
                  </Typography>

                  {/* Bảng đẹp hơn */}
                  <TableContainer sx={{ marginBottom: 3 }}>
                    <Table aria-label="Booking Details">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f4f4" }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f4f4f4" }}>Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Booking Status */}
                        <TableRow>
                          <TableCell>
                            <strong>Booking Status:</strong>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={bookingDetail?.status === "Completed" ? <CheckCircle /> : bookingDetail?.status === "Pending" ? <HourglassEmpty /> : bookingDetail?.status === "Pending (Confirmed)" ? <HourglassEmpty /> : bookingDetail?.status === "Cancelled" ? <Cancel /> : null}
                              label={bookingDetail?.status}
                              color={bookingDetail?.status === "Completed" ? "success" : bookingDetail?.status === "Pending" ? "info" : bookingDetail?.status === "Cancelled" ? "error" : "default"}
                              size="small"
                              sx={{
                                marginRight: 1,
                                fontWeight: "bold",
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Destination:</strong>
                          </TableCell>
                          <TableCell>{getDestination(bookingDetail?.tourId)}</TableCell>
                        </TableRow>{" "}
                        <TableRow>
                          <TableCell>
                            <strong>Departure Date:</strong>
                          </TableCell>
                          <TableCell>{new Date(bookingDetail?.departureDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Booking Date:</strong>
                          </TableCell>
                          <TableCell>{new Date(bookingDetail?.bookingDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Email:</strong>
                          </TableCell>
                          <TableCell>{bookingDetail?.email}</TableCell>
                        </TableRow>{" "}
                        <TableRow>
                          <TableCell>
                            <strong>Phone:</strong>
                          </TableCell>
                          <TableCell>{bookingDetail?.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Adults:</strong>
                          </TableCell>
                          <TableCell>{bookingDetail?.adult}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Children:</strong>
                          </TableCell>
                          <TableCell>{bookingDetail?.children}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Note:</strong>
                          </TableCell>
                          <TableCell>
                            <BookingText text={bookingDetail?.text} />
                          </TableCell>
                        </TableRow>
                        {/* Payment Information */}
                        <TableRow>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "#f4f4f4" }}>
                            Payment Information
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Payment Method:</strong>
                          </TableCell>
                          <TableCell>{paymentMethods[bookingDetail?.paymentId] || "Unknown Payment Method"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Payment Status:</strong>
                          </TableCell>
                          <TableCell>
                            {getPay(bookingDetail?.bookingId)}
                            {bookingDetail?.status !== "Completed" && (
                              <Button variant="outlined" size="large" color="primary" onClick={handleOpen} sx={{ ml: 2 }}>
                                Refund
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Refund Amount:</strong>
                          </TableCell>
                          <TableCell>$ {getRefund(bookingDetail?.bookingId)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
                              Total Price:
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
                              ${new Intl.NumberFormat().format(bookingDetail?.totalPrice)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grid>

            {/* Footer Actions */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                marginTop: 4,
                paddingTop: 2,
                borderTop: "2px solid #ddd",
              }}
            >
              {/* Return Button */}
              <Link to="/booking" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  size="large"
                  color="error"
                  startIcon={<ArrowBack />} // Add icon before text
                >
                  Return
                </Button>
              </Link>

              {/* Edit Button */}
              <Button
                variant="contained"
                size="large"
                color="primary"
                endIcon={<Edit />} // Add icon before text
                onClick={() => handleEditClick(bookingDetail?.bookingId)}
              >
                Edit
              </Button>
            </Box>
          </Paper>
        )}
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogContent>
            {/* Phone */}
            <TextField label="Phone" name="phone" fullWidth value={selectedBooking?.phone || ""} onChange={handleInputChange} sx={{ marginBottom: 2, mt: 2 }} />

            {/* Tour Package Dropdown */}
            <FormControl fullWidth sx={{ marginBottom: 2 }}>
              <InputLabel>Tour Package</InputLabel>
              <Select label="Tour Package" name="tourPackage" value={selectedBooking?.tourPackage || ""} onChange={handleInputChange}>
                {tours
                  .filter((tour) => tour.tour?.tourId === selectedBooking?.tourId) // Filter by selected tourId
                  .flatMap((tour) => tour.tourSchedules) // Flatten the tourSchedules array for the selected tour
                  .filter(
                    (schedule, index, self) => index === self.findIndex((t) => t.name === schedule.name) // Ensure unique names
                  )
                  .map((schedule) => (
                    <MenuItem key={schedule.tourScheduleId} value={schedule?.name}>
                      {schedule?.name} - ${schedule?.packagePrice}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* Departure Date */}
            <TextField
              label="Departure Date"
              name="departureDate"
              type="date"
              fullWidth
              value={formattedDate}
              onChange={handleDateChange}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ marginBottom: 2 }}
            />

            {/* Adult */}
            <TextField label="Adult" name="adult" type="number" fullWidth inputProps={{ min: 0 }} value={selectedBooking?.adult || ""} onChange={handleInputChange} sx={{ marginBottom: 2 }} />

            {/* Children */}
            <TextField label="Children" name="children" type="number" inputProps={{ min: 0 }} fullWidth value={selectedBooking?.children || ""} onChange={handleInputChange} sx={{ marginBottom: 2 }} />
            {/* Show checkbox and disable it if status is "Completed" */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedBooking?.status === "Completed"} // Check if status is "Completed"
                  onChange={handleCheckboxChange}
                  color="primary"
                  disabled={selectedBooking?.status === "Completed" || selectedBooking?.status === "Cancelled"} // Disable checkbox if status is "Completed"
                />
              }
              label="Completed"
            />
            <Divider sx={{ marginTop: 2, marginBottom: 2 }} />

            {/* Total Price */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachMoney sx={{ fontSize: 20 }} />
              <Typography variant="body1" sx={{ fontWeight: "bold", color: "#2E7D32" }} onChange={handleInputChange}>
                Total Price: $ {new Intl.NumberFormat("en-US").format(selectedBooking?.totalPrice || "").replace(/,/g, ".")}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleOpenConfirmDialog} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
        {/* Confirmation Dialog */}
        <Dialog open={openConfirmDialog} onClose={handleCloseConfirmDialog}>
          <DialogTitle>Confirm Update</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to update this booking?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmDialog} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleUpdateBooking} color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        {/* Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Refund Amount</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Enter Refund Amount" type="text" fullWidth value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleRefund} color="primary" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : "Refund"}
            </Button>
          </DialogActions>
        </Dialog>
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
      </Box>
    </>
  );
};

export default BookingDetail;
