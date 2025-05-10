import { Close } from "@mui/icons-material";
import { Modal, Box, Typography, Divider, DialogTitle, IconButton } from "@mui/material";

const View = ({ viewingContact, viewingContactModalVisible, closeViewingContactModal }) => {
  // Utility function for phone number formatting
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return "";
    const cleaned = phoneNumber.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/) || cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : phoneNumber;
  };

  // Utility function for date formatting
  const formatDate = (date) => {
    return date
      ? new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(date))
      : "Invalid Date";
  };

  // Reusable component for displaying key-value pairs
  const DetailBox = ({ label, value }) => (
    <Box sx={{ marginTop: 1 }}>
      <Typography variant="body1" sx={{ fontWeight: 600, color: "#4A4A4A" }}>
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ color: "#6C6C6C", marginTop: 0.5 }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Modal open={viewingContactModalVisible} onClose={closeViewingContactModal} aria-labelledby="contact-details-modal" aria-describedby="modal-for-viewing-contact-details">
      <Box
        sx={{
          width: "70%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 3,
          backgroundColor: "#fff",
          borderRadius: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 6, // Slightly stronger shadow for floating effect
        }}
      >
        <DialogTitle sx={{ position: "relative" }}>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: "center" }}>
            Contact Details
          </Typography>
          <IconButton
            aria-label="close"
            onClick={closeViewingContactModal}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider sx={{ marginY: 2 }} />
        <Typography variant="h6" sx={{ textAlign: "center", marginBottom: 2 }}>
          {viewingContact?.email}
        </Typography>
        <DetailBox label="Company Name" value={viewingContact?.companyName} />
        <DetailBox label="Address" value={viewingContact?.address} />
        <DetailBox label="Phone Number" value={formatPhoneNumber(viewingContact?.phoneNumber)} />
        <DetailBox label="Published Date" value={formatDate(viewingContact?.publishedDate)} />
        <DetailBox label="Updated Date" value={formatDate(viewingContact?.updatedDate)} />
      </Box>
    </Modal>
  );
};

export default View;
