import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Headers.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faUser, faBars } from "@fortawesome/free-solid-svg-icons";
import logo from "../Img/2-removebg-preview.png";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { ShoppingCart } from "@mui/icons-material";

function Headers() {
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();
  const location = useLocation();

  const [activeLink, setActiveLink] = useState(location.pathname);

  const [menuOpen, setMenuOpen] = useState(false); // State để toggle menu

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    localStorage.clear();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/aboutus" onClick={() => setActiveLink("/aboutus")}>
            <img src={logo} alt="Logo" className="logo-image" />
          </Link>
        </div>

        {/* Links chính */}
        <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
          <li className={`navbar-item ${activeLink === "/" ? "active" : ""}`}>
            <Link to="/" onClick={() => setActiveLink("/")}>
              Home
            </Link>
          </li>
          <li className={`navbar-item ${activeLink === "/tours" ? "active" : ""}`}>
            <Link to="/tours" onClick={() => setActiveLink("/tours")}>
              Tour
            </Link>
          </li>
          <li className={`navbar-item ${activeLink === "/aboutus" ? "active" : ""}`}>
            <Link to="/aboutus" onClick={() => setActiveLink("/aboutus")}>
              About Us
            </Link>
          </li>
          <li className={`navbar-item ${activeLink === "/news" ? "active" : ""}`}>
            <Link to="/news" onClick={() => setActiveLink("/news")}>
              News
            </Link>
          </li>

          <li className={`navbar-item ${activeLink === "/contact" ? "active" : ""}`}>
            <Link to="/contact" onClick={() => setActiveLink("/contact")}>
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Phần Login/Logout */}
        <div className="navbar-auth">
          {userEmail ? (
            <>
              <Link to="/userprofile" className="navbar-user-icon">
                <FontAwesomeIcon icon={faUser} className="user-icon" />
              </Link>
              <div className="navbar-bell" onClick={() => navigate("/booking_list")}>
                <ShoppingCart /> {/* Biểu tượng đẩy hàng */}
              </div>
              <button onClick={() => setOpen(true)} className="navbar-login-icon">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-login-icon">
              <FontAwesomeIcon icon={faRightToBracket} /> Sign in
            </Link>
          )}
        </div>
        {/* Menu icon */}
        <div className="navbar-toggle" onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} className="menu-icon" />
        </div>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Log out</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to log out?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="warning">
            Log out
          </Button>
        </DialogActions>
      </Dialog>
    </nav>
  );
}

export default Headers;
