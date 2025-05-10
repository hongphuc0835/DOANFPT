import React, { useState, useEffect } from "react";
import { Button, Typography, Box, Pagination, TextField, Paper, Grid, Alert, LinearProgress } from "@mui/material";
import { Add, SearchOutlined } from "@mui/icons-material";
import ContactService from "./ContactService";
import List from "./List";
import { Link } from "react-router-dom";

import View from "./View";
import Edit from "./Edit";

const Contact = () => {
  const [originalContactList, setOriginalContactList] = useState([]);
  const [contactList, setContactList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchAllContact();
  }, []);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (message) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + 1, 100);
          return newProgress;
        });
      }, 25); // 3s = 3000ms, chia cho 100 step => mỗi step là 30ms

      // Tự động xóa thông báo sau 3 giây
      const timeout = setTimeout(() => {
        setMessage(null); // hoặc setMessage("") tùy thuộc vào cách bạn định nghĩa
        clearInterval(interval); // Xóa interval
      }, 3000);

      // Cleanup interval và timeout nếu component unmount
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [message, setMessage]);

  const fetchAllContact = async () => {
    try {
      setLoading(true);
      const data = await ContactService.getAllContact();
      const sortedData = data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      setOriginalContactList(sortedData);
      setContactList(sortedData);
    } catch (error) {
      setMessage(error.message || error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (contact) => {
    setEditingContactId(contact.contactId);
    setEditingData({ ...contact });
  };

  const handleEditSave = async () => {
    try {
      await ContactService.updatecontact(editingContactId, editingData);
      setMessage("Contact updated successfully!");
      setEditingContactId(null);
      setEditingData(null);
      setContactList((prev) => prev.map((contact) => (contact.contactId === editingContactId ? { ...editingData } : contact)));
    } catch (error) {
      setMessage(error.message || error.toString());
    }
  };

  const handleDeleteContact = async (deleteContact) => {
    try {
      await ContactService.deleteContact(deleteContact);
      setMessage("Deleted contact successfully!");
      setContactList((prev) => prev.filter((contact) => contact.contactId !== deleteContact));
    } catch (error) {
      setMessage(error.message || error.toString());
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setContactList(originalContactList);
    } else {
      const filtered = originalContactList.filter((contact) => contact.companyName.toLowerCase().includes(value.toLowerCase()) || contact.email.toLowerCase().includes(value.toLowerCase()));
      setContactList(filtered);
    }
  };

  const [viewingContact, setViewingContact] = useState(null);
  const [viewingContactModalVisible, setViewingContactModalVisible] = useState(false);

  const handleViewDetails = async (contactId) => {
    try {
      const contact = await ContactService.getByIdContact(contactId);
      setViewingContact(contact);
      setViewingContactModalVisible(true);
    } catch (error) {
      setMessage(error.message || error.toString());
    }
  };

  const closeViewingContactModal = () => {
    setViewingContactModalVisible(false);
    setViewingContact(null);
  };

  return (
    <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2, margin: 5 }}>
      {/* Header Section */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Contact Management
        </Typography>
      </Grid>
      <Link to="/add_contact" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="primary" size="large" startIcon={<Add />} sx={{ minWidth: 180, marginLeft: 2 }}>
          Add Contact
        </Button>
      </Link>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          fullWidth
          margin="normal"
          sx={{ maxWidth: "350px", borderRadius: 2, "& .MuiOutlinedInput-root": { borderRadius: 2 }, "& .MuiInputLabel-root": { fontWeight: "bold" } }}
          InputProps={{
            startAdornment: <SearchOutlined sx={{ color: "text.secondary" }} />,
          }}
        />
      </Box>
      {loading ? (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ marginTop: 3 }}>
          Loading...
        </Typography>
      ) : (
        <List contactList={contactList} currentPage={currentPage} itemsPerPage={itemsPerPage} loading={loading} handleViewDetails={handleViewDetails} handleEditStart={handleEditStart} handleDeleteContact={handleDeleteContact} />
      )}
      <Pagination count={Math.ceil(contactList.length / itemsPerPage)} page={currentPage} onChange={(e, page) => setCurrentPage(page)} shape="rounded" sx={{ display: "flex", justifyContent: "center", margin: 2 }} />

      {/* View Modal */}
      <View viewingContact={viewingContact} viewingContactModalVisible={viewingContactModalVisible} closeViewingContactModal={closeViewingContactModal} />

      {/* Edit Modal */}
      <Edit editingContactId={editingContactId} setEditingContactId={setEditingContactId} editingData={editingData} setEditingData={setEditingData} handleEditSave={handleEditSave} />

      {/* Message */}
      <>
        <style>
          {`
      @keyframes slideInFromRight {
        0% {
          transform: translateX(100%); /* Start from 100% to the right */
          opacity: 0;
        }
        100% {
          transform: translateX(0); /* End at the original position */
          opacity: 1;
        }
      }
    `}
        </style>
        {message && (
          <Box
            sx={{
              position: "fixed",
              top: 20,
              right: 20,
              zIndex: 9999,
              background: "#1a1a1a",
              opacity: 0.95,
              fontSize: "1rem",
              lineHeight: "1.5em",
              borderRadius: "8px",
              padding: 2,

              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
              animation: "slideInFromRight 0.5s ease-in-out" /* Apply the new animation */,
            }}
            className="alert-box"
          >
            <Alert
              sx={{
                margin: 0,
                fontSize: "1rem",
                background: "transparent",

                textAlign: "center",

                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              severity={message.toLowerCase().includes("error") ? "error" : "success"}
            >
              {message}
            </Alert>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                width: "100%",
                height: "6px",
                borderRadius: "8px",
                backgroundColor: "#444",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: message.toLowerCase().includes("error") ? "#f44336" : "#4caf50",
                },
              }}
            />
          </Box>
        )}
      </>
    </Paper>
  );
};

export default Contact;
