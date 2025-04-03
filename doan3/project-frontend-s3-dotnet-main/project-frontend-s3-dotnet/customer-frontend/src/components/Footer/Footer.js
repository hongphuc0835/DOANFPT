import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Grid, IconButton, Link as MuiLink } from "@mui/material";
import { Facebook, Twitter, Google, Instagram, LinkedIn, GitHub, Home, Email, Phone } from "@mui/icons-material";

const Footer = () => {
  const [contactInfo, setContactInfo] = useState([]);
  const [error, setError] = useState(null);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get("http://localhost:5119/api/contact");
      setContactInfo(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  return (
    <Box
      component="footer"
      sx={{
        position: "relative", // Đặt vị trí tương đối cho toàn bộ footer
        color: "white",
        p: 4,
        backgroundImage: "url('https://channel.mediacdn.vn/428462621602512896/2022/10/31/image009-1667187200343651782107.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
      }}
    >
      {/* Lớp phủ tối */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Màu đen mờ 50%
          zIndex: 1, // Lớp phủ nằm dưới nội dung
        }}
      />
      {/* Nội dung footer */}
      <Grid
        container
        spacing={4}
        sx={{
          position: "relative", // Nội dung nằm trên lớp phủ
          zIndex: 2,
          justifyContent: "space-between",
          alignItems: "flex-start",
          textAlign: "left",
          px: { xs: 2, md: 6 },
        }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            TRAVEL COMPANY
          </Typography>
          <Typography variant="body2">Hello, you have come to my company. All detailed contact information is below. If you find our website interesting, please rate me 5 stars. Thank you!</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Products
          </Typography>
          {["Home", "About Us", "New", "Contact US", "Terms - Policy"].map((item) => (
            <MuiLink key={item} href={`/${item}`} underline="none" sx={{ display: "block", mb: 1, color: "white" }}>
              {item}
            </MuiLink>
          ))}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Profile Team
          </Typography>
          {["DUONG THU", "PHAM HOANG", "HONG PHUC", "TRUNG THANH", "DINH NGUYEN"].map((name) => (
            <MuiLink key={name} href="#!" underline="none" sx={{ display: "block", mb: 1, color: "white" }}>
              {name}
            </MuiLink>
          ))}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            CONTACT
          </Typography>
          {error ? (
            <Typography color="error">{`Error: ${error}`}</Typography>
          ) : contactInfo.length > 0 ? (
            <>
              <Typography>
                <Home sx={{ mr: 1 }} />
                {contactInfo[0].address || "Address not available"}
              </Typography>
              <Typography>
                <Email sx={{ mr: 1 }} />
                {contactInfo[0].email || "Email not available"}
              </Typography>
              <Typography>
                <Phone sx={{ mr: 1 }} />
                {contactInfo[0].phoneNumber || "Phone not available"}
              </Typography>
            </>
          ) : (
            <Typography>Loading contact information...</Typography>
          )}
        </Grid>
      </Grid>

      <Box sx={{ textAlign: "center", mt: 4, pt: 2, borderTop: "1px solid #dee2e6", position: "relative", zIndex: 2 }}>
        <Typography variant="body2">
          © 2025 COPYRIGHT:
          <MuiLink href="#" underline="none" sx={{ fontWeight: "bold", ml: 1, color: "white" }}>
            FPTCompany
          </MuiLink>
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <IconButton component="a" href="#" sx={{ color: "white" }}>
            <Facebook />
          </IconButton>
          <IconButton component="a" href="#" sx={{ color: "white" }}>
            <Twitter />
          </IconButton>
          <IconButton component="a" href="#" sx={{ color: "white" }}>
            <Google />
          </IconButton>
          <IconButton component="a" href="#" sx={{ color: "white" }}>
            <Instagram />
          </IconButton>
          <IconButton component="a" href="#" sx={{ color: "white" }}>
            <LinkedIn />
          </IconButton>
          <IconButton component="a" href="#" sx={{ color: "white" }}>
            <GitHub />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
