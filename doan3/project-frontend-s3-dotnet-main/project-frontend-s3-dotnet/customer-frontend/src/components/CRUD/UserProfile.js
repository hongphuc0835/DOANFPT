import React, { useState, useEffect } from "react";
import { Avatar, Button, Card, TextField, CircularProgress, Divider, Container, Grid, Box, Typography, Alert, MenuItem, Select, InputLabel, FormControl, FormHelperText } from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import UsersService from "./UsersService";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProfileInfo = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(null);
  const [message, setMessage] = useState(""); // 'success', 'error', or 'info'
  const navigate = useNavigate();
  const [gender, setGender] = useState(""); // State for gender selection
  const [birthDay, setBirthDay] = useState(""); // State for birthday
  const [avatar, setAvatar] = useState(""); // State for avatar URL

  useEffect(() => {
    const emailFromStorage = localStorage.getItem("userEmail");
    if (emailFromStorage) {
      setEmail(emailFromStorage);
    }
  }, []);

  useEffect(() => {
    if (!email) {
      setError("Email not found.");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5119/api/user/by-email/${email}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserData(response.data);
        setGender(response.data.gender || "");
        setBirthDay(response.data.birthDay || "");
        setAvatar(response.data.avatar || "");
        console.log(response.data);
        setError("");
      } catch (err) {
        setError("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedUserData = Object.fromEntries(formData.entries());
    updatedUserData.avatar = avatar; // Add avatar Base64 string to form data

    try {
      await UsersService.updateUser({ ...userData, ...updatedUserData });
      setUserData((prev) => ({ ...prev, ...updatedUserData }));
      setMessage("User updated successfully!");

      // Delay the reload by 2 seconds (2000 milliseconds)
      setTimeout(() => {
        navigate(0);
      }, 3000);
    } catch (error) {
      setError("Error updating user.");
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
        ) : userData ? (
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
                  <Avatar sx={{ width: 120, height: 120 }} src={avatar || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/800px-Flag_of_Vietnam.svg.png"} alt="User Avatar" />
                </div>

                {/* Name and Email */}
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  {userData.fullName || "Guest User"}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  {userData.email || "No email provided"}
                </Typography>

                <Divider sx={{ width: "100%", my: 2 }} />

                {/* Profile Details */}
                <Box sx={{ width: "100%", textAlign: "left" }}>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Gender:</strong> {userData.gender || "Not updated"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone Number:</strong> {formatPhoneNumber(userData.phone || "Not updated")}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Address:</strong> {userData.address || "Not updated"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Birth Day:</strong> {userData.birthDay || "Not updated"}
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
                  <div style={{ display: "flex", marginLeft: "2px", gap: 8, alignItems: "center" }}>
                    Avatar : <input type="file" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <TextField label="Full Name" name="fullName" defaultValue={userData.fullName} fullWidth margin="normal" required />

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
                  <TextField label="Address" name="address" defaultValue={userData.address} fullWidth margin="normal" />

                  {/* Phone Number Field */}
                  <TextField label="Phone" name="phone" defaultValue={userData.phone} fullWidth margin="normal" />

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
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <></>
        )}
      </Box>
    </Container>
  );
};

export default ProfileInfo;
