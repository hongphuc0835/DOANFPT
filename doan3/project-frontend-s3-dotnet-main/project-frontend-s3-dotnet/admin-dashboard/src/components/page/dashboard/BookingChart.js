import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2"; // Changed from Doughnut to Pie
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Ensure to import plugin
import { SubTitle } from "chart.js";

// Import MUI components
import { Typography, Card } from "@mui/material";

// Register Chart.js elements and plugins
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);
ChartJS.register(ArcElement, Tooltip, Legend, Title, SubTitle);

const BookingChart = () => {
  const [bookingData, setBookingData] = useState([]);

  useEffect(() => {
    // Fetch API to get booking data
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:5018/api/Booking"); // Change API path if needed
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setBookingData(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  // Count bookings by status
  const statusCounts = {
    Cancelled: 0,
    Pending: 0,
    Completed: 0,
  };

  bookingData.forEach((booking) => {
    if (booking.status === "Cancelled") statusCounts.Cancelled++;
    if (booking.status === "Pending" || booking.status === "Pending (Confirmed)") statusCounts.Pending++;

    if (booking.status === "Completed") statusCounts.Completed++;
  });

  const totalBookings = statusCounts.Cancelled + statusCounts.Pending + statusCounts.Completed;

  // Data for the pie chart
  const data = {
    labels: ["Cancelled", "Pending", "Completed"],
    datasets: [
      {
        data: [statusCounts.Cancelled, statusCounts.Pending, statusCounts.Completed],
        backgroundColor: ["#ff0000", "#ffcc00", "#00cc00"],
        hoverOffset: 4,
      },
    ],
  };

  // Options to show percentage in the tooltip and labels
  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const percentage = ((tooltipItem.raw / totalBookings) * 100).toFixed(2);
            return `${tooltipItem.label}: ${percentage}%`;
          },
        },
      },
      datalabels: {
        formatter: (value) => {
          const percentage = ((value / totalBookings) * 100).toFixed(2);
          return `${percentage}%`;
        },
        color: "#fff",
        font: {
          weight: "bold",
          size: 14,
        },
      },
    },
  };

  return (
    <Card sx={{ boxShadow: 3, display: "flex", flexDirection: "column", borderRadius: 2, padding: 2 }}>
      <Typography variant="h5" sx={{ marginBottom: 2, textAlign: "center", fontWeight: "bold" }}>
        Booking Status
      </Typography>
      <Pie options={options} data={data} /> {/* Changed from Doughnut to Pie */}
      <Typography variant="body2" sx={{ marginTop: 2, textAlign: "center", color: "#555" }}>
        This chart shows the percentage of bookings by current status.
      </Typography>
    </Card>
  );
};

export default BookingChart;
