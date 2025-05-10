import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography, Grid, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Rating, Paper, LinearProgress, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Pagination } from "@mui/material";
import { Add, MoodBad } from "@mui/icons-material";
import { Link } from "react-router-dom";

const Tour = () => {
  const [tours, setTours] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTours();
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

  const fetchTours = async () => {
    // Check if data is already in localStorage
    const cachedTours = localStorage.getItem("tours");

    if (cachedTours) {
      // If data is in cache, use the cached data
      setTours(JSON.parse(cachedTours).sort((a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId)));
    }
    try {
      const response = await axios.get("http://localhost:5089/api/tour/GetAllWithTours");
      localStorage.setItem("tours", JSON.stringify(response.data));
      setTours(JSON.parse(cachedTours).sort((a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId)));
    } catch (error) {
      console.log("Error");
    }
  };

  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null }); // Trạng thái xác nhận xóa

  const openDeleteConfirmation = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const closeDeleteConfirmation = () => {
    setConfirmDelete({ open: false, id: null });
  };

  const confirmAndDelete = async () => {
    if (confirmDelete.id) {
      try {
        await axios.delete(`http://localhost:5089/api/tour/${confirmDelete.id}`);
        fetchTours();
        setMessage("Deleted Successfully!");
      } catch (error) {
        const errorMessage = error.response ? `Error ${error.response.status}: ${error.response.data.message || error.response.statusText}` : error.message || "An unexpected error occurred.";
        setMessage(errorMessage);
      } finally {
        closeDeleteConfirmation();
      }
    }
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

  const [tourSearch, setTourSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");

  // Filter tours based on search queries
  const filteredTours = tours.filter((tour) => tour?.tour?.name.toLowerCase().includes(tourSearch.toLowerCase()) && tour?.tour?.destinations?.name.toLowerCase().includes(destinationSearch.toLowerCase()));

  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const toursPerPage = 10; // Number of tours per page
  // Pagination logic
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold", mb: 2 }}>
        Tour Management
      </Typography>

      <Paper sx={{ p: 3, m: 3 }}>
        <Link to="/add_tour" style={{ textDecoration: "none" }}>
          <Button variant="contained" color="primary" size="large" startIcon={<Add />} sx={{ minWidth: 180, mb: 3 }}>
            Add Tour
          </Button>
        </Link>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Search by Tour Name" variant="outlined" value={tourSearch} onChange={(e) => setTourSearch(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Search by Destination Name" variant="outlined" value={destinationSearch} onChange={(e) => setDestinationSearch(e.target.value)} />
          </Grid>
        </Grid>

        {currentTours.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              padding: 5,
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: "bold" }}>
              No tours available.
            </Typography>
            <MoodBad fontSize="large" color="disabled" />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>#</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Destination</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTours.map((tour) => (
                  <TableRow
                    key={tour.tour.tourId}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <TableCell>{tour.tour.tourId}</TableCell>
                    <TableCell>
                      <img
                        src={tour.tour.imageUrl.split(";")[0]?.trim()}
                        alt="Tour"
                        style={{
                          width: "100px",
                          height: "80px",
                          objectFit: "cover",
                          cursor: "pointer",
                          borderRadius: "8px", // Optional: Rounded corners for the image
                        }}
                        onClick={() => handleImageClick(tour.tour.imageUrl)}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", padding: "8px" }}>{tour.tour.name || " "}</TableCell>
                    <TableCell>{tour.tour.destinations.name}</TableCell>
                    <TableCell>
                      <Rating name="read-only-rating" value={tour.tour.rating} precision={0.5} readOnly />
                    </TableCell>
                    <TableCell>
                      <Link to={`/tour/${tour.tour.tourId}`}>
                        <Button size="small" color="info" sx={{ textTransform: "none" }}>
                          View Detail
                        </Button>
                      </Link>

                      <Button size="small" color="error" sx={{ textTransform: "none" }} onClick={() => openDeleteConfirmation(tour.tour.tourId)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination Controls */}
        {filteredTours.length > toursPerPage && (
          <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
            <Pagination count={Math.ceil(filteredTours.length / toursPerPage)} page={currentPage} onChange={handlePageChange} shape="rounded" />
          </Box>
        )}
      </Paper>

      {/* Modal for showing images */}
      <Dialog open={showImageModal} onClose={closeImageModal}>
        <DialogTitle>Images</DialogTitle>
        <DialogContent>
          {currentImages.map((img, index) => (
            <img key={index} src={img.trim()} alt={`Tour ${index + 1}`} style={{ width: "100%", marginBottom: "10px" }} />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeImageModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      {/* Hộp thoại xác nhận xóa */}
      <Dialog
        open={confirmDelete.open}
        onClose={closeDeleteConfirmation}
        PaperProps={{
          style: { borderRadius: 15, padding: "20px" },
        }}
      >
        <DialogTitle sx={{ color: "#d32f2f", fontWeight: "bold" }}>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ marginBottom: "10px" }}>
            Are you sure you want to delete the tour ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} color="inherit" sx={{ borderRadius: 10 }}>
            Cancel
          </Button>
          <Button onClick={confirmAndDelete} color="error" sx={{ borderRadius: 10 }}>
            Delete
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
    </>
  );
};

export default Tour;
