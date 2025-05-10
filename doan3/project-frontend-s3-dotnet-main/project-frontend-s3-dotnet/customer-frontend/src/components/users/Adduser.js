import React, { useState } from 'react';
import UsersService from './UsersService';
import Sidebar from '../menu/Sidebar';
import ContentHeader from '../menu/ContentHeader';
import './Adduser.css';

const Adduser = () => {
  // Initialize state for new user
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  // State to manage success or error messages
  const [message, setMessage] = useState({ text: '', type: '' });

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    // Kiểm tra dữ liệu trước khi gửi
    console.log(newUser);

    // Kiểm tra tính hợp lệ của email và số điện thoại
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{10,15}$/;

    if (!emailRegex.test(newUser.email)) {
      setMessage({ text: 'Invalid email format!', type: 'error' });
      return;
    }

    if (!phoneRegex.test(newUser.phone)) {
      setMessage({ text: 'Invalid phone number!', type: 'error' });
      return;
    }

    try {
      // Gọi UsersService.register với các tham số riêng biệt
      await UsersService.register(newUser.email, newUser.password, newUser.fullName, newUser.phone);
      setMessage({ text: 'User added successfully!', type: 'success' });
      setNewUser({ fullName: '', email: '', password: '', phone: '' });
    } catch (error) {
      console.error('Error adding user:', error.response?.data || error.message);
      setMessage({ text: 'Failed to add user. Please check the console for more details.', type: 'error' });
    }
  };

  return (
    <div className="main">
      <Sidebar />
      <div className="content">
        <ContentHeader />
        <div className="main-content">
          <div className="adduser">
            <h2 className="adduser-title">Add User</h2>

            <form onSubmit={handleAddUser} className="addnews-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter the Full Name"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter the email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter the password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="form-password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter the phone number"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="submit-btn">Add User</button>
              </div>
            </form>
                        {/* Display message */}
                        {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adduser;
