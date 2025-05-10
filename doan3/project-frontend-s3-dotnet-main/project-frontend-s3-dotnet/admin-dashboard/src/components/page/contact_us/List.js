import React, { useState } from "react";
import { Card, Avatar, Typography, IconButton, Tooltip, Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid } from "@mui/material";
import { Info, EditOutlined, DeleteOutlined, VerifiedUserOutlined } from "@mui/icons-material";

const List = ({ contactList, currentPage, itemsPerPage, loading, handleViewDetails, handleEditStart, handleDeleteContact }) => {
  const [open, setOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

  const handleDialogClose = () => {
    setOpen(false);
    setSelectedContactId(null);
  };

  const handleDialogOpen = (contactId) => {
    setOpen(true);
    setSelectedContactId(contactId);
  };

  const handleDeleteConfirm = () => {
    handleDeleteContact(selectedContactId);
    handleDialogClose();
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phoneNumber;
  };

  return (
    <>
      <Grid container spacing={3}>
        {contactList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.contactId}>
            <Card
              sx={{
                borderRadius: "16px",
                backgroundColor: "#f9fafc",
                padding: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ backgroundColor: "#4caf50" }}>
                    <VerifiedUserOutlined />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: "600", color: "#333" }}>
                    {item.companyName}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: item.status === "Active" ? "green" : "red",
                  }}
                >
                  {item.status || "Active"}
                </Typography>
              </Box>

              <Box>
                <Box mb={1}>
                  <Typography variant="body2" color="text.primary" fontWeight="bold">
                    Email:
                  </Typography>
                  <Typography variant="body2" noWrap color="text.secondary">
                    {item.email}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography variant="body2" color="text.primary" fontWeight="bold">
                    Phone:
                  </Typography>
                  <Typography variant="body2" noWrap color="text.secondary">
                    {formatPhoneNumber(item.phoneNumber)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.primary" fontWeight="bold">
                    Address:
                  </Typography>
                  <Typography variant="body2" noWrap color="text.secondary">
                    {item.address}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" justifyContent="space-around" mt={2}>
                <Tooltip title="View Details">
                  <IconButton onClick={() => handleViewDetails(item.contactId)} color="primary">
                    <Info />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Contact">
                  <IconButton onClick={() => handleEditStart(item)} color="success">
                    <EditOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Contact">
                  <IconButton onClick={() => handleDialogOpen(item.contactId)} color="error">
                    <DeleteOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this contact?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default List;
