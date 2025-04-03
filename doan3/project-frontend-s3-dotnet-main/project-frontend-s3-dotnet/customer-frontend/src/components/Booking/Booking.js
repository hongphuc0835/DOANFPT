import React, { useState, useEffect } from "react";

import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "react-quill/dist/quill.snow.css";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextareaAutosize,
  FormGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { Payment, AssignmentInd, CheckCircle } from "@mui/icons-material";
import TrendingFlat from "@mui/icons-material/TrendingFlat";

import "./booking.css";

const BookingPage = () => {
  const location = useLocation();
  const selectedData = location.state;
  const [showButtons, setShowButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

  const [formData, setFormData] = useState({
    tourId: "",
    tourName: "",
    adult: "",
    children: "",
    tourPackage: "",
    packagePrice: 0,
    departureDate: "",
    bookingDate: new Date().toISOString(),
    phone: "",
    paymentId: "",
    text: "",
    email: "",
    status: "Pending",
    totalPrice: 0,
    scheduleDescription: "",
  });
  console.log(formData);

  const [statusMessage, setStatusMessage] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const styles = {
    title: {
      fontSize: "23px",
      fontWeight: "500",
      color: "#2C3E50",
      textAlign: "center",
      marginBottom: "20px",
      fontFamily: "'Roboto', sans-serif",
      letterSpacing: "1px",
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (selectedData) {
      setFormData((prev) => ({
        ...prev,
        tourId: selectedData.tourId || "",
        adult: selectedData.adult || "",
        children: Math.min(selectedData.children || 0, 5),
        tourPackage: selectedData.tourPackage || "",
        departureDate: selectedData.departureDate || "",
        totalPrice: selectedData.totalPrice || 0,
        scheduleDescription: selectedData.scheduleDescription || "",
        tourPrice:
          selectedData.tourPrice ||
          selectedData.selectedSchedule?.packagePrice ||
          0,
        tourName: selectedData.tourName || "",
      }));
    }
  }, [selectedData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setIsLoading(true); // Bật trạng thái loading khi bắt đầu submit

    try {
      console.log(formData);
      const response = await axios.post(
        "http://localhost:5018/api/Booking/create",
        formData
      );

      if (
        response.data &&
        response.data.booking &&
        response.data.booking.bookingId
      ) {
        setBookingId(response.data.booking.bookingId);
        // setStatusMessage("Booking created successfully!");
      } else {
        setStatusMessage("Invalid booking information.");
      }
    } catch (error) {
      if (error.response) {
        setStatusMessage(`Error: ${error.response.data}`);
      } else {
        setStatusMessage("An unexpected error occurred.");
      }
    }
  };

  useEffect(() => {
    const fetchAuthToken = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5239/api/paypal/auth"
        );
        setAuthToken(response.data.authToken);
      } catch (error) {
        setStatusMessage("Không thể lấy token PayPal.");
      }
    };
    fetchAuthToken();
  }, []);

  // console.log(authToken);

  // console.log(bookingId);
  // console.log(selectedData.totalPrice);
  const createOrder = async () => {
    if (!authToken) {
      setStatusMessage("Missing booking details or auth token.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5239/api/paypal/create-order",
        {},
        {
          params: {
            value: selectedData.totalPrice,
            currency: "USD",
            reference: bookingId,
          },
          headers: {
            Authorization: `Basic ${authToken}`,
          },
        }
      );

      if (response.data && response.data.orderId) {
        return response.data.orderId;
      } else {
        throw new Error("OrderId không có trong phản hồi từ PayPal");
      }
    } catch (error) {
      if (error.response) {
        // // Lỗi từ phản hồi của API
        // console.error("Error response:", error.response.data);
        setStatusMessage(`Error: ${error.response.data}`);
      } else if (error.request) {
        // // Lỗi do yêu cầu không nhận được phản hồi
        // console.error("Error request:", error.request);
        setStatusMessage("Không nhận được phản hồi từ server.");
      } else {
        // // Lỗi khác
        // console.error("Unexpected error:", error);
        setStatusMessage("Lỗi tạo đơn hàng PayPal.");
      }
    }
  };

  const captureOrder = async (orderId) => {
    if (!authToken || !orderId) {
      setStatusMessage("Thiếu token PayPal hoặc orderId.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5239/api/paypal/capture-order",
        {},
        {
          params: { orderId },
          headers: {
            Authorization: `Basic ${authToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      setStatusMessage("Không thể xác nhận đơn hàng PayPal.");
    }
  };
  // Hiển thị giao diện thanh toán PayPal khi đã có bookingId và bookingDetails
  if (bookingId && authToken) {
    return (
      <PayPalScriptProvider
        options={{
          "client-id":
            "AZqx79lpZNKRMv1VJTUMR6LhOS9ThSfyQbbHrJfMue2cQ4twIOYwVgmAQA70ypCA11Ty-WlxdUr4HKd1",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            padding: 2,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* Book Tour */}
          <Typography
            variant="h4"
            sx={{
              marginBottom: 2,
              fontWeight: "bold",
              color: "#1976d2",
              fontSize: "32px",
              marginLeft: "30px",
            }}
          >
            Booking Tour
          </Typography>

          {/* 3 Icons with arrows */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 3,
              marginBottom: 3,
              marginTop: 3,
            }}
          >
            {/* Left Icon */}
            <Box sx={{ textAlign: "center" }}>
              <AssignmentInd sx={{ fontSize: 60, color: "#0b5da7" }} />
              <Typography
                variant="body1"
                sx={{
                  marginTop: 1,
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#0b5da7",
                }}
              >
                Enter Information
              </Typography>
            </Box>

            {/* Arrow Icon 1 */}
            <TrendingFlat
              sx={{
                fontSize: 80,
                color: "#0b5da7",
                alignSelf: "center",
                marginTop: -3,
              }}
            />

            {/* Middle Icon */}
            <Box sx={{ textAlign: "center" }}>
              <Payment
                sx={{
                  fontSize: 60,
                  color:
                    statusMessage && statusMessage.includes("success")
                      ? "#0b5da7"
                      : "#0b5da7",
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  marginTop: 1,
                  fontSize: "16px",
                  fontWeight: "500",
                  color:
                    statusMessage && statusMessage.includes("success")
                      ? "#0b5da7"
                      : "#0b5da7",
                }}
              >
                Payment
              </Typography>
            </Box>

            {/* Arrow Icon */}
            <TrendingFlat
              sx={{
                fontSize: 80,
                marginTop: -3,
                color:
                  statusMessage && statusMessage.includes("success")
                    ? "#0b5da7"
                    : "#0b5da7",
                alignSelf: "center",
              }}
            />

            {/* Right Icon */}
            <Box sx={{ textAlign: "center" }}>
              <CheckCircle
                sx={{
                  fontSize: 60,
                  color:
                    statusMessage && statusMessage.includes("success")
                      ? "#0b5da7"
                      : "#b1b1b1",
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  marginTop: 1,
                  fontSize: "16px",
                  fontWeight: "500",
                  color:
                    statusMessage && statusMessage.includes("success")
                      ? "#0b5da7"
                      : "#b1b1b1",
                }}
              >
                Completed
              </Typography>
            </Box>
          </Box>

          {/* Payment Section */}
          <Typography
            variant="h5"
            sx={{
              marginBottom: 2,
              fontWeight: "600",
              color: "#0b5da7",
              fontSize: "24px",
            }}
          >
            Payment for booking tour
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#333",
              fontSize: "20px",
              fontWeight: "500",
            }}
          >
            Total Price: <strong>${selectedData.totalPrice}</strong>
          </Typography>

          {statusMessage && (
            <Typography
              sx={{
                color: statusMessage.includes("success")
                  ? "#4CAF50"
                  : "#f44336",
                fontSize: "16px",
                fontWeight: "500",
                marginTop: 2,
              }}
            >
              {statusMessage}
            </Typography>
          )}

          {/* Display PayPal Buttons only when payment is not successful */}
          {!showButtons && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: 3,
                "& > div": {
                  width: "300px", // Set fixed width for the button
                },
              }}
            >
              <PayPalButtons
                createOrder={createOrder}
                onApprove={async (data, actions) => {
                  try {
                    const captureData = await captureOrder(data.orderID);
                    if (captureData.status === "PAID") {
                      setStatusMessage(
                        "Payment successful! Thank you! . Please log in with the account we sent to your gmail to view the orders you have placed"
                      );
                      setShowButtons(true); // Show success message and buttons after payment
                    } else {
                      setStatusMessage(
                        "Payment unsuccessful. Please try again."
                      );
                    }
                  } catch (error) {
                    setStatusMessage("An error occurred during payment.");
                  }
                }}
                onError={(err) => {
                  setStatusMessage(
                    "Unable to confirm the order. Please try again."
                  );
                }}
              />
            </Box>
          )}

          {/* Show buttons after successful payment */}
          {showButtons && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2,
                marginTop: 4,
              }}
            >
              <Link to={`/`} style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                >
                  Back to Home
                </Button>
              </Link>
              {/* Button to navigate to Booking Detail */}
              <Link
                to={`/booking_list/${bookingId}`}
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                >
                  View Details
                </Button>
              </Link>
            </Box>
          )}

          <Typography
            sx={{
              fontSize: "14px",
              marginTop: 2,
              fontWeight: "300", // Lighten the text
              opacity: 0.7, // Slightly faded
              color: "#555", // Light gray text color
            }}
          >
            If you have any questions, feel free to contact us. We are always
            here to assist you!
          </Typography>
        </Box>
      </PayPalScriptProvider>
    );
  }

  return (
    <div>
      <section className="bread-crumb">
        <div className="container">
          <ul className="breadcrumb">
            <li className="home">
              <a href="tour/:tourId" title="tour/:tourId">
                <span>{selectedData.tourPackage}</span>
              </a>
              <span className="mr_lr">
                &nbsp;
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="chevron-right"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                  className="svg-inline--fa fa-chevron-right fa-w-10"
                >
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
                <span>Booking</span>
              </strong>
            </li>
          </ul>
        </div>
      </section>
      <Box
        sx={{
          textAlign: "center",
          padding: 2,
          fontFamily: "Arial, sans-serif",
        }}
      >
        {/* Đặt Tour */}
        <Typography
          variant="h4"
          sx={{
            marginBottom: 2,
            marginTop: 3,
            fontWeight: "bold",
            color: "#0b5da7",
            fontSize: "32px",
            marginLeft: "30px",
          }}
        >
          Booking Tour
        </Typography>

        {/* 3 Icon với mũi tên */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            marginBottom: 3,
          }}
        >
          {/* Icon bên trái */}
          <Box sx={{ textAlign: "center" }}>
            <AssignmentInd sx={{ fontSize: 60, color: "#0b5da7" }} />
            <Typography
              variant="body1"
              sx={{
                marginTop: 1,
                fontSize: "16px",
                fontWeight: "500",
                color: "#0b5da7",
              }}
            >
              Enter information
            </Typography>
          </Box>

          {/* Icon mũi tên */}
          <TrendingFlat
            sx={{
              fontSize: 80,
              color: "#0b5da7",
              alignSelf: "center",
              marginTop: -3,
            }}
          />

          {/* Icon giữa */}
          <Box sx={{ textAlign: "center" }}>
            <Payment sx={{ fontSize: 60, color: "#b1b1b1" }} />
            <Typography
              variant="body1"
              sx={{
                marginTop: 1,
                fontSize: "16px",
                fontWeight: "500",
                color: "#b1b1b1",
              }}
            >
              Pay
            </Typography>
          </Box>

          {/* Icon mũi tên */}
          <TrendingFlat
            sx={{
              fontSize: 80,
              color: "#b1b1b1",
              alignSelf: "center",
              marginTop: -3,
            }}
          />

          {/* Icon bên phải */}
          <Box sx={{ textAlign: "center" }}>
            <CheckCircle sx={{ fontSize: 60, color: "#b1b1b1" }} />
            <Typography
              variant="body1"
              sx={{
                marginTop: 1,
                fontSize: "16px",
                fontWeight: "500",
                color: "#b1b1b1",
              }}
            >
              Complete
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        padding={4}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {selectedData && (
          <Box
            sx={{
              flex: 1,
              marginRight: 2,
              padding: 3,
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#fff",
            }}
          >
            <Typography variant="h4" sx={styles.title} gutterBottom>
              Booking Summary
            </Typography>

            <TableContainer sx={{ marginTop: "60px" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Tour</TableCell>
                    <TableCell>
                      {formData.tourName || "Not Available"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tour Package</TableCell>
                    <TableCell>
                      {selectedData.tourPackage || "Not Available"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Price</TableCell>
                    <TableCell>
                      $
                      {selectedData?.tourPrice ||
                        selectedData?.selectedSchedule?.packagePrice ||
                        "Not Available"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Adult</TableCell>
                    <TableCell>{selectedData.adult || 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Children</TableCell>
                    <TableCell>
                      {selectedData.children || 0}{" "}
                      <span style={{ color: "#0b5da7", fontStyle: "italic" }}>
                        (Child price (&lt; 6 years old) is free of tour price
                        and can only be booked for less than 5 people)
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography>Booking Date</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" color="textPrimary">
                        {new Intl.DateTimeFormat("en-GB", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZoneName: "short",
                        }).format(new Date())}
                      </Typography>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Departure Date</TableCell>
                    <TableCell>
                      {selectedData?.departureDate ? (
                        <Typography variant="body1" color="textPrimary">
                          {new Intl.DateTimeFormat("en-GB", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZoneName: "short",
                          }).format(new Date(selectedData.departureDate))}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          Not Available
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography variant="h6" sx={{ color: "#0b5da7" }}>
                        Total Price
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="h6" sx={{ color: "#0b5da7" }}>
                        $ {selectedData.totalPrice || 0}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <a href="/tour/:tourId" className="previous-link">
              <i className="previous-link__arrow">❮</i>
              <span className="previous-link__content">Exit</span>
            </a>
          </Box>
        )}
        <Box
          sx={{
            flex: 1,
            marginLeft: 2,
            padding: 3,
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h4" sx={styles.title} gutterBottom>
            Enter your full information to book
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            maxWidth="600px"
            margin="auto"
            padding={4}
          >
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <TextField
              fullWidth
              margin="normal"
              label="Phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <TextareaAutosize
              minRows={4}
              style={{
                width: "100%",
                marginTop: "10px",
                marginBottom: "16px",
                padding: "8px",
                border: "1px solid #ddd", // Màu viền mặc định
                borderRadius: "8px", // Bo góc
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // Thêm bóng đổ nhẹ
                transition: "border-color 0.3s, box-shadow 0.3s", // Hiệu ứng chuyển màu
              }}
              placeholder="Notes"
              name="text"
              value={formData.text}
              onChange={handleChange}
              onFocus={(e) => {
                e.target.style.borderColor = "#004e92"; // Màu xanh khi focus
                e.target.style.boxShadow = "0 0 5px rgba(12, 2, 73, 0.5)"; // Hiệu ứng bóng khi focus
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ddd"; // Trở lại màu viền mặc định khi không focus
                e.target.style.boxShadow = "0 1px 3px rgba(3, 6, 79, 0.1)"; // Trở lại bóng đổ mặc định
              }}
            />

            <Typography variant="h6">Payment method</Typography>
            <FormGroup sx={{ margin: 0, marginBottom: 2 }}>
              <FormControlLabel
                style={{ margin: 0 }}
                control={
                  <Radio
                    checked={formData.paymentId === "1"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentId: e.target.value === "1" ? "1" : "",
                      }))
                    }
                    value="1"
                    sx={{ marginLeft: "auto" }} // Radio căn lề phải
                  />
                }
                label={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>Pay By Credit Card</span>
                    <img
                      width="30"
                      height="30"
                      src="https://img.icons8.com/3d-fluency/94/money.png"
                      alt="money"
                    />
                  </div>
                }
                labelPlacement="start" // Đặt label trước nút checkbox
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              />
              <FormControlLabel
                style={{ margin: 0 }}
                control={
                  <Radio
                    checked={formData.paymentId === "2"}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentId: e.target.value === "2" ? "2" : "",
                      }))
                    }
                    value="2"
                    sx={{ marginLeft: "auto" }} // Radio căn lề phải
                  />
                }
                label={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>Pay By Paypal</span>
                    <img
                      width="30"
                      height="30"
                      src="https://img.icons8.com/fluency/48/paypal.png"
                      alt="paypal"
                    />
                  </div>
                }
                labelPlacement="start" // Đặt label trước nút checkbox
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              />
            </FormGroup>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading} // Vô hiệu hóa nút khi đang loading
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" /> // Hiển thị spinner khi đang loading
              ) : (
                "Submit"
              )}
            </Button>
            {statusMessage && (
              <Typography variant="body1" color="success" marginTop={2}>
                {statusMessage}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default BookingPage;
