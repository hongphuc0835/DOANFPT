import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle, Button, Typography, ImageList, ImageListItem, Divider, Box, IconButton } from "@mui/material";
import NewsService from "./NewsService";
import { Close } from "@mui/icons-material";

const ViewNews = ({ newsId, visible, onClose }) => {
  const [viewing, setViewing] = useState(null);
  const [visibleImages, setVisibleImages] = useState(6);

  const handleToggleImages = (action) => {
    setVisibleImages((prev) => (action === "show" ? prev + 6 : prev - 6));
  };

  const fetchNewsDetails = useCallback(async () => {
    try {
      const news = await NewsService.getNewsById(newsId);
      setViewing(news);
    } catch (error) {
      console.error("Error fetching news details:", error);
    }
  }, [newsId]);

  useEffect(() => {
    if (visible && newsId) {
      fetchNewsDetails();
    }
  }, [visible, newsId, fetchNewsDetails]);

  if (!viewing) return null;

  const imageUrls = viewing?.imageUrl.split(";").map((url) => url.trim());
  const imageCount = imageUrls.length;

  return (
    <Dialog open={visible} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
          {viewing?.title}
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
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: 2 }}>
        <Box sx={{ mb: 2 }}>
          {viewing?.publishedDate && new Date(viewing?.publishedDate).toLocaleString()}
          <Typography variant="body2">
            <strong>Author:</strong> {viewing?.author}
          </Typography>
        </Box>

        {viewing?.imageUrl && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Images
            </Typography>
            <ImageList cols={6} gap={12}>
              {imageUrls.slice(0, visibleImages).map((url, index) => (
                <ImageListItem key={index}>
                  <img
                    src={url}
                    alt={`image-${index}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>

            {visibleImages < imageCount && (
              <Button
                variant="outlined"
                onClick={() => handleToggleImages("show")}
                sx={{
                  textTransform: "none",
                  mt: 2,
                  fontSize: "0.875rem",
                }}
              >
                Show More
              </Button>
            )}

            {visibleImages > 6 && (
              <Button
                variant="outlined"
                onClick={() => handleToggleImages("hide")}
                sx={{
                  textTransform: "none",
                  mt: 2,
                  fontSize: "0.875rem",
                }}
              >
                Show Less
              </Button>
            )}
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Summary:
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {viewing?.summary}
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Content:
        </Typography>
        <Typography variant="body2">{viewing?.content}</Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ViewNews;
