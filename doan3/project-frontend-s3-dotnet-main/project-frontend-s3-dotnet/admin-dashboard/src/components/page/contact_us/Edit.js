import React from "react";
import { Modal, Box, Typography, TextField, Button, Grid, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

const Edit = ({ editingContactId, setEditingContactId, editingData, setEditingData, handleEditSave }) => {
  return (
    <Modal open={!!editingContactId} onClose={() => setEditingContactId(null)} aria-labelledby="edit-contact-modal" aria-describedby="modal-for-editing-contact">
      <Box
        sx={{
          width: "70%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 3,
          backgroundColor: "white",
          borderRadius: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 24,
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
            Contact Edit
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setEditingContactId(null)}
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

        <form onSubmit={handleEditSave}>
          <Grid container spacing={2}>
            {/* Company Name Input */}
            <Grid item xs={12} sm={6}>
              <TextField label="Company Name" fullWidth value={editingData?.companyName || ""} onChange={(e) => setEditingData({ ...editingData, companyName: e.target.value })} required sx={{ padding: "10px" }} />
            </Grid>

            {/* Email Input */}
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth value={editingData?.email || ""} onChange={(e) => setEditingData({ ...editingData, email: e.target.value })} required sx={{ padding: "10px" }} />
            </Grid>

            {/* Address Input */}
            <Grid item xs={12}>
              <TextField label="Address" fullWidth value={editingData?.address || ""} onChange={(e) => setEditingData({ ...editingData, address: e.target.value })} multiline rows={4} sx={{ padding: "10px" }} />
            </Grid>

            {/* Phone Number Input */}
            <Grid item xs={12}>
              <TextField label="Phone Number" fullWidth value={editingData?.phoneNumber || ""} onChange={(e) => setEditingData({ ...editingData, phoneNumber: e.target.value })} sx={{ padding: "10px" }} />
            </Grid>

            {/* Buttons */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Modal>
  );
};

export default Edit;
