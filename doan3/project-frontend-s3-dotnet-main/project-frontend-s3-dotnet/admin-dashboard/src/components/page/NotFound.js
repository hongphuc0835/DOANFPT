import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // Import file CSS cho hiệu ứng

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-emoji">😕</div>
        <h1 className="notfound-title">404</h1>
        <p className="notfound-message">Oops! The page you are looking for is not here.</p>
        <Link to="/" className="back-home-btn">Go Back Dashboard</Link>
      </div>
    </div>
  );
};

export default NotFound;
