import React, { useState, useEffect } from 'react';
import Sidebar from '../menu/Sidebar';
import ContentHeader from '../menu/ContentHeader';
import UsersService from './UsersService';
import './Users.css';

// Helper function to format phone numbers
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

// Component to display the list of users
const UserList = ({ users, onDelete, onEdit }) => (
  <div className="user-list">
    <h3>User List</h3>
    <table className="user-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{user.fullName}</td>
            <td>{user.email}</td>
            <td 
              title={user.phone} 
              style={{ letterSpacing: '1px' }}
            >
              {formatPhoneNumber(user.phone)}
            </td>
            <td className="actions">
              <button onClick={() => onEdit(user)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => onDelete(user)} className="delete-btn">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Users = () => {
  const [userEmail, setUserEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Retrieve user email from localStorage
  useEffect(() => {
    const emailFromStorage = localStorage.getItem('userEmail');
    if (emailFromStorage) setUserEmail(emailFromStorage);
  }, []);

  // Fetch users data when the component is mounted
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await UsersService.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        alert('Error loading user list.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle search functionality
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  // Handle user deletion
  const handleDelete = async (userToDelete) => {
    if (!userToDelete?.userId) {
      alert('Cannot delete user: ID is undefined.');
      return;
    }

    try {
      await UsersService.deleteUser(userToDelete.userId);
      alert(`Deleted user: ${userToDelete.fullName}`);
      setUsers(users.filter((user) => user.userId !== userToDelete.userId));
      setFilteredUsers(filteredUsers.filter((user) => user.userId !== userToDelete.userId));
    } catch (error) {
      alert(error.message || 'An error occurred while deleting the user.');
    }
  };

  // Handle user edit
  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit);
    setIsEditing(true);
  };

  // Save edited user details
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    try {
      await UsersService.updateUser(editingUser);

      setUsers(users.map((user) =>
        user.email === editingUser.email ? { ...editingUser } : user
      ));
      setFilteredUsers(filteredUsers.map((user) =>
        user.email === editingUser.email ? { ...editingUser } : user
      ));
    } catch (error) {
      alert(error.message || 'An error occurred while updating the user.');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="main">
      <Sidebar />
      <div className="content">
        <ContentHeader userEmail={userEmail} />
        <div className="main-content">
          <div className="user-content">
            <div className="user-controls">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            {isLoading ? (
              <p>Loading user list...</p>
            ) : (
              <UserList
                users={filteredUsers}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            )}
          </div>

          {/* Modal for editing user */}
          {isEditing && (
            <div className="modal-overlay">
              <div className="edit-modal">
                <h2 className="modal-header">Edit User</h2>
                <form onSubmit={handleSaveEdit}>
                  <div className="form-group">
                    <label>Full Name:</label>
                    <input
                      type="text"
                      value={editingUser.fullName}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, fullName: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number:</label>
                    <input
                      type="text"
                      value={editingUser.phone}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="save-btn">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
