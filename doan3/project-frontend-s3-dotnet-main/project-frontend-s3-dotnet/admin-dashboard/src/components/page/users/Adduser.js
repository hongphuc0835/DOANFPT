import React, { useState } from "react";
import UsersService from "../users/UsersService";
import { Container, Typography, Card, TextField, Button, CircularProgress, Box, Grid, Alert } from "@mui/material";
import { Link } from "react-router-dom";

const AddUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // New state for the message

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddUser = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!emailRegex.test(formData.email)) {
      setMessage("Invalid email format!");
      setLoading(false);
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setMessage("Invalid phone number!");
      setLoading(false);
      return;
    }

    try {
      await UsersService.register(formData.email, formData.password, formData.fullName, formData.phone);
      setMessage("User added successfully!");
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error adding user:", error.response?.data || error.message);
      setMessage("Failed to add user. Please check the console for more details.");
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
          Add New User
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2, color: "#757575" }}>
          Fill out the form below to add a new user to the system or <Link to="/users">back</Link>.
        </Typography>

        <Box
          component="form"
          onSubmit={handleAddUser}
          noValidate
          sx={{
            mt: 3,
            "& .MuiTextField-root": { mb: 2 },
          }}
        >
          <TextField fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
          <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} required type="email" />
          <TextField fullWidth label="Password" name="password" value={formData.password} onChange={handleChange} required type="password" />
          <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />

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

export default AddUser;
