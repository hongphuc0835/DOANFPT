import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Headers from "./components/Headers/Headers";
import Home from "./components/Home/Home";
import Contact from "./components/ContactUs/contact";
import Login from "./components/login/Login";
import UserProfile from "./components/CRUD/UserProfile";
import ChangePassword from "./components/CRUD/ChangePassword";
import NewsList from "./components/New/NewsList";
import NewsDetail from "./components/New/NewsDetail";
import AboutList from "./components/AboutUs/AboutList";
import Footer from "./components/Footer/Footer";
import TermsPolicy from "./components/termsPolicy/TermsPolicy";
import Tour from "./components/Tour/tour";
import TourList from "./components/Tour/TourList";
import TourDetail from "./components/Tour/tourdetail";
import Booking from "./components/Booking/Booking";
import BookingList from "./components/Booking/BookingList";
import BookingDetail from "./components/Booking/BookingDetail";
import axios from "axios";

function App() {
  const [userEmail, setUserEmail] = useState(null);
  const location = useLocation(); // Để lấy đường dẫn hiện tại

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      setUserEmail(email);
    }
  }, []);

  const hideFooterPaths = ["/login", "/register", "/userprofile", "/change-password", "/forgot-password"];

  const showFooter = !hideFooterPaths.includes(location.pathname) && !location.pathname.startsWith("/NewsDetail/");

  useEffect(() => {
    fetchAllDestinations();
    fetchAllTours();
  }, []);

  const fetchAllTours = async () => {
    try {
      const response = await axios.get("http://localhost:5089/api/tour/GetAllWithTours");
      const sortedTours = response.data.sort((a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId));

      localStorage.setItem("tours", JSON.stringify(sortedTours));
    } catch (error) {
      console.log("Error");
    }
  };

  // Fetch all destinations with tours
  const fetchAllDestinations = async () => {
    try {
      const response = await axios.get("http://localhost:5089/api/destination/getAllDestinationsWithTours");

      localStorage.setItem("destinations", JSON.stringify(response.data));

      // Cache the fetched data for future use
    } catch (error) {
      console.log("error");
    }
  };

  return (
    <div>
      <Headers userEmail={userEmail} setUserEmail={setUserEmail} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<AboutList />} />

        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login setUserEmail={setUserEmail} />} />
        <Route path="/userprofile" element={<UserProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/news" element={<NewsList />} />
        <Route path="/NewsDetail/:newsId" element={<NewsDetail />} />
        <Route path="/terms-policy" element={<TermsPolicy />} />
        <Route path="/tours" element={<Tour />} />
        <Route path="/tour-list/:name" element={<TourList />} />
        <Route path="/tour/:tourId" element={<TourDetail />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/booking_list" element={<BookingList />} />
        <Route path="/booking_list/:bookingId" element={<BookingDetail />} />
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
