import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Container, TextField, Typography, Grid, Card, CardContent, CardActions, Alert, CardMedia, Dialog, DialogTitle, DialogContent, DialogActions, Rating, Collapse, Pagination, LinearProgress } from "@mui/material";

const initialHotelFormState = {
  name: "",
  description: "",
  imageUrl: "",
  address: "",
  price: "",
  rating: "",
  destinationId: "",
};

const Hotel = () => {
  const [hotels, setHotels] = useState([]);
  const [hotelForm, setHotelForm] = useState(initialHotelFormState);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [message, setMessage] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);

  useEffect(() => {
    fetchHotels();
  }, []);

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

  const fetchHotels = async () => {
    try {
      const response = await axios.get("http://localhost:5089/api/hotel/GetAllHotels");
      setHotels(response.data);
    } catch (error) {
      setMessage("Error fetching hotels");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "imageUrl") {
      // Set value directly for multiple image URLs
      const updatedImageUrls = value.split(";").map((url) => url.trim());
      setImageUrls(updatedImageUrls);
    } else {
      setHotelForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddImageInput = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const handleImageInputChange = (index, e) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = e.target.value;
    setImageUrls(updatedUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalImageUrls = imageUrls.join(";");
    const finalForm = { ...hotelForm, imageUrl: finalImageUrls };
    try {
      if (selectedHotel) {
        await axios.put(`http://localhost:5089/api/hotel/${selectedHotel.hotelId}`, finalForm);
      } else {
        await axios.post("http://localhost:5089/api/hotel/create", finalForm);
      }
      resetHotelForm();
      fetchHotels();
      setMessage("Updated successfully!!!");
    } catch (error) {
      setMessage("Error saving hotel");
    }
  };

  const handleEdit = (hotel) => {
    setSelectedHotel(hotel);
    setHotelForm({ ...hotel });
    setImageUrls(hotel.imageUrl.split(";").map((url) => url.trim()));
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5089/api/hotel/${id}`);
      fetchHotels();
      setMessage("Deleted successfully!!!");
    } catch (error) {
      setMessage("Error deleting hotel");
    }
  };

  const resetHotelForm = () => {
    setHotelForm(initialHotelFormState);
    setSelectedHotel(null);
    setImageUrls([""]);
  };

  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImages, setCurrentImages] = useState([]);
  const handleImageClick = (imageUrl) => {
    const images = imageUrl.split(";").filter((img) => img.trim() !== "");
    setCurrentImages(images);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setCurrentImages([]);
  };

  const [expandedId, setExpandedId] = useState(null);
  const handleToggle = (id) => {
    setExpandedId((prevId) => (prevId === id ? null : id)); // Toggle expanded ID
  };

  // Pagination state
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Calculate the index of the first and last hotel to display on the current page
  const startIndex = (page - 1) * itemsPerPage;
  const currentHotels = hotels.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold", mb: 4 }}>
        Hotel Management
      </Typography>

      <Box component="form" onSubmit={handleSubmit} p={3} borderRadius={2} boxShadow={2} bgcolor="background.paper" mb={4}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
          {selectedHotel ? "Edit Hotel" : "Create Hotel"}
        </Typography>
        <Grid container spacing={2}>
          {/* Form fields */}
          {[
            { label: "Name", name: "name" },
            { label: "Description", name: "description" },
            { label: "Address", name: "address" },
            { label: "Price", name: "price", type: "number" },

            { label: "Destination ID", name: "destinationId", type: "number" },
          ].map((field, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <TextField label={field.label} name={field.name} type={field.type || "text"} value={hotelForm[field.name]} onChange={handleInputChange} fullWidth />
            </Grid>
          ))}
          {/* Rating Component */}
          <Grid item xs={12} sm={6}>
            <Typography component="legend">Rating</Typography>
            <Rating
              name="rating"
              value={hotelForm.rating}
              precision={0.5}
              onChange={(event, newValue) => {
                handleInputChange({ target: { name: "rating", value: newValue } });
              }}
            />
          </Grid>
          {/* Image URL Inputs */}
          <Grid item xs={12}>
            <Typography variant="h6">Image URLs</Typography>
            {imageUrls.map((url, index) => (
              <TextField key={index} label={`Image URL ${index + 1}`} value={url} onChange={(e) => handleImageInputChange(index, e)} fullWidth sx={{ mb: 2 }} />
            ))}
            <Button variant="outlined" onClick={handleAddImageInput}>
              Add Image
            </Button>
          </Grid>
        </Grid>
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" color="secondary" onClick={resetHotelForm}>
            Reset
          </Button>
          <Button variant="contained" color="primary" type="submit" sx={{ mr: 2 }}>
            {selectedHotel ? "Update" : "Create"}
          </Button>
        </Box>
      </Box>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        Hotel List
      </Typography>

      <Grid container spacing={3}>
        {currentHotels.map((hotel) => {
          const images = hotel.imageUrl.split(";");
          const firstImage = images[0]?.trim();

          return (
            <Grid item xs={12} sm={6} md={4} key={hotel.hotelId}>
              <Card sx={{ display: "flex", flexDirection: "column", border: "1px solid #ddd", mb: 2 }}>
                {firstImage && <CardMedia component="img" height="140" image={firstImage} alt={hotel.name} sx={{ objectFit: "cover" }} onClick={() => handleImageClick(hotel.imageUrl)} />}
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      minHeight: "3em", // Chiều cao tối thiểu tương ứng với 2 dòng (khoảng 1.5em mỗi dòng)
                      lineHeight: "1.5em", // Khoảng cách giữa các dòng
                    }}
                  >
                    {hotel.name}
                  </Typography>
                  <Collapse in={expandedId === hotel.hotelId} collapsedSize={48}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      onClick={() => handleToggle(hotel.hotelId)}
                      style={{
                        cursor: "pointer",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: expandedId === hotel.hotelId ? "unset" : 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {hotel.description}
                    </Typography>
                  </Collapse>
                  <Typography variant="body1" sx={{ marginTop: 1 }}>
                    Price: ${hotel.price}
                  </Typography>
                  <Typography variant="h6">
                    <Rating name="read-only-rating" value={hotel.rating} precision={0.5} readOnly />
                  </Typography>
                  <Typography variant="body1">ID: {hotel.hotelId}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => handleEdit(hotel)}>
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(hotel.hotelId)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Pagination controls */}
      <Pagination count={Math.ceil(hotels.length / itemsPerPage)} page={page} onChange={handlePageChange} sx={{ display: "flex", justifyContent: "center", marginTop: 3 }} />

      {/* Modal for showing images */}
      <Dialog open={showImageModal} onClose={closeImageModal}>
        <DialogTitle>Images</DialogTitle>
        <DialogContent>
          {currentImages.map((img, index) => (
            <img key={index} src={img.trim()} alt={`Hotel ${index + 1}`} style={{ width: "100%", marginBottom: "10px" }} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImageModal} color="primary">
            Close
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
    </Container>
  );
};

export default Hotel;
