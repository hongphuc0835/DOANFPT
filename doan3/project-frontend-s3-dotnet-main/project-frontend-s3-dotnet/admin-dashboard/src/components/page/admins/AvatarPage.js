import React, { useState, useEffect } from "react";
import { Avatar, Button, Card, TextField, CircularProgress, Divider, Container, Grid, Box, Typography, Alert, MenuItem, Select, InputLabel, FormControl, FormHelperText } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import AdminsService from "./AdminsService";

const ProfileInfo = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [message, setMessage] = useState(""); // 'success', 'error', or 'info'

  const [gender, setGender] = useState(""); // State for gender selection
  const [birthDay, setBirthDay] = useState(""); // State for birthday
  const [avatar, setAvatar] = useState(""); // State for avatar URL

  useEffect(() => {
    const idFromStorage = localStorage.getItem("adminId");
    if (idFromStorage) {
      setAdminId(idFromStorage);
    }
  }, []);

  useEffect(() => {
    if (!adminId) {
      setError("Admin information not found.");
      setLoading(false);
      return;
    }

    const fetchAdminData = async () => {
      try {
        const data = await AdminsService.getAdminData(adminId);
        setAdminData(data);
        setGender(data.gender || ""); // Set gender based on admin data
        setBirthDay(data.birthDay || ""); // Set birthday based on admin data
        setAvatar(data.avatar || ""); // Set avatar URL from admin data
        setError("");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [adminId]);

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedAdminData = Object.fromEntries(formData.entries());
    updatedAdminData.avatar = avatar; // Add avatar Base64 string to form data

    try {
      await AdminsService.updateAdmin({ ...adminData, ...updatedAdminData });
      setAdminData((prev) => ({ ...prev, ...updatedAdminData }));
      setMessage("Admin updated successfully!");
    } catch (error) {
      setError("Error updating admin.");
    }
  };

  // Base64 encoding for avatar
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result; // Get the Base64 string
        setAvatar(base64String); // Update the avatar state with Base64 string
      };

      reader.readAsDataURL(file); // Convert the file to Base64 format
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : phone;
  };

  return (
    <Container>
      <Box mt={4}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : adminData ? (
          <Grid container spacing={3}>
            {/* Profile Card */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Avatar sx={{ width: 120, height: 120 }} src={avatar || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/800px-Flag_of_Vietnam.svg.png"} alt="Admin Avatar" />
                </div>

                {/* Name and Email */}
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  {adminData.fullName || "Guest Admin"}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {adminData.email || "No email provided"}
                </Typography>

                <Divider sx={{ width: "100%", my: 2 }} />

                {/* Profile Details */}
                <Box sx={{ width: "100%", textAlign: "left" }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Gender:</strong> {adminData.gender || "Not updated"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone Number:</strong> {formatPhoneNumber(adminData.phone || "Not updated")}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {adminData.address || "Not updated"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Birth Day:</strong> {adminData.birthDay || "Not updated"}
                  </Typography>
                </Box>

                <Divider sx={{ width: "100%", my: 2 }} />

                {/* Change Password Button */}
                <Button variant="contained" color="primary" startIcon={<LockOutlined />} href="/changepassword">
                  Change Password
                </Button>
              </Card>
            </Grid>

            {/* Edit Profile Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6">Edit Profile</Typography>
                <form onSubmit={handleSaveEdit}>
                  <TextField label="Avatar" name="avatar" defaultValue={adminData.avatar} fullWidth margin="normal" required />
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <TextField label="Full Name" name="fullName" defaultValue={adminData.fullName} fullWidth margin="normal" required />

                  {/* Gender Select Field */}
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={gender} onChange={(e) => setGender(e.target.value)} label="Gender">
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                    </Select>
                    <FormHelperText>Choose Male or Female</FormHelperText>
                  </FormControl>

                  {/* Address Field */}
                  <TextField label="Address" name="address" defaultValue={adminData.address} fullWidth margin="normal" />

                  {/* Phone Number Field */}
                  <TextField label="Phone" name="phone" defaultValue={adminData.phone} fullWidth margin="normal" />

                  {/* Birthday Date Picker */}
                  <TextField
                    label="Birth Day"
                    name="birthDay"
                    type="date"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    required
                  />

                  <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Save Changes
                  </Button>
                </form>
                {message && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">No data available</Alert>
        )}
      </Box>
    </Container>
  );
};

export default ProfileInfo;
