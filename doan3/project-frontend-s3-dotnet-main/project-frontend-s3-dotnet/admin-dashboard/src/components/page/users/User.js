import React, { useState, useEffect } from "react";
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Tooltip, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Alert, Box, Pagination, FormControl, Select, InputLabel, MenuItem, Grid } from "@mui/material";
import { Add, Delete, DeleteOutlined, EditOutlined, Info, SearchOutlined } from "@mui/icons-material";
import UsersService from "./UsersService"; // Assume this is your API service
import ViewUser from "./ViewUser";
import EditUser from "./EditUser";
import { Link } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);
  const [viewingUserModalVisible, setViewingUserModalVisible] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const [page, setPage] = useState(1); // Initialize page to 1
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(event.target.value);
    setPage(1); // Reset page to 1 when rows per page changes
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await UsersService.getAllUsers();
        const sortedData = data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
        setOriginalUsers(sortedData);
        setUsers(sortedData);
      } catch (error) {
        setMessage("Error loading user list.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Paginated users (Only 1 user per page)
  const paginatedUsers = users.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      setUsers(originalUsers);
    } else {
      const filtered = originalUsers.filter((user) => user.roleId === 2 && (user.fullName.toLowerCase().includes(value.toLowerCase()) || user.email.toLowerCase().includes(value.toLowerCase())));
      setUsers(filtered);
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      if (userToDelete) {
        await UsersService.deleteUser(userToDelete.userId);
        setUsers((prev) => prev.filter((user) => user.userId !== userToDelete.userId));
        setMessage("User deleted successfully!");
      } else {
        await Promise.all(selectedUserIds.map((userId) => UsersService.deleteUser(userId)));
        setUsers((prev) => prev.filter((user) => !selectedUserIds.includes(user.userId)));
        setMessage("Selected users deleted successfully!");

        setSelectedUserIds([]);
      }
    } catch (error) {
      setMessage(" Failed deleting user(s).");
    } finally {
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user || null);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((user) => user.userId));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectUser = (e, userId) => {
    if (e.target.checked) {
      setSelectedUserIds((prev) => [...prev, userId]);
    } else {
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  // Edit
  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await UsersService.updateUser(editingUser);
      const updatedUsers = users.map((user) => (user.userId === editingUser.userId ? editingUser : user));
      setUsers(updatedUsers);
      setMessage("User updated successfully!"); // Display success message

      setIsEditing(false);
    } catch (error) {
      setMessage("Failed updating the user!"); // Display error message
    }
  };
  const handleCloseEditDialog = () => {
    setIsEditing(false);
    setEditingUser(null);
  };

  // View
  const handleViewDetails = async (userId) => {
    try {
      const user = await UsersService.getUserData(userId);
      setViewingUser(user);
      setViewingUserModalVisible(true);
    } catch (error) {
      setMessage("Failed view the user!");
    }
  };

  const closeViewingUserModal = () => {
    setViewingUserModalVisible(false);
    setViewingUser(null);
  };

  const columns = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
    },
    { title: "Name", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    { title: "Gender", dataIndex: "gender" },
    { title: "Status", dataIndex: "status" },

    {
      title: "Actions",
      render: (_, record) => (
        <>
          <Tooltip title="View Details">
            <IconButton onClick={() => handleViewDetails(record.userId)} color="primary">
              <Info />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(record)} color="success">
              <EditOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleOpenDeleteDialog(record)}>
              <DeleteOutlined />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
    {
      title: <Checkbox onChange={handleSelectAll} checked={selectedUserIds.length === users.length && users.length > 0} indeterminate={selectedUserIds.length > 0 && selectedUserIds.length < users.length} />,
      render: (_, record) => <Checkbox checked={selectedUserIds.includes(record.userId)} onChange={(e) => handleSelectUser(e, record.userId)} />,
    },
  ];

  return (
    <Paper sx={{ padding: 3, boxShadow: 3, borderRadius: 2, margin: 5 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ marginBottom: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Users Management
        </Typography>
      </Grid>
      <Link to="/adduser" style={{ textDecoration: "none" }}>
        <Button variant="contained" color="primary" size="large" startIcon={<Add />} sx={{ minWidth: 180, marginLeft: 2 }}>
          Add New User
        </Button>
      </Link>
      {/* Search and Delete Buttons on the same row */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
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

        {/* Delete Selected Users Button */}
        <Tooltip title="Delete selected users">
          <Button variant="outlined" color="error" onClick={() => handleOpenDeleteDialog(null)} startIcon={<Delete />} sx={{ minWidth: 180, marginLeft: 2 }}>
            Delete Selected Users
          </Button>
        </Tooltip>
      </Box>

      {/* Loading or Table */}
      {isLoading ? (
        <Typography variant="body1" color="textSecondary" align="center" sx={{ marginTop: 3 }}>
          Loading...
        </Typography>
      ) : (
        <Table sx={{ minWidth: 650 }} aria-label="user table">
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell key={idx} sx={{ fontWeight: "bold", color: "text.primary", backgroundColor: "#f7f7f7", padding: "12px 16px" }}>
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user, index) => (
              <TableRow hover key={user.userId} sx={{ "&:hover": { backgroundColor: "#f1f1f1" } }}>
                {columns.map((col, idx) => (
                  <TableCell key={idx} sx={{ padding: "12px 16px" }}>
                    {col.render ? col.render(user, user, index) : user[col.dataIndex]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {/* Pagination */}
      <Pagination
        count={Math.ceil(users.length / rowsPerPage)} // Calculate total pages
        page={page}
        onChange={handleChangePage}
        shape="rounded"
        sx={{ display: "flex", justifyContent: "center", margin: 2 }}
      />

      {/* Edit User Dialog */}
      <EditUser open={isEditing} editingUser={editingUser} setEditingUser={setEditingUser} handleSaveEdit={handleSaveEdit} handleClose={handleCloseEditDialog} />

      {/* View User Details Modal */}
      <ViewUser viewingUser={viewingUser} open={viewingUserModalVisible} onClose={closeViewingUserModal} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>{userToDelete ? `Are you sure you want to delete user "${userToDelete.fullName}"?` : `Are you sure you want to delete ${selectedUserIds.length} selected user(s)?`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {message && (
        <Box sx={{ mt: 2, position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
          <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>
        </Box>
      )}
    </Paper>
  );
};

export default UserManagement;
