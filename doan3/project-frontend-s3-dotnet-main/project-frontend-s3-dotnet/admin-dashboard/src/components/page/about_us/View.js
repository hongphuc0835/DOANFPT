import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Button, Typography, ImageList, ImageListItem, Divider, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AboutService from "./AboutService";

const View = ({ aboutId, visible, onClose }) => {
  const [viewing, setViewing] = useState(null);
  const [visibleImages, setVisibleImages] = useState(3);

  const fetchAboutDetails = useCallback(async () => {
    try {
      const about = await AboutService.getById(aboutId);
      setViewing(about);
    } catch (error) {
      console.error("Error fetching about details:", error);
    }
  }, [aboutId]);

  useEffect(() => {
    if (visible && aboutId) fetchAboutDetails();
  }, [visible, aboutId, fetchAboutDetails]);

  if (!viewing) return null;

  const imageUrls = viewing?.imageUrl.split(";").map((url) => url.trim()) || [];
  const toggleImages = (action) => setVisibleImages((prev) => (action === "show" ? prev + 3 : prev - 3));

  return (
    <Dialog open={visible} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ padding: 2, position: "relative" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
          About Details
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 3 }}>
        {imageUrls.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
              Images
            </Typography>
            <ImageList cols={4} gap={8} sx={{ margin: 0 }}>
              {imageUrls.slice(0, visibleImages).map((url, index) => (
                <ImageListItem key={index}>
                  <img
                    src={url}
                    alt={`image-${index}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #eee",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2, gap: 1 }}>
              {visibleImages < imageUrls.length && (
                <Button variant="outlined" size="small" onClick={() => toggleImages("show")} sx={{ textTransform: "none" }}>
                  Show More
                </Button>
              )}
              {visibleImages > 3 && (
                <Button variant="outlined" size="small" onClick={() => toggleImages("hide")} sx={{ textTransform: "none" }}>
                  Show Less
                </Button>
              )}
            </Box>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Full Name:
          </Typography>
          <Typography variant="body2">{viewing?.fullName}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Role:
          </Typography>
          <Typography variant="body2">{viewing?.role}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Description:
        </Typography>
        <Typography variant="body2">{viewing?.description}</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default View;
