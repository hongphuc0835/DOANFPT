import React, { useState } from "react";
import { Typography, Dialog, DialogTitle, DialogContent, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

const BookingText = ({ text }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Kiểm tra nếu text là undefined hoặc null, và sử dụng chuỗi rỗng thay thế
  const safeText = text || "";

  return (
    <>
      {/* Display truncated text */}
      <Typography
        variant="body2"
        sx={{ cursor: "pointer" }}
        onClick={handleOpen} // Open dialog on click
      >
        {safeText.length > 30 ? `${safeText.substring(0, 30)}...` : safeText}
      </Typography>

      {/* Dialog for full text */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
        <DialogTitle>Full Note</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {safeText}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingText;
