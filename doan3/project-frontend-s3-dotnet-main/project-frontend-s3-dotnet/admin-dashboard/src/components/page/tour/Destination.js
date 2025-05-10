import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Box, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, InputAdornment, IconButton, Alert, LinearProgress } from "@mui/material";
import { MoodBad, Search } from "@mui/icons-material";

const Destination = () => {
  const [destinations, setDestinations] = useState([]);
  const [message, setMessage] = useState("");
  const [searchName, setSearchName] = useState("");
  const [newDestination, setNewDestination] = useState({ name: "", description: "" });

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

  // Fetch all destinations with tours
  const fetchAllDestinations = async () => {
    // Check if destinations data is already in localStorage
    const cachedDestinations = localStorage.getItem("destinations");

    if (cachedDestinations) {
      // If data is in cache, use the cached data
      setDestinations(JSON.parse(cachedDestinations));
    }
    // If no cached data, fetch from API
    try {
      const response = await axios.get("http://localhost:5089/api/destination/getAllDestinationsWithTours");
      setDestinations(response.data);
      localStorage.setItem("destinations", JSON.stringify(response.data));

      // Cache the fetched data for future use
    } catch (error) {
      setMessage("Error"); // Ensure the error is a string
    }
  };

  // Create a new destination
  const createDestination = async () => {
    try {
      const response = await axios.post("http://localhost:5089/api/destination/create", newDestination);
      setMessage("Destination created!");

      // Add the new destination to the list (local state)
      const updatedDestinations = [...destinations, response.data];
      setDestinations(updatedDestinations);

      setNewDestination({ name: "", description: "" }); // Reset the form
      fetchAllDestinations();
    } catch (error) {
      setMessage("Error creating destination!");
    }
  };

  // Update a destination
  const updateDestination = async (id, updatedData) => {
    try {
      await axios.put(`http://localhost:5089/api/destination/${id}`, updatedData);
      setMessage("Destination updated!");

      // Update the destination in the local state
      const updatedDestinations = destinations.map((destination) => (destination.id === id ? { ...destination, ...updatedData } : destination));
      setDestinations(updatedDestinations);

      // Update localStorage with the updated list
      localStorage.setItem("destinations", JSON.stringify(updatedDestinations));
    } catch (error) {
      setMessage("Error updating destination!");
    }
  };

  // Delete a destination
  const deleteDestination = async (id) => {
    try {
      await axios.delete(`http://localhost:5089/api/destination/${id}`);
      setMessage("Destination deleted");

      // Remove the deleted destination from the local state
      const updatedDestinations = destinations.filter((destination) => destination.destination.destinationId !== id);
      setDestinations(updatedDestinations);

      // Update localStorage with the updated list
      localStorage.setItem("destinations", JSON.stringify(updatedDestinations));
    } catch (error) {
      setMessage("Error deleting destination!");
    }
  };

  // Search destinations by name
  const searchDestinationsByName = async () => {
    if (!searchName.trim()) {
      // Nếu thanh tìm kiếm trống, hiển thị lại danh sách tất cả
      fetchAllDestinations();
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5089/api/destination/DestinationName/${searchName}`);
      setDestinations(response.data);
    } catch (error) {
      setDestinations([]); // Đặt danh sách rỗng nếu xảy ra lỗi
    }
  };

  useEffect(() => {
    fetchAllDestinations();
  }, []);

  return (
    <Container sx={{ padding: 4, marginBottom: "20px" }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
        Destinations
      </Typography>

      {/* Search Destinations */}

      <Box mb={4}>
        <TextField
          label="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          fullWidth
          margin="normal"
          variant="outlined"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              searchDestinationsByName(); // Gọi hàm tìm kiếm khi nhấn Enter
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={searchDestinationsByName} edge="end">
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* List of All Destinations */}
      <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Id</TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Destination_Name </TableCell>

              <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {destinations.length > 0 ? (
              destinations.map((dest) => (
                <TableRow key={dest?.destination?.destinationId}>
                  <TableCell>{dest?.destination?.destinationId}</TableCell>
                  <TableCell>
                    <TextField
                      value={dest?.destination?.name}
                      onChange={(e) => setDestinations((prev) => prev.map((d) => (d.destination.destinationId === dest?.destination?.destinationId ? { ...d, destination: { ...d.destination, name: e.target.value } } : d)))}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        updateDestination(dest?.destination?.destinationId, {
                          name: dest?.destination?.name,
                          description: dest?.destination?.description,
                        })
                      }
                      sx={{
                        marginRight: 1,
                        backgroundColor: "#4caf50",
                        "&:hover": { backgroundColor: "#388e3c" },
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => deleteDestination(dest?.destination?.destinationId)}
                      sx={{
                        backgroundColor: "#f44336",
                        "&:hover": { backgroundColor: "#d32f2f" },
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box
                    sx={{
                      textAlign: "center",
                      padding: 5,
                    }}
                  >
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: "bold" }}>
                      No destination available.
                    </Typography>
                    <MoodBad fontSize="large" color="disabled" />
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Destination */}
      <Box
        sx={{
          mt: 5,
          p: 3,
          borderRadius: 2,
          backgroundColor: "#fff",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: "bold",

            mb: 2,
            textTransform: "uppercase",
          }}
        >
          Create Destination
        </Typography>
        <TextField label="Destination Name" value={newDestination.name} onChange={(e) => setNewDestination({ ...newDestination, name: e.target.value })} fullWidth margin="normal" variant="outlined" />
        {/* <TextField label="Destination Description" value={newDestination.description} onChange={(e) => setNewDestination({ ...newDestination, description: e.target.value })} fullWidth margin="normal" variant="outlined" multiline rows={3} /> */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={createDestination}
          sx={{
            mt: 2,
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            textTransform: "capitalize",
          }}
        >
          Create
        </Button>
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
    </Container>
  );
};

export default Destination;
