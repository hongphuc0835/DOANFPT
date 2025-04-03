import React, { useEffect, useState } from "react";
import { Container, Typography, Card, TextField, Button, CircularProgress, Box, Grid, Alert, LinearProgress, FormControl, InputLabel, Select, MenuItem, Rating } from "@mui/material";
import { Link } from "react-router-dom";
import ReactQuill from "react-quill";
import axios from "axios";

const AddTour = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tourDepartureLocation: "",
    rating: "",
    imageUrl: "",
    transportMode: "",
    duration: "",
    active: true,
    destinationId: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // To store the success/error message

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddTour = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validate fields manually
    if (!formData?.name || !formData?.description || !formData?.tourDepartureLocation || !formData?.rating || !formData?.imageUrl || !formData?.transportMode || !formData?.duration || !formData?.destinationId) {
      setMessage("All fields are required!");
      setLoading(false);
      return;
    }

    // URL validation for image
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (formData?.imageUrl && !urlRegex.test(formData?.imageUrl)) {
      setLoading(false);
      return;
    }

    try {
      // Make the API request directly
      const response = await fetch("http://localhost:5089/api/tour/createTour", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to add tour");
      }

      setMessage("Tour added successfully!");
      setFormData({
        name: "",
        description: "",
        tourDepartureLocation: "",
        rating: "",
        imageUrl: "",
        transportMode: "",
        duration: "",
        active: true,
        destinationId: "",
      });
    } catch (error) {
      console.error("Error adding tour:", error.message);
      setMessage("Failed to add tour. Please check the console for more details.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuillChange = (value) => {
    setFormData({
      ...formData,
      description: value,
    });
  };
  const [destinations, setDestinations] = useState([]);
  useEffect(() => {
    fetchAllDestinations();
  }, []);
  const fetchAllDestinations = async () => {
    // Kiểm tra xem dữ liệu đã có trong sessionStorage chưa
    const cachedDestinations = sessionStorage.getItem("destinations");

    if (cachedDestinations) {
      // Nếu có dữ liệu trong cache, sử dụng dữ liệu đó
      setDestinations(JSON.parse(cachedDestinations));
      setLoading(false); // Đảm bảo loading không còn
    }
    // Nếu không có trong cache, gọi API để lấy dữ liệu
    try {
      const response = await axios.get("http://localhost:5089/api/destination/getAllDestinationsWithTours");
      setDestinations(response.data);
      // Lưu dữ liệu vào sessionStorage để sử dụng lần sau
      sessionStorage.setItem("destinations", JSON.stringify(response.data));
    } catch (error) {
      setMessage("Error fetching destinations", error);
    }
  };

  return (
    <Container maxWidth="md">
      <Card
        sx={{
          p: 4,
          mt: 5,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
          Add Tour
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2, color: "#757575" }}>
          Fill out the form below to add a new tour to the system or <Link to="/tour">back</Link>.
        </Typography>
        <Box component="form" onSubmit={handleAddTour} noValidate sx={{ mt: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Destination</InputLabel>
            <Select name="destinationId" value={formData?.destinationId} onChange={handleChange}>
              {destinations.map((destination) => (
                <MenuItem key={destination?.destination?.destinationId} value={destination?.destination?.destinationId}>
                  {destination?.destination?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField fullWidth label="Tour Name" name="name" value={formData?.name} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Departure Location" name="tourDepartureLocation" value={formData?.tourDepartureLocation} onChange={handleChange} required sx={{ mb: 2 }} />

          <Box>
            <Typography component="legend">Rating</Typography>
            <Rating name="rating" value={formData?.rating} precision={0.5} onChange={handleChange} required sx={{ mb: 2 }} />
          </Box>
          <TextField fullWidth label="Transport Mode" name="transportMode" value={formData?.transportMode} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Duration" name="duration" value={formData?.duration} onChange={handleChange} required sx={{ mb: 2 }} />

          <TextField fullWidth label="Image URL" name="imageUrl" value={formData?.imageUrl} onChange={handleChange} type="url" sx={{ mb: 2 }} />
          {/* ReactQuill for Description */}
          <div className="quill-container">
            <ReactQuill value={formData?.description || ""} onChange={handleQuillChange} name="description" fullWidth placeholder="Enter a detailed description..." />
          </div>
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "16px",
                padding: "10px 20px",
                borderRadius: "8px",
              }}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Grid>
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
      </Card>
    </Container>
  );
};

export default AddTour;
