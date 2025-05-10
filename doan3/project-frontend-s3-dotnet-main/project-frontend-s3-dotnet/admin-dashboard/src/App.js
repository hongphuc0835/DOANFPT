import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// Import pages
import Dashboard from "./components/page/dashboard/Dashboard";
import Users from "./components/page/users/User";
import AddUser from "./components/page/users/Adduser";
import NotFound from "./components/page/NotFound";
import ChangePassword from "./components/page/admins/ChangePassword";
import ProfileInfo from "./components/page/admins/ProfileInfo";
import News from "./components/page/news/News";
import Addnews from "./components/page/news/Addnews";
import About from "./components/page/about_us/About";
import AddAbout from "./components/page/about_us/AddAbout";
import Contact from "./components/page/contact_us/Contact";
import AddContact from "./components/page/contact_us/AddContact";
import Setting from "./components/page/admins/Setting";

import TourList from "./components/page/tour/TourList";
import TourDetail from "./components/page/tour/TourDetail.js";
import AddTour from "./components/page/tour/AddTour.js";
import Destination from "./components/page/tour/Destination.js";
import TourSchedule from "./components/page/tour/TourSchedule";
import Hotel from "./components/page/tour/Hotel.js";
import Restaurant from "./components/page/tour/Restaurant.js";
import Booking from "./components/page/booking/Booking.js";
import BookingDetail from "./components/page/booking/BookingDetail.js";
import BookingToday from "./components/page/booking/BookingToday.js";
import BookingCompleted from "./components/page/booking/BookingCompleted.js";
import Feedback from "./components/page/users/Feedback";

import Login from "./components/login/Login"; // Login page
import Register from "./components/login/Register";
import AvatarPage from "./components/page/admins/AvatarPage";
import Home from "./components/Home";
import A from "./components/Confirm.js";

import { ThemeProvider } from "./components/page/menu/ThemeContext";
import MainLayout from "./components/page/menu/MainLayout.js";
import ProtectedRoute from "./components/login/ProtectedRoute.js";
import axios from "axios";

function App() {
  useEffect(() => {
    fetchAllDestinations();
    fetchAllTours();
  }, []);

  const fetchAllTours = async () => {
    try {
      const response = await axios.get("http://localhost:5089/api/tour/GetAllWithTours");
      localStorage.setItem("tours", JSON.stringify(response.data));
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
    <ThemeProvider>
      <Routes>
        {/* Route cho login không có sidebar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/avatar" element={<AvatarPage />} />
        <Route path="/home" element={<Home />} />

        <Route path="/confirm/:name" element={<A />} />
        {/* Protected routes with sidebar */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/changepassword" element={<ProtectedRoute element={<ChangePassword />} />} />
          <Route path="/profileinfo" element={<ProtectedRoute element={<ProfileInfo />} />} />
          <Route path="/setting" element={<ProtectedRoute element={<Setting />} />} />

          <Route path="/tour" element={<ProtectedRoute element={<TourList />} />} />
          <Route path="/tour/:tourId" element={<ProtectedRoute element={<TourDetail />} />} />
          <Route path="/add_tour" element={<ProtectedRoute element={<AddTour />} />} />
          <Route path="/destination" element={<ProtectedRoute element={<Destination />} />} />
          <Route path="/tourschedule" element={<ProtectedRoute element={<TourSchedule />} />} />
          <Route path="/hotel" element={<ProtectedRoute element={<Hotel />} />} />
          <Route path="/restaurant" element={<ProtectedRoute element={<Restaurant />} />} />
          <Route path="/booking" element={<ProtectedRoute element={<Booking />} />} />
          <Route path="/booking/:bookingId" element={<ProtectedRoute element={<BookingDetail />} />} />
          <Route path="/booking_today" element={<ProtectedRoute element={<BookingToday />} />} />
          <Route path="/booking_completed" element={<BookingCompleted />} />
          <Route path="/feedback" element={<ProtectedRoute element={<Feedback />} />} />

          {/* Routes for Users, News, About, Contact */}
          <Route path="/users" element={<ProtectedRoute element={<Users />} />} />
          <Route path="/adduser" element={<ProtectedRoute element={<AddUser />} />} />
          <Route path="/news" element={<ProtectedRoute element={<News />} />} />
          <Route path="/addnews" element={<ProtectedRoute element={<Addnews />} />} />
          <Route path="/about_us" element={<ProtectedRoute element={<About />} />} />
          <Route path="/add_about" element={<ProtectedRoute element={<AddAbout />} />} />
          <Route path="/contact_us" element={<ProtectedRoute element={<Contact />} />} />
          <Route path="/add_contact" element={<ProtectedRoute element={<AddContact />} />} />
        </Route>

        {/* Route cho trang không tìm thấy */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
