import React, { useState, useEffect } from "react";
import { Table, Button, TextField, Box, IconButton, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Pagination, Dialog, DialogActions, DialogContent, DialogTitle, Checkbox, Alert, Tooltip, LinearProgress } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add, SearchOutlined, Info, Delete } from "@mui/icons-material";
import { Link } from "react-router-dom";
import ViewNews from "./ViewNews";
import EditNews from "./EditNews";
import NewsService from "./NewsService";

const News = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingData, setEditingData] = useState(null);
  const [viewingNewsId, setViewingNewsId] = useState(null);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [showEditingModal, setShowEditingModal] = useState(false);
  const [message, setMessage] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [selectedNews, setSelectedNews] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);

  useEffect(() => {
    fetchAllNews();
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

  const fetchAllNews = async () => {
    setLoading(true);
    try {
      const data = await NewsService.getAllNews();
      const sortedData = data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      setNewsList(sortedData);
    } catch (error) {
      setMessage("Failed to fetch news.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (newsId) => {
    setViewingNewsId(newsId);
    setShowViewingModal(true);
  };

  const handleEditDetails = (newsId) => {
    const newsToEdit = newsList.find((news) => news.newId === newsId);
    setEditingData(newsToEdit);
    setShowEditingModal(true);
  };

  const handleDeleteNews = async () => {
    if (newsToDelete) {
      try {
        await NewsService.deleteNews(newsToDelete);

        fetchAllNews();
      } catch (error) {}
    } else if (selectedNews.length > 0) {
      try {
        await Promise.all(selectedNews.map(async (newsId) => await NewsService.deleteNews(newsId)));

        fetchAllNews();
      } catch (error) {}
    }
    setOpenDeleteDialog(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
    setPage(1);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleSelectNews = (newsId) => {
    setSelectedNews((prev) => (prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId]));
  };

  const filteredNews = newsList.filter((news) => news.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageNews = filteredNews.slice(startIndex, endIndex);

  const handleOpenDeleteDialog = (newsId = null) => {
    setNewsToDelete(newsId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setNewsToDelete(null);
    setSelectedNews([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedNews(filteredNews.map((news) => news.newId));
    } else {
      setSelectedNews([]);
    }
  };

  // Move handleEditSave to here
  const handleEditSave = async (updatedData) => {
    try {
      await NewsService.updateNews(updatedData.newId, updatedData);
      setMessage("News updated successfully!");

      fetchAllNews();
      setShowEditingModal(false);
    } catch (error) {}
  };

  return (
    <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2, margin: 5 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          News Management
        </Typography>
      </Grid>
      <Link to="/addnews" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="primary" size="large" startIcon={<Add />} sx={{ minWidth: 180, marginLeft: 2 }}>
          Add News
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
        <Tooltip title="Delete selected news">
          <Button variant="outlined" color="error" onClick={() => handleOpenDeleteDialog()} startIcon={<Delete />} sx={{ minWidth: 180, marginLeft: 2 }}>
            Delete Selected
          </Button>
        </Tooltip>
      </Box>

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
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Actions</th>
              <th>
                <Checkbox onChange={handleSelectAll} checked={selectedNews.length === filteredNews.length} />
              </th>
            </tr>
          </thead>
          <tbody>
            {currentPageNews.map((news) => (
              <tr key={news.newId}>
                <td>{news.title}</td>
                <td>{news.author}</td>
                <td>
                  <IconButton onClick={() => handleViewDetails(news.newId)} color="primary">
                    <Info />
                  </IconButton>
                  <IconButton onClick={() => handleEditDetails(news.newId)} color="success">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDeleteDialog(news.newId)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </td>
                <td>
                  <Checkbox checked={selectedNews.includes(news.newId)} onChange={() => handleSelectNews(news.newId)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Pagination count={Math.ceil(filteredNews.length / rowsPerPage)} page={page} onChange={handleChangePage} shape="rounded" sx={{ display: "flex", justifyContent: "center", margin: 2 }} />

      <ViewNews newsId={viewingNewsId} visible={showViewingModal} onClose={() => setShowViewingModal(false)} />
      <EditNews newsData={editingData} visible={showEditingModal} onClose={() => setShowEditingModal(false)} onSave={handleEditSave} />

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>{newsToDelete ? `Are you sure you want to delete news "${newsList.find((news) => news.newId === newsToDelete)?.title || "Unknown Title"}"?` : `Are you sure you want to delete ${selectedNews.length} selected news item(s)?`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteNews} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default News;
