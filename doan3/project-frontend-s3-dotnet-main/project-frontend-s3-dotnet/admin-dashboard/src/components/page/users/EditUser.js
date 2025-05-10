import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, Select, MenuItem, Button, Typography, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

const EditUser = ({ open, editingUser, setEditingUser, handleSaveEdit, handleClose }) => {
  if (!editingUser) return null;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
          Edit User
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
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
        <TextField label="Avatar" value={editingUser?.avatar || ""} fullWidth margin="normal" onChange={(e) => setEditingUser({ ...editingUser, avatar: e.target.value })} />
        <TextField label="Full Name" value={editingUser?.fullName || ""} fullWidth margin="normal" onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })} />
        <TextField label="Phone" value={editingUser?.phone || ""} fullWidth margin="normal" onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} />
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select label="Gender" value={editingUser?.gender || ""} onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value })}>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
        <TextField label="Address" value={editingUser?.address || ""} fullWidth margin="normal" onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })} />
        <TextField label="Birthday" type="date" value={editingUser?.birthDay || ""} fullWidth margin="normal" onChange={(e) => setEditingUser({ ...editingUser, birthDay: e.target.value })} InputLabelProps={{ shrink: true }} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSaveEdit}
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

export default EditUser;
