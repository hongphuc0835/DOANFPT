import React, { useState } from "react";
import ContactService from "./ContactService";
import { Container, Typography, Card, TextField, Button, CircularProgress, Box, Grid, Alert } from "@mui/material";
import { AccountCircle, Email, Phone, Home } from "@mui/icons-material";
import { Link } from "react-router-dom";

const AddContact = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    address: "",
    phoneNumber: "",
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

  const handleAddContact = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    // Validate fields manually
    if (!formData.companyName || !formData.email) {
      setMessage("Company Name and Email are required!");
      setLoading(false);
      return;
    }

    // Phone number validation
    const phoneRegex = /^[0-9]+$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      setMessage("Phone number must contain only digits");
      setLoading(false);
      return;
    }

    try {
      await ContactService.createContact(formData);
      setMessage("Contact added successfully!");
      setFormData({
        companyName: "",
        email: "",
        address: "",
        phoneNumber: "",
      });
    } catch (error) {
      console.error("Error adding contact:", error.response || error.message);
      setMessage("Failed to add contact. Please check the console for more details.");
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
          Add Contact
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2, color: "#757575" }}>
          Fill out the form below to add a new contact to the system or <Link to="/contact_us">back</Link>.
        </Typography>
        <Box component="form" onSubmit={handleAddContact} noValidate sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <AccountCircle />,
            }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            type="email"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Email />,
            }}
          />
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Home />,
            }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            type="tel"
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Phone />,
            }}
          />
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

export default AddContact;
