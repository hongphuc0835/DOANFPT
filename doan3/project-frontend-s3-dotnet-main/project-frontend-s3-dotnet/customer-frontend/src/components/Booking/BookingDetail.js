import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Grid, Card, CardMedia, CardContent, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, LinearProgress, Alert, Table, TableBody, TableRow, TableCell, TableContainer, TableHead } from "@mui/material";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

const BookingDetail = () => {
  const { bookingId } = useParams();
  const [bookingDetail, setBookingDetail] = useState(null);

  const [message, setMessage] = useState("");
  const [tours, setTours] = useState([]);
  const [openCancelled, setOpenCancelled] = useState(false);

  useEffect(() => {
    const cachedBooking = localStorage.getItem(`booking-${bookingId}`);
    const cachedTours = localStorage.getItem("tours");

    if (cachedBooking) {
      setBookingDetail(JSON.parse(cachedBooking));
    } else {
      axios
        .get(`http://localhost:5018/api/Booking/${bookingId}`)
        .then((response) => {
          setBookingDetail(response.data);
          localStorage.setItem(`booking-${bookingId}`, JSON.stringify(response.data));
        })
        .catch(() => {
          setMessage("Error fetching booking details.");
        });
    }

    if (cachedTours) {
      setTours(JSON.parse(cachedTours));
    } else {
      axios
        .get(`http://localhost:5089/api/tour/GetAllWithTours`)
        .then((response) => {
          setTours(response.data);
          localStorage.setItem("tours", JSON.stringify(response.data));
        })
        .catch(() => {
          setMessage("Error fetching tours.");
        });
    }
  }, [bookingId]);

  const getTourName = (tourId) => {
    const tour = tours.find((tour) => tour.tour.tourId === tourId);
    return tour ? tour.tour.name : "";
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
      }, 25); // 3s = 3000ms, chia cho 100 step => mỗi step là 30ms

      // Tự động xóa thông báo sau 3 giây
      const timeout = setTimeout(() => {
        setMessage(null); // hoặc setMessage("") tùy thuộc vào cách bạn định nghĩa
        clearInterval(interval); // Xóa interval
      }, 3000);

      // Cleanup interval và timeout nếu component unmount
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [message, setMessage]);

  const handleCancelBooking = () => {
    const updatedBooking = { ...bookingDetail, status: "Cancelled" };
    axios
      .put(`http://localhost:5018/api/Booking/${bookingId}`, updatedBooking)
      .then(() => {
        setBookingDetail(updatedBooking);
        setOpenCancelled(false);
        setMessage("Booking status updated to Cancelled.");
      })
      .catch(() => {
        setOpenCancelled(false);
        setMessage("Failed to update booking status.");
      });
  };

  if (!bookingDetail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <Typography variant="h5">Booking details not available.</Typography>
      </Box>
    );
  }

  return (
    <>
      <section className="bread-crumb">
        <div className="container">
          <ul className="breadcrumb">
            <li className="home">
              <a href="/booking_list" title="Home">
                <span>Booking List</span>
              </a>
              <span className="mr_lr">
                &nbsp;
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="svg-inline--fa fa-chevron-right fa-w-10">
                  <path
                    fill="currentColor"
                    d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                    className=""
                  />
                </svg>
                &nbsp;
              </span>
            </li>
            <li>
              <strong>
                <span>{getTourName(bookingDetail.tourId)}</span>
              </strong>
            </li>
          </ul>
        </div>
      </section>
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
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
            <Grid container spacing={4}>
              {/* Left Column: Tour Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ maxWidth: 500 }}>
                  <CardMedia component="img" height="300" image={getTourImage(bookingDetail.tourId)} alt={getTourName(bookingDetail.tourId)} />
                  <CardContent>
                    <Link
                      to={`/tour/${bookingDetail.tourId}`}
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        textDecoration: "none",
                        color: "inherit", // Avoid link color change on hover
                        "&:hover": { textDecoration: "underline" }, // Underline on hover for better interactivity
                      }}
                    >
                      {getTourName(bookingDetail.tourId)}
                    </Link>
                    <Typography variant="body2" color="textSecondary">
                      {bookingDetail.tourPackage}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ borderLeft: "2px solid #ddd", paddingLeft: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2, color: "#333" }}>
                    Booking Details
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
                        <TableRow>
                          <TableCell>
                            <strong>Departure Date:</strong>
                          </TableCell>
                          <TableCell>{new Date(bookingDetail.departureDate).toLocaleDateString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Adults:</strong>
                          </TableCell>
                          <TableCell>{bookingDetail.adult}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Children:</strong>
                          </TableCell>
                          <TableCell>{bookingDetail.children}</TableCell>
                        </TableRow>

                        {/* Payment Information */}
                        <TableRow>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "#f4f4f4" }}>
                            Payment Information
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Pay By:</strong>
                          </TableCell>
                          <TableCell>{bookingDetail.paymentId === 1 ? "Cash" : bookingDetail.paymentId === 2 ? "Paypal" : "Other"}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Total Price:</strong>
                          </TableCell>
                          <TableCell>${new Intl.NumberFormat().format(bookingDetail.totalPrice)}</TableCell>
                        </TableRow>

                        {/* Booking Status */}
                        <TableRow>
                          <TableCell colSpan={2} sx={{ fontWeight: "bold", backgroundColor: "#f4f4f4" }}>
                            Booking Status
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <strong>Status:</strong>
                          </TableCell>
                          <TableCell>
                            <span
                              style={{
                                fontWeight: "bold",
                                color: bookingDetail.status === "Cancelled" ? "red" : bookingDetail.status === "Pending" ? "orange" : bookingDetail.status === "Pending (Confirmed)" ? "blue" : bookingDetail.status === "Completed" ? "green" : "black",
                              }}
                            >
                              {bookingDetail.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grid>

            {/* Footer Actions */}
            <Box display="flex" justifyContent="space-between" sx={{ marginTop: 4, paddingTop: 2, borderTop: "2px solid #ddd" }}>
              <Button
                variant="contained"
                color="error"
                onClick={() => setOpenCancelled(true)}
                disabled={bookingDetail.status !== "Pending"}
                sx={{
                  width: "15%",
                  borderRadius: "8px",
                  backgroundColor: "#FF3366", // Màu nền mặc định
                  color: "white",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#FF3333", // Màu nền khi hover
                    color: "white",
                    transform: "scale(1.05)",
                  },
                  "&:disabled": {
                    backgroundColor: "lightgray",
                    color: "darkgray",
                  },
                }}
              >
                Cancel Booking
              </Button>
            </Box>
          </Paper>
        )}
        {/* Dialog for cancellation confirmation */}
        <Dialog open={openCancelled} onClose={() => setOpenCancelled(false)} aria-labelledby="cancel-booking-dialog-title" aria-describedby="cancel-booking-dialog-description">
          <DialogTitle id="cancel-booking-dialog-title">Cancel Booking</DialogTitle>
          <DialogContent>
            <DialogContentText id="cancel-booking-dialog-description" style={{ fontStyle: 'italic', opacity: 0.8 }}>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogContentText>
            <DialogContentText style={{ fontStyle: 'italic', opacity: 0.8, fontWeight: 'bold' }}>
              Cancellation Policy:
            </DialogContentText>
            <DialogContentText style={{ fontStyle: 'italic', opacity: 0.8 }}>
              - Cancel 3 days before the tour: Receive 80% refund.
            </DialogContentText>
            <DialogContentText style={{ fontStyle: 'italic', opacity: 0.8 }}>
              - Cancel 2 days before the tour: Receive 50% refund.
            </DialogContentText>
            <DialogContentText style={{ fontStyle: 'italic', opacity: 0.8 }}>
              - Cancel 1 day before the tour: Receive 20% refund.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancelled(false)} color="primary">
              No
            </Button>
            <Button onClick={handleCancelBooking} color="error" autoFocus>
              Yes, Cancel
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
