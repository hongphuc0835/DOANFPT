import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Typography, Rating, Button, Box, Pagination } from "@mui/material";

const DestinationDetail = () => {
  const { name } = useParams();
  const [tourData, setTourData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 4;
  const totalPages = Math.ceil(tourData?.length / toursPerPage);

  useEffect(() => {
    const fetchDestinationDetail = async () => {
      const cachedTourData = localStorage.getItem("tours");

      const filteredTourSchedules = JSON.parse(cachedTourData)
        .sort((a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId))
        .flatMap((tour) =>
          tour?.tourSchedules?.filter(
            (schedule) => schedule?.tours?.destinations?.name === name && schedule?.name === "Basic"
          )
        );

      setTourData(filteredTourSchedules);
      try {
        const tourResponse = await axios.get("http://localhost:5089/api/Tour/GetAllWithTours");
        const filteredTourSchedules = tourResponse.data
          .sort((a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId))
          .flatMap((tour) =>
            tour?.tourSchedules?.filter(
              (schedule) => schedule?.tours?.destinations?.name === name && schedule?.name === "Basic"
            )
          );

        setTourData(filteredTourSchedules);
      } catch (err) {
        console.error("Error fetching destination details:", err);
      }
    };

    fetchDestinationDetail();
  }, [name]);

  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = tourData?.slice(indexOfFirstTour, indexOfLastTour);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <section className="bread-crumb">
        <div className="container">
          <ul className="breadcrumb">
            <li className="home">
              <a href="/" title="Home">
                <span>Home</span>
              </a>
              <span className="mr_lr">
                &nbsp;
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="chevron-right"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 320 512"
                  className="svg-inline--fa fa-chevron-right fa-w-10"
                >
                  <path
                    fill="currentColor"
                    d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                  />
                </svg>
                &nbsp;
              </span>
            </li>
            <li>
              <strong>
                <span>Search</span>
              </strong>
            </li>
          </ul>
        </div>
      </section>
      <div className="section_tour_good_price" style={{ padding: "68px 20px" }}>
        <div className="container">
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, fontWeight: "bold" }}>
            {[...new Set(tourData?.map((item) => item?.tours?.destinations?.name))].map((name, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: "600" }}>
                  Tour {name}
                </Typography>
              </Box>
            ))}
          </Typography>

          {tourData.length > 0 ? (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {currentTours?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      border: "1px solid #e0e0e0",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                      padding: "24px",
                      transition: "box-shadow 0.3s ease, transform 0.3s ease",
                      backgroundColor: "#fff",
                    }}
                  >
                    <a
                      href={`/tour/${item?.tours?.tourId}`}
                      style={{
                        width: "35%",
                        marginRight: "20px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        display: "block",
                      }}
                    >
                      <img
                        src={item?.tours?.imageUrl?.split(";")[0] || "default-image-url"}
                        alt={item?.tours?.name}
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                    </a>

                    <div style={{ flex: 1 }}>
                      <a href={`/tour/${item?.tours?.tourId}`} style={{ textDecoration: "none" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                          {item?.tours?.name}
                        </Typography>
                      </a>

                      <div>
                        <Rating value={item?.tours?.rating || 0} precision={0.5} readOnly sx={{ mt: 1 }} />
                      </div>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Duration: {item?.tours?.duration}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Departure: {item?.tours?.tourDepartureLocation || "No information available"}
                      </Typography>

                      <div style={{ marginTop: "16px" }}>
                        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                          {item?.packagePrice ? `$${item?.packagePrice.toLocaleString()}` : "No information"}
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          href={`/tour/${item?.tours?.tourId}`}
                          size="small"
                          sx={{
                            "&:hover": {
                              backgroundColor: "primary.dark",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                              transform: "scale(1.05)",
                            },
                            borderRadius: "8px",
                            paddingX: 4,
                            paddingY: 1.5,
                            transition: "background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pagination" style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => paginate(value)}
                  variant="outlined"
                  shape="rounded"
                  sx={{
                    mt: 2,
                  }}
                />
              </div>
            </>
          ) : (
            <Typography variant="h6" align="center" sx={{ mt: 4 }}>
              There are no tours from the location you searched for, please enter another destination.
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default DestinationDetail;
