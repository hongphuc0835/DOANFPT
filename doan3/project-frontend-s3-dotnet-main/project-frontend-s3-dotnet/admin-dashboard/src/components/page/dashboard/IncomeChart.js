import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Box, Typography, Container, Paper } from "@mui/material";

// Register the necessary chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeChart = () => {
  const [incomeData, setIncomeData] = useState([]);

  // Fetch bookings data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5018/api/Booking");
        const data = await response.json();
        calculateMonthlyIncome(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Function to calculate monthly income based on bookings
  const calculateMonthlyIncome = (bookings) => {
    const monthlyIncome = Array(12).fill(0); // Array to hold income for each month (0-11)

    bookings.forEach((booking) => {
      const month = new Date(booking.departureDate).getDay(); // Get the month from DepartureDate (correcting getDay to getMonth)
      monthlyIncome[month] += booking.totalPrice; // Add the total price to the corresponding month
    });

    setIncomeData(monthlyIncome);
  };

  // Chart.js data and options
  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // Months of the year
    datasets: [
      {
        label: "Monthly Income (USD)", // Adding the unit (USD)
        data: incomeData, // Monthly income data
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Monthly Income for the Year",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return "$" + context.raw.toLocaleString(); // Custom tooltip format
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString(); // Adding unit ($) and formatting the numbers
          },
        },
      },
    },
  };

  return (
    <Container
      maxWidth="lg"
      component={Paper}
      sx={{
        textAlign: "center",
        px: 4,
        padding: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          margin: "0 auto",
        }}
      >
        <Bar data={data} options={options} />
      </Box>

      {/* Caption for the chart */}
      <Typography
        variant="body1"
        sx={{
          color: "#555",
          mt: 3, // Space between chart and caption
        }}
      >
        This chart displays the total income generated per month based on bookings. The values are represented in USD. Each bar corresponds to the cumulative income for a specific month of the year.
      </Typography>
    </Container>
  );
};

export default IncomeChart;
