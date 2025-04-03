import React, { useState } from "react";
import AboutService from "./AboutService";
import { Container, Typography, Card, TextField, Button, CircularProgress, Box, Grid, Alert } from "@mui/material";
import { Link } from "react-router-dom";

const AddAbout = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    description: "",

    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // To store the success/error message

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddAbout = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    // Validate fields manually
    if (!formData.fullName || !formData.role || !formData.description) {
      setMessage("All fields are required!");
      setLoading(false);
      return;
    }

    // URL validation for image
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (formData.imageUrl && !urlRegex.test(formData.imageUrl)) {
      setMessage("Invalid image URL format!");
      setLoading(false);
      return;
    }

    try {
      await AboutService.create(formData);
      setMessage("About added successfully!");
      setFormData({
        fullName: "",
        role: "",
        description: "",

        imageUrl: "",
      });
    } catch (error) {
      console.error("Error adding about:", error.response || error.message);
      setMessage("Failed to add about. Please check the console for more details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mb: 4 }}>
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
          Add About
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2, color: "#757575" }}>
          Fill out the form below to add a new about to the system or <Link to="/about_us">back</Link>.
        </Typography>
        <Box component="form" onSubmit={handleAddAbout} noValidate sx={{ mt: 3 }}>
          <TextField fullWidth label="Name" name="fullName" value={formData.fullName} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Role" name="role" value={formData.role} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} required sx={{ mb: 2 }} />

          <TextField fullWidth label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} type="url" sx={{ mb: 2 }} />

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

        {message && (
          <Box sx={{ mt: 2 }}>
            <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default AddAbout;
