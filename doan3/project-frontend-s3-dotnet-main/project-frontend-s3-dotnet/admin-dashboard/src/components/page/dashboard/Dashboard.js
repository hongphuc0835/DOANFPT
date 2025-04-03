import React from "react";
import { Box, Grid } from "@mui/material";
import {} from "@mui/icons-material";

import UserCount from "./UserCount";
import NewUsers from "./NewUsers";
import Income from "./Income";
import TotalBooking from "./TotalBooking";
import BookingComplete from "./BookingComplete";
import BookingChart from "./BookingChart";
import IncomeChart from "./IncomeChart";

const Dashboard = () => {
  return (
    <Box>
      <Box sx={{ padding: 3 }}>
        {/* Dashboard Statistics */}
        <Grid container spacing={2} sx={{ mb: 10 }}>
          <UserCount />
          <Income />
          <TotalBooking />
          <BookingComplete />
        </Grid>

        {/* New Users and Booking Chart */}
        <Grid container spacing={3} sx={{ mb: 10 }}>
          <Grid item xs={12} md={6}>
            <NewUsers />
          </Grid>
          <Grid item xs={12} md={6}>
            <BookingChart />
          </Grid>
        </Grid>

        {/* Dashboard Table */}
        <Box>
          <IncomeChart />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
