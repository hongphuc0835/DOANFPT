import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, TextField, Button, Typography, Box, TableContainer, Alert, Grid, Chip, Card, LinearProgress, MenuItem, TablePagination } from "@mui/material";
import { Delete, MoodBad, Edit } from "@mui/icons-material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const TourSchedule = () => {
  const [tourSchedules, setTourSchedules] = useState([]);
  const [message, setMessage] = useState("");
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    packagePrice: "",
    description: "",
    tourId: editingSchedule ? editingSchedule.tourId : "",
  });
  const [selectedTourId, setSelectedTourId] = useState(null);
  const [progress, setProgress] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0); // Current page
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page

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

  const fetchAllTourSchedules = async () => {
    try {
      const response = await axios.get("http://localhost:5089/api/tourschedule/grtAllSchedules");
      setTourSchedules(response.data);
    } catch (error) {
      setMessage("Error fetching tour schedules");
    }
  };

  useEffect(() => {
    fetchAllTourSchedules();
  }, []);

  const handleSave = async () => {
    try {
      if (editingSchedule) {
        await axios.put(`http://localhost:5089/api/tourschedule/${editingSchedule?.tourScheduleId}`, formData);
        setMessage("Tour schedule updated!");
      } else {
        await axios.post("http://localhost:5089/api/tourschedule/create", formData);
        setMessage("Tour schedule created!");
      }
      setFormData({ name: "", packagePrice: "", description: "", tourId: "" });
      setEditingSchedule(null);
      fetchAllTourSchedules();
    } catch (error) {
      setMessage(editingSchedule ? "Error updating tour schedule" : "Error creating tour schedule");
    }
  };

  const deleteTourSchedule = async (id) => {
    try {
      await axios.delete(`http://localhost:5089/api/tourschedule/${id}`);
      setMessage("Tour schedule deleted");
      fetchAllTourSchedules();
    } catch (error) {
      setMessage("Error deleting tour schedule");
    }
  };

  const handleEditClick = (schedule) => {
    // Lưu lịch trình đang chỉnh sửa vào state
    setEditingSchedule(schedule);

    // Tạo dữ liệu mẫu để điền vào form
    const formData = {
      name: schedule?.name,
      packagePrice: schedule?.packagePrice,
      description: schedule?.description,
      tourId: schedule?.tourId,
    };

    // Cập nhật dữ liệu vào form
    setFormData(formData);
  };

  const groupedSchedules = tourSchedules.reduce((acc, schedule) => {
    const { tourId } = schedule;
    if (!acc[tourId]) acc[tourId] = [];
    acc[tourId].push(schedule);
    return acc;
  }, {});

  const handleTourClick = (id) => {
    setSelectedTourId((prevId) => (prevId === id ? null : id));
  };

  // Pagination handler
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset page when changing rows per page
  };

  // Paginated Schedules
  const paginatedSchedules = Object.entries(groupedSchedules).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container sx={{ padding: 4, marginBottom: "20px" }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
        Tour Schedules
      </Typography>

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
      {/* List */}
      <TableContainer sx={{ mb: 4 }}>
        <Grid container spacing={4}>
          {tourSchedules.length > 0 ? (
            paginatedSchedules.map(([tourId, schedules]) => (
              <Grid item xs={12} sm={6} key={tourId}>
                {" "}
                {/* xs={12} to xs={4} */}
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "primary.main",
                      color: "white",
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                    onClick={() => handleTourClick(tourId)}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      Tour ID: {tourId}
                    </Typography>
                    <Chip label={`${schedules.length} Schedules`} color="secondary" size="small" />
                  </Box>
                  {selectedTourId === tourId && (
                    <Box sx={{ padding: 3 }} component={Card}>
                      {schedules.map((schedule) => (
                        <Box
                          key={schedule?.tourScheduleId}
                          sx={{
                            mb: 3,
                            p: 2,
                            border: "1px solid",
                            borderColor: "grey.200",
                            borderRadius: 2,
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            {schedule?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Package Price: {schedule?.packagePrice}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: schedule?.description }} />
                          <Button variant="outlined" color="primary" size="small" sx={{ mt: 1 }} onClick={() => handleEditClick(schedule)}>
                            <Edit fontSize="small" sx={{ mr: 0.5 }} />
                            Edit
                          </Button>
                          <Button variant="outlined" color="error" size="small" sx={{ ml: 2, mt: 1 }} onClick={() => deleteTourSchedule(schedule?.tourScheduleId)}>
                            <Delete fontSize="small" sx={{ mr: 0.5 }} />
                            Delete
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  padding: 5,
                  backgroundColor: "grey.50",
                  borderRadius: 2,
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: "bold" }}>
                  No Tour Schedules Available
                </Typography>
                <MoodBad fontSize="large" color="disabled" />
              </Box>
            </Grid>
          )}
        </Grid>
      </TableContainer>
      <Box display="flex" justifyContent="center" width="100%">
        <TablePagination component="div" count={tourSchedules.length} page={page} onPageChange={handleChangePage} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[]} labelDisplayedRows={() => null} />
      </Box>

      {/* Save */}
      <Box
        sx={{
          backgroundColor: "#fff",
          padding: 3,
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", marginBottom: 2 }}>
          {editingSchedule ? "Edit Tour Schedule" : "Create Tour Schedule"}
        </Typography>
        <Grid container spacing={2} mb={5}>
          <Grid item xs={12}>
            <TextField fullWidth label="Tour ID" type="number" value={formData?.tourId} onChange={(e) => setFormData({ ...formData, tourId: e.target.value })} variant="outlined" margin="dense" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Name" value={formData?.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} variant="outlined" margin="dense">
              {" "}
              <MenuItem value="Basic">Basic</MenuItem>
              <MenuItem value="Luxury">Luxury</MenuItem>
              <MenuItem value="Vip">VIP</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Package Price" type="number" value={formData?.packagePrice} onChange={(e) => setFormData({ ...formData, packagePrice: e.target.value })} variant="outlined" margin="dense" />
          </Grid>
          <Grid item xs={12}>
            <ReactQuill theme="snow" value={formData?.description} onChange={(value) => setFormData({ ...formData, description: value })} style={{ height: "200px", marginBottom: "16px" }} placeholder="Enter a detailed description..." />
          </Grid>
        </Grid>
        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              setFormData({ name: "", packagePrice: "", description: "", tourId: "" });
              setEditingSchedule(null); // Reset the editing schedule
            }}
          >
            Reset
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }}>
            {editingSchedule ? "Save Changes" : "Create Schedule"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TourSchedule;
