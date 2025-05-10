import React, { useState } from "react";
import NewsService from "./NewsService";
import { Container, Typography, Card, TextField, Button, CircularProgress, Box, Grid, Alert } from "@mui/material";
import { Link } from "react-router-dom";

const AddNews = () => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    summary: "",
    content: "",
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

  const handleAddNews = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    // Validate fields manually
    if (!formData.title || !formData.author || !formData.summary || !formData.content) {
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
      await NewsService.createNews(formData);
      setMessage("News added successfully!");
      setFormData({
        title: "",
        author: "",
        summary: "",
        content: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error("Error adding news:", error.response || error.message);
      setMessage("Failed to add news. Please check the console for more details.");
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
          Add News
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2, color: "#757575" }}>
          Fill out the form below to add a new news to the system or <Link to="/news">back</Link>.
        </Typography>
        <Box component="form" onSubmit={handleAddNews} noValidate sx={{ mt: 3 }}>
          <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Author" name="author" value={formData.author} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Summary" name="summary" value={formData.summary} onChange={handleChange} required sx={{ mb: 2 }} />
          <TextField fullWidth label="Content" name="content" value={formData.content} onChange={handleChange} required multiline rows={4} sx={{ mb: 2 }} />
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

export default AddNews;
