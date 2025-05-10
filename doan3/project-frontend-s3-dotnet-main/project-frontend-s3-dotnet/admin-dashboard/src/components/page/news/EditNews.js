import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Add as AddIcon, Close, Delete } from "@mui/icons-material";

const EditNews = ({ newsData, visible, onClose, onSave }) => {
  const [editingData, setEditingData] = useState(newsData);
  const [imageUrls, setImageUrls] = useState(editingData?.imageUrl?.split(";") || []);

  useEffect(() => {
    setEditingData(newsData);
    setImageUrls(newsData?.imageUrl?.split(";") || []);
  }, [newsData]);

  const handleImageUrlChange = (index, value) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls[index] = value;
    setImageUrls(updatedImageUrls);
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const handleSave = () => {
    const updatedData = { ...editingData, imageUrl: imageUrls.filter((url) => url.trim()).join(";") };
    onSave(updatedData); // Call the onSave function passed as a prop to handle saving the data
  };

  const handleRemoveImageUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={visible} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
          Edit News
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
      <DialogContent>
        <Box component="form" noValidate autoComplete="off" sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2 }}>
          <TextField label="Title" value={editingData?.title || ""} onChange={(e) => setEditingData({ ...editingData, title: e.target.value })} fullWidth variant="outlined" />
          <TextField label="Author" value={editingData?.author || ""} onChange={(e) => setEditingData({ ...editingData, author: e.target.value })} fullWidth variant="outlined" />
          <TextField label="Summary" value={editingData?.summary || ""} onChange={(e) => setEditingData({ ...editingData, summary: e.target.value })} fullWidth variant="outlined" multiline rows={4} />
          <TextField label="Content" value={editingData?.content || ""} onChange={(e) => setEditingData({ ...editingData, content: e.target.value })} fullWidth variant="outlined" multiline rows={6} />
          <Box>
            <label>Image URLs</label>
            {imageUrls.map((url, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TextField value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} fullWidth variant="outlined" sx={{ mr: 2 }} />
                <Tooltip title="Remove">
                  <IconButton color="error" onClick={() => handleRemoveImageUrl(index)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddImageUrl} sx={{ width: "100%" }}>
              Add Image URL
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: "bold",
            padding: "8px 16px",
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditNews;
