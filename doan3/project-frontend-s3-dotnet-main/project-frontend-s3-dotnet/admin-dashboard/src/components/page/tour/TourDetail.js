import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Button, DialogActions, TextField, DialogContent, DialogTitle, Dialog, Rating, Container } from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Edit, ArrowBack } from "@mui/icons-material";

const App = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState("tab-1");
  const [selectedImage, setSelectedImage] = useState(null);
  const { tourId } = useParams();
  const [editOpen, setEditOpen] = useState(false);
  const [tourData, setTourData] = useState({});

  const handleTabClick = (tabName) => setActiveTab(tabName);

  useEffect(() => {
    if (data?.tour?.imageUrl) {
      const imageUrls = data?.tour?.imageUrl.split(";");
      if (imageUrls.length > 0) {
        setSelectedImage(imageUrls[0]);
      }
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      const cachedTours = localStorage.getItem("tours");
      if (cachedTours) {
        setData(JSON.parse(cachedTours));
        const defaultSchedule = cachedTours.tourSchedules?.find((schedule) => schedule?.name.toLowerCase() === "basic");
        setSelectedSchedule(defaultSchedule);
      }
      try {
        const response = await fetch(`http://localhost:5089/api/Tour/${tourId}/related-data`);
        const result = await response.json();
        if (!cachedTours || JSON.stringify(cachedTours) !== JSON.stringify(result)) {
          delete result.restaurants;
          delete result.hotels;
          setData(result);
          setSelectedSchedule(result?.tourSchedules?.find((schedule) => schedule?.name.toLowerCase() === "basic"));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [tourId]);

  useEffect(() => {
    if (data && data?.tour?.imageUrl) setSelectedImage(data?.tour?.imageUrl.split(";")[0]);
  }, [data]);

  if (!data) return <Typography variant="h5">No data available</Typography>;

  const { tour, tourSchedules } = data;

  const handleEditClick = () => {
    setTourData({
      ...tour,
      imageUrls: tour?.imageUrl?.split(";") || [], // Ensure `imageUrls` is an array
    });
    setEditOpen(true);
  };

  const handleClose = () => {
    setEditOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target || {};
    if (name !== undefined) {
      setTourData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleQuillChange = (value) => {
    setTourData({
      ...tourData,
      description: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...tourData,
        imageUrl: tourData.imageUrls.join(";"),
      };

      const response = await fetch(`http://localhost:5089/api/Tour/${tourId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedTour = await response.json();
        setData((prevData) => ({
          ...prevData,
          tour: updatedTour,
        }));
        setEditOpen(false);
        navigate(0); // Reload page
      } else {
        console.error("Failed to update tour");
      }
    } catch (error) {
      console.error("Error updating tour:", error);
    }
  };

  const handleAddImageInput = () => {
    setTourData((prevData) => ({
      ...prevData,
      imageUrls: [...(prevData.imageUrls || []), ""], // Thêm một URL mới trống
    }));
  };

  const handleImageInputChange = (index, e) => {
    const { value } = e.target;
    setTourData((prevData) => {
      const updatedImageUrls = [...prevData.imageUrls];
      updatedImageUrls[index] = value; // Cập nhật giá trị của ảnh cụ thể
      return {
        ...prevData,
        imageUrls: updatedImageUrls,
      };
    });
  };

  const handleRemoveImage = (index) => {
    setTourData((prevData) => {
      const updatedImageUrls = [...prevData.imageUrls];
      updatedImageUrls.splice(index, 1); // Xóa ảnh tại index
      return {
        ...prevData,
        imageUrls: updatedImageUrls,
      };
    });
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ color: "#0b5da7", fontWeight: "bold" }}>
        {tour?.name}
      </Typography>
      <div>
        <Rating name="tour-rating" value={tour?.rating || 0} precision={0.5} readOnly size="medium" sx={{ color: "gold" }} />
      </div>
      {/* Tour Information */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Depart from", value: tour?.tourDepartureLocation, icon: "address.png" },
          { label: "Destination", value: tour?.destinations?.name, icon: "address.png" },
          { label: "Duration", value: tour?.duration, icon: "overtime.png" },
          { label: "Transport Mode", value: tour?.transportMode, icon: "road.png" },
        ].map(({ label, value, icon }, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Box display="flex" alignItems="center">
              <img src={`https://img.icons8.com/material-rounded/0b5da7/${icon}`} alt={label} width="24" height="24" style={{ marginRight: 8 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: "#555" }}>
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ color: "#0b5da7" }}>
                  {value}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Image and Thumbnail Section */}
      {selectedImage && (
        <Box sx={{ mb: 4 }}>
          {/* Hình ảnh chính */}
          <img
            src={selectedImage}
            alt="Selected"
            style={{
              width: "100%",
              maxWidth: "600px", // Giới hạn chiều rộng tối đa
              height: "auto",
              borderRadius: 8,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
              objectFit: "contain", // Giữ tỷ lệ ảnh
              margin: "0 auto", // Căn giữa
              display: "block",
            }}
          />
          {/* Hình thu nhỏ */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2,
              overflowX: "auto",
              justifyContent: "center",
            }}
          >
            {tour?.imageUrl.split(";").map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: 4,
                  cursor: "pointer",
                  border: selectedImage === image ? "2px solid #1976d2" : "1px solid #ccc", // Border khác biệt khi được chọn
                }}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Tour Schedule */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {tourSchedules?.map((schedule) => (
          <Grid item xs={12} sm={6} md={4} key={schedule?.tourScheduleId}>
            <Card
              onClick={() => setSelectedSchedule(schedule)}
              sx={{
                cursor: "pointer",
                border: selectedSchedule?.tourScheduleId === schedule?.tourScheduleId ? "2px solid #0b5da7" : "none",
                backgroundColor: "#f5f5f5",
                borderRadius: 4,
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  backgroundColor: "#eaf4ff",
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" align="center" sx={{ color: "#0b5da7" }}>
                  {schedule?.name}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedSchedule && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" color="#0b5da7">
            <strong>Price:</strong> ${selectedSchedule?.packagePrice}
          </Typography>
        </Box>
      )}

      {/* Tab Navigation */}
      <Box sx={{ display: "flex", gap: 2, mt: 4, mb: 3 }}>
        {["tab-1", "tab-0"].map((tab) => (
          <Button
            key={tab}
            onClick={() => handleTabClick(tab)}
            sx={{
              textTransform: "none",
              backgroundColor: activeTab === tab ? "#0b5da7" : "#d4d4d4",
              color: activeTab === tab ? "white" : "#000",
              "&:hover": { backgroundColor: "#0b5da7", color: "white" },
              padding: "12px 24px",
              borderRadius: 4,
              fontWeight: "bold",
            }}
          >
            {tab === "tab-1" ? "Description" : "Schedule"}
          </Button>
        ))}
      </Box>

      {/* Tab Content */}
      <Box sx={{ border: "2px solid #e6f4ff", borderRadius: 4, p: 2, backgroundColor: "#ffffff" }}>
        {activeTab === "tab-1" && <Typography variant="body2" dangerouslySetInnerHTML={{ __html: tour?.description }} />}
        {activeTab === "tab-0" && (
          <Box>
            <Typography variant="body2" dangerouslySetInnerHTML={{ __html: selectedSchedule?.description }} />
          </Box>
        )}
      </Box>
      <Link to="/tour" style={{ textDecoration: "none" }}>
        <Button startIcon={<ArrowBack />} variant="contained" color="error" sx={{ mt: 4, textTransform: "none", color: "white", padding: "12px 24px", borderRadius: 4, fontWeight: "bold", mr: 4 }}>
          Return
        </Button>
      </Link>
      <Button onClick={handleEditClick} variant="contained" color="primary" sx={{ mt: 4, textTransform: "none", backgroundColor: "#0b5da7", color: "white", "&:hover": { backgroundColor: "#0b5da7" }, padding: "12px 24px", borderRadius: 4, fontWeight: "bold" }} endIcon={<Edit />}>
        Edit
      </Button>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={handleClose}>
        <DialogTitle>Edit Tour</DialogTitle>
        <DialogContent>
          <TextField label="Tour Name" name="name" value={tourData?.name || ""} onChange={handleInputChange} fullWidth margin="normal" />
          <TextField label="Departure Location" name="tourDepartureLocation" value={tourData?.tourDepartureLocation || ""} onChange={handleInputChange} fullWidth margin="normal" />
          <TextField label="Duration" name="duration" value={tourData?.duration || ""} onChange={handleInputChange} fullWidth margin="normal" />
          <TextField label="Transport Mode" name="transportMode" value={tourData?.transportMode || ""} onChange={handleInputChange} fullWidth margin="normal" />

          {/* ReactQuill for Description */}
          <div className="quill-container">
            <label>Description</label>
            <ReactQuill value={tourData?.description || ""} onChange={handleQuillChange} name="description" fullWidth />
          </div>

          {/* Manage Image URLs */}
          <Box mt={3}>
            {tourData?.imageUrls?.map((image, index) => (
              <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <TextField label={`Image URL ${index + 1}`} value={image || ""} onChange={(e) => handleImageInputChange(index, e)} fullWidth sx={{ mb: 2 }} />
                <Button variant="outlined" color="error" onClick={() => handleRemoveImage(index)} sx={{ marginLeft: 1 }}>
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="outlined" color="primary" onClick={handleAddImageInput} sx={{ marginTop: 2 }}>
              Add Image
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default App;
