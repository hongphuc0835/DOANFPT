import { useState, useEffect } from "react";
import { Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, CircularProgress, Avatar, Box } from "@mui/material";
import UsersService from "../users/UsersService";

const NewUsers = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        const response = await UsersService.getAllUsers(); // Fetch all users
        const sortedUsers = response
          .sort((a, b) => b.userId - a.userId) // Sort by ID (newest first)
          .slice(0, 5); // Take the top 5 users

        setTableData(sortedUsers);
      } catch (err) {
        console.error("API error:", err);
        setError("");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // Runs only once when the component is mounted

  return (
    <Card
      sx={{
        boxShadow: 3,
        backgroundColor: "#ffffff",
        borderRadius: 2,
        width: "100%",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", textAlign: "center", padding: 2 }}>
        New Users
      </Typography>

      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "0 auto" }} />
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
      ) : (
        <TableContainer>
          <Table sx={{ borderCollapse: "collapse" }} aria-label="new users table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: "bold", paddingLeft: 3, textAlign: "center" }}>User</TableCell>
                <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Joined Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f9f9f9",
                    },
                    transition: "background-color 0.3s ease", // Smooth hover transition
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        alt={user.fullName}
                        src={user.avatarUrl || ""}
                        sx={{
                          marginRight: 2,
                          width: 40, // Adjusted avatar size
                          height: 40, // Adjusted avatar size
                          borderRadius: "50%", // Ensuring avatar is circular
                        }}
                      />
                      <Typography sx={{ fontWeight: 500, fontSize: "1rem", color: "#333" }}>{user.fullName}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 400, fontSize: "0.875rem", color: "#777" }}>{user.email}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: "#555", fontSize: "0.875rem" }}>
                    {user.publishedDate
                      ? new Date(user.publishedDate).toLocaleString("en-US", {
                          weekday: "long", // Tên ngày trong tuần
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
};

export default NewUsers;
