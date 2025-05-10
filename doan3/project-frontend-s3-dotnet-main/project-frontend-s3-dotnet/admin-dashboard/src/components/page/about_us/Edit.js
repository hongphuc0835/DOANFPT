import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, IconButton, Typography, Tooltip } from "@mui/material";
import { Add as AddIcon, Close, Delete as DeleteIcon } from "@mui/icons-material";

const Edit = ({ aboutData, visible, onClose, onSave }) => {
  const [editingData, setEditingData] = useState(aboutData);
  const [imageUrls, setImageUrls] = useState(editingData?.imageUrl?.split(";") || []);

  useEffect(() => {
    setEditingData(aboutData);
    setImageUrls(aboutData?.imageUrl?.split(";") || []);
  }, [aboutData]);

  const handleImageUrlChange = (index, value) => {
    const updatedImageUrls = [...imageUrls];
    updatedImageUrls[index] = value;
    setImageUrls(updatedImageUrls);
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const handleRemoveImageUrl = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleEditSave = () => {
    const imageUrlString = imageUrls.filter((url) => url.trim()).join(";");
    onSave({ ...editingData, imageUrl: imageUrlString }); // Notify parent to save the changes
  };

  return (
    <Dialog open={visible} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
          Edit About
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
        <Box component="form" noValidate autoComplete="off" sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <TextField label="Name" value={editingData?.fullName || ""} onChange={(e) => setEditingData({ ...editingData, fullName: e.target.value })} fullWidth variant="outlined" />
          <TextField label="Role" value={editingData?.role || ""} onChange={(e) => setEditingData({ ...editingData, role: e.target.value })} fullWidth variant="outlined" />
          <TextField label="Description" value={editingData?.description || ""} onChange={(e) => setEditingData({ ...editingData, description: e.target.value })} fullWidth variant="outlined" multiline rows={4} />
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Image URLs
            </Typography>
            {imageUrls.map((url, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TextField value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} fullWidth variant="outlined" sx={{ mr: 2 }} />
                <Tooltip title="Remove">
                  <IconButton color="error" onClick={() => handleRemoveImageUrl(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddImageUrl} sx={{ width: "100%", textTransform: "none" }}>
              Add Image URL
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button
          onClick={handleEditSave}
          color="primary"
          variant="contained"
          fullWidth
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

export default Edit;
