import React from "react";
import { Dialog, DialogContent, DialogTitle, Typography, Box, Avatar, Divider, Grid, IconButton } from "@mui/material";
import { PhoneOutlined, EmailOutlined, LocationOnOutlined, PeopleOutlined, CalendarTodayOutlined, Close } from "@mui/icons-material";

const ViewUser = ({ viewingUser, open, onClose }) => {
  if (!viewingUser) return null;

  const formatDate = (date) => {
    return date
      ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(date))
      : "Invalid Date";
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ padding: 2, position: "relative" }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center" }}>
          User Details
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
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Avatar sx={{ width: 100, height: 100, mb: 2 }} alt={viewingUser.fullName} src={viewingUser.avatar || "/default-avatar.png"} />
          <Typography variant="h5" fontWeight="bold">
            {viewingUser.fullName}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {viewingUser.email}
          </Typography>

          <Divider sx={{ my: 2, width: "100%" }} />

          <Grid container spacing={3} sx={{ width: "100%" }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PhoneOutlined sx={{ mr: 1 }} />
                <Typography variant="body1">{viewingUser.phone || "N/A"}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <EmailOutlined sx={{ mr: 1 }} />
                <Typography variant="body1">{viewingUser.email || "N/A"}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <LocationOnOutlined sx={{ mr: 1 }} />
                <Typography variant="body1">{viewingUser.address || "N/A"}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <PeopleOutlined sx={{ mr: 1 }} />
                <Typography variant="body1">{viewingUser.gender || "N/A"}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarTodayOutlined sx={{ mr: 1 }} />
                <Typography variant="body1">{viewingUser.birthDay || "N/A"}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" fontWeight="bold">
                  Joined:
                </Typography>
                <Typography variant="body1" sx={{ ml: 1 }}>
                  {formatDate(viewingUser.publishedDate || "N/A")}
                </Typography>
              </Box>
            </Grid>
            {viewingUser.updatedDate && (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1" fontWeight="bold">
                    Last Updated:
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {new Date(viewingUser.updatedDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUser;
