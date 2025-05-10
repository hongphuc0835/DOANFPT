import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faEnvelope, faMessage } from "@fortawesome/free-solid-svg-icons";
import "./contact.css";
import { Alert, Box, Snackbar } from "@mui/material";

const Contact = () => {
  const [contactInfo, setContactInfo] = useState({
    address: "",
    phone: "",
    email: "",
  });

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [content, setContent] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [feedbackCounter, setFeedbackCounter] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // "success" | "error" | "warning" | "info"
  });

  // Fetch thông tin liên hệ từ API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get("http://localhost:5119/api/contact");
        setContactInfo({
          address: response.data.address,
          phone: response.data.phone,
          email: response.data.email,
        });
      } catch (err) {
        console.log(err.message || "An error occurred");
      }
    };

    fetchContactInfo();
  }, []);

  // Gửi feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Bắt đầu gửi feedback...");

    const token = localStorage.getItem("token");
    if (!token) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập và lấy mail đăng nhập để gửi feedback.",
        severity: "error",
      });
      return;
    }

    const feedbackData = {
      feedbackId: feedbackCounter,
      UserName: userName,
      Email: email,
      Phone: phone,
      Content: content,
      CreatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:5119/api/feedbacks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (res.ok) {
        const result = await res.json();
        setResponse(result.Message);
        setFeedbackCounter(feedbackCounter + 1);
        setUserName("");
        setEmail("");
        setPhone("");
        setContent("");
        setError("");
        setSnackbar({
          open: true,
          message: "Bạn đã gửi feedback thành công!",
          severity: "success",
        });
      } else {
        const error = await res.json();
        setResponse(error.Message || "Có lỗi xảy ra!");
        setSnackbar({
          open: true,
          message: error.Message || "Có lỗi xảy ra!",
          severity: "error",
        });
      }
    } catch (err) {
      setResponse("Không thể kết nối đến server.");
      setSnackbar({
        open: true,
        message: "Không thể kết nối đến server.",
        severity: "error",
      });
    }
  };

  // Đóng snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="contactus">
      {/* Snackbar hiển thị thông báo */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <section className="bread-crumb">
        <div className="container">
          <ul className="breadcrumb">
            <li className="home">
              <a href="/" title="Trang chủ">
                <span>Trang chủ</span>
              </a>
              <span className="mr_lr">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="svg-inline--fa fa-chevron-right fa-w-10">
                  <path
                    fill="currentColor"
                    d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                  />
                </svg>
              </span>
            </li>
            <li>
              <a href="/contact" title="contact">
                <span>Contact</span>
              </a>
            </li>
          </ul>
        </div>
      </section>
      <div className="container-contact100">
        <div className={`wrap-contact100  "map-active" : ""}`}>
          <form className="contact100-form validate-form" onSubmit={handleSubmit}>
            <span className="contact100-form-title">Send Us A Message</span>

            <label className="label-input100" htmlFor="userName">
              <FontAwesomeIcon icon={faUser} style={{ marginRight: "8px", color: "#004e92" }} />
              Tell us your name *
            </label>
            <div className="wrap-input100 validate-input">
              <input id="userName" className="input100" type="text" name="userName" placeholder="Your name..." value={userName} onChange={(e) => setUserName(e.target.value)} required />
              <span className="focus-input100"></span>
            </div>

            <label className="label-input100" htmlFor="email">
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: "8px", color: "#004e92" }} />
              Enter your email *
            </label>
            <div className="wrap-input100 validate-input">
              <input id="email" className="input100" type="email" name="email" placeholder="...@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <span className="focus-input100"></span>
            </div>

            <label className="label-input100" htmlFor="content">
              <FontAwesomeIcon icon={faMessage} style={{ marginRight: "8px", color: "#004e92" }} />
              Message *
            </label>
            <div className="wrap-input100 validate-input">
              <textarea id="content" className="input100" name="content" placeholder="Write us a message..." value={content} onChange={(e) => setContent(e.target.value)} required></textarea>
              <span className="focus-input100"></span>
            </div>

            {error && <p1 style={{ color: "red" }}>{error}</p1>}
            {response && <p1 style={{ color: "green" }}>{response}</p1>}

            <div className="container-contact100-form-btn">
              <button type="submit" className="contact100-form-btn">
                Send Message
              </button>
            </div>
          </form>

          <div className="contact100-more flex-col-c-m" style={{ backgroundImage: "url('images/bg-01.jpg')" }}>
            <div className="contact-container">
              <span className="contact100-form-title">Let's get in touch</span>
              <p3 class="contact-p3">or you can find our contacts</p3>
              {/* Phần Bản đồ */}
              <div className="contact-map-container">
                <div id="map" className="contact-map">
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.102990388698!2d105.78090194668097!3d21.028564715860558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab00954decbf%3A0xdb4ee23b49ad50c8!2zRlBUIEFwdGVjaCBIw6AgTuG7mWkgLSBI4buHIHRo4buRbmcgxJHDoG8gdOG6oW8gbOG6rXAgdHLDrG5oIHZpw6puIHF14buRYyB04bq_!5e0!3m2!1svi!2s!4v1719625836130!5m2!1svi!2s"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowfullscreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Google Map"
                    ></iframe>
                  </Box>
                </div>
              </div>

              {/* Phần Thông tin liên hệ */}
              <div className="contact-info">
                <div className="contact-item address">
                  <span className="icon">
                    <i className="lnr lnr-map-marker"></i>
                  </span>
                  <div className="text">
                    <span className="label">
                      <i className="fas fa-map-marker-alt"></i> Address: 8a Ton That Thuyet Nam Tu Liem
                    </span>
                    <span className="content">{contactInfo.address}</span>
                  </div>
                </div>
                <div className="contact-item phone">
                  <span className="icon">
                    <i className="lnr lnr-phone-handset"></i>
                  </span>
                  <div className="text">
                    <span className="label">
                      <i className="fas fa-comments"></i> Phone: 098765434
                    </span>
                    <span className="content">{contactInfo.phone}</span>
                  </div>
                </div>
                <div className="contact-item email">
                  <span className="icon">
                    <i className="lnr lnr-envelope"></i>
                  </span>
                  <div className="text">
                    <span className="label">
                      <i className="fas fa-envelope"></i> Gmail: FPTCompany@gmail.com{" "}
                    </span>
                    <span className="content">{contactInfo.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
