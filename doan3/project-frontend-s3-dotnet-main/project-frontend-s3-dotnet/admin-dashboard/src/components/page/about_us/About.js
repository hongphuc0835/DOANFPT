import React, { useState, useEffect } from "react";
import { Table, Button, TextField, Box, IconButton, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Tooltip, Pagination, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, Alert, TableCell, TableBody, TableRow, TableHead, LinearProgress } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add, SearchOutlined, Delete, Info } from "@mui/icons-material";
import { Link } from "react-router-dom";
import View from "./View";
import Edit from "./Edit";
import AboutService from "./AboutService";

const About = () => {
  const [aboutList, setAboutList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingData, setEditingData] = useState(null);
  const [viewingAboutId, setViewingAboutId] = useState(null);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showEditingModal, setShowEditingModal] = useState(false);
  const [message, setMessage] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(5); // Default to 5 rows per page
  const [page, setPage] = useState(1); // Default to first page
  const [selectedAbout, setSelectedAbout] = useState([]); // Track selected about items
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // State for delete dialog
  const [aboutToDelete, setAboutToDelete] = useState(null); // Store aboutId for deletion

  useEffect(() => {
    fetchAllAbout();
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
      }, 25);

      const timeout = setTimeout(() => {
        setMessage(null);
        clearInterval(interval);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [message, setMessage]);

  const fetchAllAbout = async () => {
    setLoading(true);
    try {
      const data = await AboutService.getAll();
      setAboutList(data);
    } catch (error) {
      setMessage("Failed to fetch about?.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (aboutId) => {
    setViewingAboutId(aboutId);
    setShowViewingModal(true);
  };

  const handleEditDetails = (aboutId) => {
    const aboutToEdit = aboutList.find((about) => about?.aboutId === aboutId);
    setEditingData(aboutToEdit);
    setShowEditingModal(true);
  };

  const handleDeleteAbout = async () => {
    if (aboutToDelete) {
      try {
        await AboutService.delete(aboutToDelete);
        setMessage("About deleted successfully.");

        fetchAllAbout(); // Refresh the list
      } catch (error) {
        setMessage("Failed to delete about?.");
      }
    } else if (selectedAbout?.length > 0) {
      try {
        await Promise.all(selectedAbout?.map(async (aboutId) => await AboutService.delete(aboutId)));
        setMessage("Selected about deleted successfully.");

        fetchAllAbout(); // Refresh the list
      } catch (error) {
        setMessage("Failed to delete selected about?.");
      }
    }
    setOpenDeleteDialog(false); // Close the dialog after deletion
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
    setPage(1); // Reset to first page when changing rows per page
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleSelectAbout = (aboutId) => {
    setSelectedAbout((prev) => (prev.includes(aboutId) ? prev.filter((id) => id !== aboutId) : [...prev, aboutId]));
  };

  const filteredAbout = aboutList.filter((about) => about?.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination: calculate the about to display based on current page and rows per page
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageAbout = filteredAbout?.slice(startIndex, endIndex);

  const handleOpenDeleteDialog = (aboutId = null) => {
    setAboutToDelete(aboutId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setAboutToDelete(null);
    setSelectedAbout([]); // Deselect all items
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAbout(filteredAbout?.map((about) => about?.aboutId));
    } else {
      setSelectedAbout([]);
    }
  };

  const handleEditSave = async (editedAbout) => {
    try {
      await AboutService.update(editedAbout?.aboutId, editedAbout);
      setMessage("About updated successfully!");

      fetchAllAbout(); // Refresh the list
      setShowEditingModal(false); // Close the edit modal
    } catch (error) {
      setMessage(error);
    }
  };
  return (
    <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2, margin: 5 }}>
      {/* Header Section */}
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          About Management
        </Typography>
      </Grid>
      <Link to="/add_about" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="primary" size="large" startIcon={<Add />} sx={{ minWidth: 180, marginLeft: 2 }}>
          Add About
        </Button>
      </Link>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
        {/* Search Field */}
        <Box sx={{ display: "flex", alignItems: "center", padding: 1, borderRadius: 2, flex: 1 }}>
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
          {/* Rows Per Page Selector */}
          <FormControl sx={{ marginLeft: 2 }}>
            <InputLabel>Rows</InputLabel>
            <Select value={rowsPerPage} onChange={handleRowsPerPageChange} label="Rows per page">
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Delete Selected About Button */}
        <Tooltip title="Delete selected about">
          <Button variant="outlined" color="error" onClick={() => handleOpenDeleteDialog()} startIcon={<Delete />} sx={{ minWidth: 180, marginLeft: 2 }}>
            Delete Selected
          </Button>
        </Tooltip>
      </Box>

      {/* Loading or Table */}
      {loading ? (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ marginTop: 3 }}>
          Loading...
        </Typography>
      ) : (
        <Table
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            "& th": {
              textAlign: "left",
              fontWeight: "bold",
              padding: "12px",
              backgroundColor: "#f5f5f5",
              color: "#333",
              borderBottom: "2px solid #ddd",
            },
            "& td": {
              padding: "12px",
              borderBottom: "1px solid #ddd",
            },
            "& tr:hover": {
              backgroundColor: "#f9f9f9",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell>
                <Checkbox onChange={handleSelectAll} checked={selectedAbout?.length === filteredAbout?.length && filteredAbout?.length > 0} indeterminate={selectedAbout?.length > 0 && selectedAbout?.length < filteredAbout?.length} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentPageAbout?.map((about) => (
              <TableRow key={about?.aboutId}>
                <TableCell>{about?.fullName}</TableCell>
                <TableCell>{about?.role}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => handleViewDetails(about?.aboutId)} color="primary" size="small">
                      <Info />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Details">
                    <IconButton onClick={() => handleEditDetails(about?.aboutId)} color="success" size="small">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleOpenDeleteDialog(about?.aboutId)} color="error" size="small">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Checkbox checked={selectedAbout?.includes(about?.aboutId)} onChange={() => handleSelectAbout(about?.aboutId)} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      <Pagination
        count={Math.ceil(filteredAbout?.length / rowsPerPage)} // Calculate total pages
        page={page}
        onChange={handleChangePage}
        shape="rounded"
        sx={{ display: "flex", justifyContent: "center", margin: 2 }}
      />

      <View aboutId={viewingAboutId} visible={showViewingModal} onClose={() => setShowViewingModal(false)} />
      <Edit
        aboutData={editingData}
        visible={showEditingModal}
        onClose={() => setShowEditingModal(false)}
        onSave={fetchAllAbout} // Re-fetch about on save
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>{aboutToDelete ? `Are you sure you want to delete about "${aboutList.find((about) => about?.aboutId === aboutToDelete)?.fullName || "Unknown Title"}"?` : `Are you sure you want to delete ${selectedAbout?.length} selected about item(s)?`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAbout} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Edit
        aboutData={editingData}
        visible={showEditingModal}
        onClose={() => setShowEditingModal(false)}
        onSave={handleEditSave} // Pass the handler for save
      />
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

export default About;
