import React, { useEffect, useState } from "react";
import axios from "axios";

import { Typography, Button, TextField, Modal, Stack, Card, Pagination, CircularProgress, Box, Alert, Container } from "@mui/material";
import { MailOutlined, CommentOutlined, CalendarToday, CalendarMonth, MessageOutlined } from "@mui/icons-material";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [managerReply, setManagerReply] = useState("");
  const [showUnanswered, setShowUnanswered] = useState(true);
  const [unansweredPage, setUnansweredPage] = useState(1);
  const [answeredPage, setAnsweredPage] = useState(1);
  const [pageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5119/api/feedbacks");
      const sortedData = response.data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      setFeedbacks(sortedData);
    } catch (error) {
      setMessage("Error fetching feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedFeedback || !managerReply) {
      setMessage("Please select a feedback and enter a reply.");

      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5119/api/feedbacks/reply", {
        feedbackId: selectedFeedback.feedbackId,
        managerReply,
      });
      setMessage(response.data.message || "Reply sent successfully!");

      setManagerReply("");
      setSelectedFeedback(null);
      fetchFeedbacks(); // Refresh feedback list
    } catch (error) {
      console.error("Error replying to feedback:", error);
      setMessage("An error occurred while sending the reply.");
    } finally {
      setLoading(false);
    }
  };

  const unansweredFeedbacks = feedbacks.filter((feedback) => feedback.managerReply === null);
  const answeredFeedbacks = feedbacks.filter((feedback) => feedback.managerReply !== null).sort((a, b) => new Date(b.repliedDate) - new Date(a.repliedDate));

  const displayedUnansweredFeedbacks = unansweredFeedbacks.slice((unansweredPage - 1) * pageSize, unansweredPage * pageSize);
  const displayedAnsweredFeedbacks = answeredFeedbacks.slice((answeredPage - 1) * pageSize, answeredPage * pageSize);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
  };

  return (
    <Container>
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontWeight: 700 }}>
          Customer Feedbacks
        </Typography>

        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Button
            variant={showUnanswered ? "contained" : "outlined"}
            onClick={() => setShowUnanswered(true)}
            sx={{
              mr: 2,
              boxShadow: 3,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "capitalize",
              backgroundColor: showUnanswered ? "#1a73e8" : "transparent",
              color: showUnanswered ? "#fff" : "#1a73e8",
              borderColor: "#1a73e8",
              "&:hover": {
                backgroundColor: showUnanswered ? "#155b8a" : "#e3f2fd",
                color: showUnanswered ? "#fff" : "#1a73e8",
                boxShadow: 4,
              },
            }}
          >
            Unanswered Feedbacks
          </Button>
          <Button
            variant={!showUnanswered ? "contained" : "outlined"}
            onClick={() => setShowUnanswered(false)}
            sx={{
              boxShadow: 3,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "capitalize",
              backgroundColor: !showUnanswered ? "#1a73e8" : "transparent",
              color: !showUnanswered ? "#fff" : "#1a73e8",
              borderColor: "#1a73e8",
              "&:hover": {
                backgroundColor: !showUnanswered ? "#155b8a" : "#e3f2fd",
                color: !showUnanswered ? "#fff" : "#1a73e8",
                boxShadow: 4,
              },
            }}
          >
            Answered Feedbacks
          </Button>
        </Box>
        {loading && <CircularProgress sx={{ display: "block", margin: "auto", mb: 3 }} />}
        <Box>
          {showUnanswered
            ? displayedUnansweredFeedbacks.map((feedback) => (
                <Card key={feedback.feedbackId} sx={{ mb: 2, p: 2, borderRadius: 3, boxShadow: 6, transition: "transform 0.3s ease-in-out" }}>
                  <Stack spacing={2}>
                    <Typography variant="body1">
                      <MailOutlined sx={{ mr: 1, color: "#ff9800" }} />
                      <strong>Email:</strong> {feedback.email}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#555" }}>
                      <CommentOutlined sx={{ mr: 1, color: "#4caf50" }} />
                      <strong>Content:</strong> {feedback.content}
                    </Typography>
                    {showUnanswered && (
                      <Typography variant="body1" sx={{ color: "#888" }}>
                        <CalendarToday sx={{ mr: 1, color: "#1976d2" }} />
                        <strong>Published Date:</strong> {formatDate(feedback.publishedDate)}
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        setManagerReply(feedback.managerReply || "");
                      }}
                      sx={{ borderColor: "#1a73e8", color: "#1a73e8", fontWeight: "600", "&:hover": { backgroundColor: "#1a73e8", color: "#fff" } }}
                    >
                      Reply
                    </Button>
                  </Stack>
                </Card>
              ))
            : displayedAnsweredFeedbacks.map((feedback) => (
                <Card key={feedback.feedbackId} sx={{ mb: 2, p: 2, borderRadius: 3, boxShadow: 6, transition: "transform 0.3s ease-in-out" }}>
                  <Stack spacing={2}>
                    <Typography variant="body1">
                      <MailOutlined sx={{ mr: 1, color: "#ff9800" }} />
                      <strong>Email:</strong> {feedback.email}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#555" }}>
                      <CommentOutlined sx={{ mr: 1, color: "#4caf50" }} />
                      <strong>Content:</strong> {feedback.content}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#888" }}>
                      <CalendarToday sx={{ mr: 1, color: "#1976d2" }} />
                      <strong>Published Date:</strong> {formatDate(feedback.publishedDate)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#888" }}>
                      <CalendarMonth sx={{ mr: 1, color: "#1976d2" }} />
                      <strong>Replied Date:</strong> {formatDate(feedback.repliedDate)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#555" }}>
                      <MessageOutlined sx={{ mr: 1 }} />
                      <strong>Reply:</strong> {feedback.managerReply}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedFeedback(feedback);
                        setManagerReply(feedback.managerReply || "");
                      }}
                      sx={{ borderColor: "#1a73e8", color: "#1a73e8", fontWeight: "600", "&:hover": { backgroundColor: "#1a73e8", color: "#fff" } }}
                    >
                      {loading && <CircularProgress size={24} sx={{ marginRight: "10px", color: "#fff" }} />} {/* Adjust spinner size and spacing */}
                      Reply
                    </Button>
                  </Stack>
                </Card>
              ))}
        </Box>

        <Pagination
          count={showUnanswered ? Math.ceil(unansweredFeedbacks.length / pageSize) : Math.ceil(answeredFeedbacks.length / pageSize)}
          page={showUnanswered ? unansweredPage : answeredPage}
          onChange={(e, page) => {
            if (showUnanswered) setUnansweredPage(page);
            else setAnsweredPage(page);
          }}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", mt: 3 }}
        />

        <Modal open={Boolean(selectedFeedback)} onClose={() => setSelectedFeedback(null)} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ bgcolor: "white", p: 4, borderRadius: 3, boxShadow: 24 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reply to Feedback
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <MailOutlined sx={{ mr: 1, color: "#ff9800" }} />
              <strong>Email:</strong> {selectedFeedback?.email}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <CommentOutlined sx={{ mr: 1, color: "#4caf50" }} />
              <strong>Content:</strong> {selectedFeedback?.content}
            </Typography>
            <TextField variant="outlined" multiline rows={4} fullWidth value={managerReply} onChange={(e) => setManagerReply(e.target.value)} label="Enter your reply..." sx={{ mb: 2 }} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setSelectedFeedback(null)} sx={{ color: "#888" }}>
                Cancel
              </Button>

              <Button onClick={handleReplySubmit} variant="contained" disabled={!managerReply} sx={{ backgroundColor: "#1a73e8", "&:hover": { backgroundColor: "#1565c0" } }}>
                {loading && <CircularProgress size={24} sx={{ marginRight: "10px", color: "#fff" }} />} {/* Adjust spinner size and spacing */}
                Submit Reply
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
      {message && (
        <Box sx={{ mt: 2, position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)" }}>
          <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>
        </Box>
      )}
    </Container>
  );
};

export default Feedback;
