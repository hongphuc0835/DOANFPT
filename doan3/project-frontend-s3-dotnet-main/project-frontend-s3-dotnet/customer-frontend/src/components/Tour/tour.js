import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link từ react-router-dom
import "react-datepicker/dist/react-datepicker.css";
import { Typography, Pagination } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import "swiper/css";
import "swiper/css/navigation";

const Home = () => {
  const [tourData, setTourData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [destinations, setDestinations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const toursPerPage = 8;
  const totalPages = Math.ceil(tourData?.length / toursPerPage);

  useEffect(() => {
    const fetchData = async () => {
      // Check if data is cached in localStorage
      const cachedTourData = localStorage.getItem("tours");
      const cachedDestinations = localStorage.getItem("destinations");

      if (cachedTourData && cachedDestinations) {
        const filteredTourSchedules = JSON.parse(cachedTourData).flatMap((tour) => tour?.tourSchedules?.filter((schedule) => schedule?.name === "Basic"));
        setTourData(filteredTourSchedules);
        setDestinations(JSON.parse(cachedDestinations));
      }

      // If no cached data, fetch from API
      try {
        const tourResponse = await axios.get("http://localhost:5089/api/Tour/GetAllWithTours");
        const filteredTourSchedules = tourResponse.data.sort((a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId)).flatMap((tour) => tour?.tourSchedules?.filter((schedule) => schedule?.name === "Basic"));
        setTourData(filteredTourSchedules);
        localStorage.setItem("tours", JSON.stringify(tourResponse.data));
        const destinationResponse = await axios.get("http://localhost:5089/api/destination/getAllDestinationsWithTours");
        setDestinations(destinationResponse.data);
        localStorage.setItem("destinations", JSON.stringify(destinationResponse.data));
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      }
    };

    fetchData();
  }, []);

  const filteredDestinations = destinations.filter((destination) => {
    return destination?.destination?.name && destination?.destination?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Get current tours for the current page
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = tourData?.slice(indexOfFirstTour, indexOfLastTour);
  console.log(currentTours);
  // Pagination handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  return (
    <>
      <link rel="icon" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/favicon.png?1728351987196" type="image/x-icon" />
      <link rel="preload" as="style" type="text/css" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/main.scss.css?1728351987196" />
      <link rel="preload" as="style" type="text/css" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/header.scss.css?1728351987196" />
      <link rel="preload" as="style" type="text/css" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/index.scss.css?1728351987196" />
      <link rel="preload" as="style" type="text/css" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/404page.scss.css?1728351987196" />
      <link rel="preload" as="style" type="text/css" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/bootstrap-4-3-min.css?1728351987196" />
      <style
        dangerouslySetInnerHTML={{
          __html: "\n\t:root{\n\t\t--maincolor: #0396ff;\n\t\t--oldcolor: #e6f4ff;\n\t\t--hover: #ff5e14;\n\t\t--pricecolor: #0396ff;\n\t}\n",
        }}
      />
      <link rel="stylesheet" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/bootstrap-4-3-min.css?1728351987196" />
      <link href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/main.scss.css?1728351987196" rel="stylesheet" type="text/css" media="all" />
      <link href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/header.scss.css?1728351987196" rel="stylesheet" type="text/css" media="all" />
      <link href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/breadcrumb_style.scss.css?1728351987196" rel="stylesheet" type="text/css" media="all" />
      <link href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/collection_style.scss.css?1728351987196" rel="stylesheet" type="text/css" media="all" />
      <div className="bodywrap">
        <div className="layout-collection">
          <section className="bread-crumb" style={{ backgroundColor: "rgb(0, 78, 146)" }}>
            <div className="container">
              <ul className="breadcrumb">
                <li className="home">
                  <a href="/" title="Home">
                    <span>Home</span>
                  </a>
                  <span className="mr_lr">
                    &nbsp;
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="svg-inline--fa fa-chevron-right fa-w-10">
                      <path
                        fill="currentColor"
                        d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"
                        className=""
                      />
                    </svg>
                    &nbsp;
                  </span>
                </li>
                <li>
                  <strong>
                    <span>All Tours</span>
                  </strong>
                </li>
              </ul>
            </div>
          </section>
          <div className="container">
            <div className="row">
              <aside className="dqdt-sidebar sidebar col-lg-3 col-12">
                <div className="bg">
                  <div className="aside-content aside-cate">
                    <div className="title-head">Tour Categories</div>
                    <nav className="nav-category">
                      <ul className="nav navbar-pills">
                        <li className="nav-item  relative">
                          {filteredDestinations.length > 0 ? (
                            filteredDestinations.map((destination) => (
                              <div key={destination?.destination?.name}>
                                <Link to={`/tour-list/${destination?.destination?.name}`}>{destination?.destination?.name}</Link>
                              </div>
                            ))
                          ) : (
                            <p>No matching results found.</p> // Notification if no search results
                          )}
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </aside>
              <div className="block-collection col-lg-9 col-12">
                <div className="category-products">
                  <div className="products-view products-view-list list_hover_pro">
                    <div className="row">
                      {currentTours.map((item, index) => (
                        <div className="col-lg-12 col-md-12 col-12 product-col" key={index}>
                          <div className="item_product_main list-office margin-bottom-15">
                            <form action="/cart/add" method="post" className="style-2 variants product-action" data-cart-form="" data-id={`product-actions-${item?.tours?.tourId}`} encType="multipart/form-data">
                              <div className="row align-items-center">
                                <div className="col-lg-4 col-md-4 col-12">
                                  <div className="product-thumbnail">
                                    <a className="image_thumb scale_hover" href={`/tour/${item?.tours?.tourId}`} title={item?.tours?.name}>
                                      <img src={item?.tours?.imageUrl?.split(";")[0] || "default-image-url"} alt={item?.tours?.name} />
                                    </a>
                                  </div>
                                </div>
                                <div className="col-lg-8 col-md-8 col-12">
                                  <div className="product-info">
                                    <div className="row">
                                      <div className="col-xl-8 col-lg-7 col-md-7 col-12">
                                        <h3 className="product-name">
                                          <a href={`/tour/${item?.tours?.tourId}`}>{item?.tours?.name}</a>
                                        </h3>
                                        <div className="sapo-product-reviews-badge" data-id={item?.tours?.tourId} />
                                        <Typography variant="body2" color="textSecondary">
                                          Reviews:{" "}
                                          {Array(5)
                                            .fill(0)
                                            .map((_, starIndex) =>
                                              starIndex < (item?.tours?.rating || 0) ? (
                                                <StarIcon
                                                  key={starIndex}
                                                  style={{
                                                    color: "#FFD700",
                                                    fontSize: "18px",
                                                    marginRight: "2px",
                                                  }}
                                                />
                                              ) : (
                                                <StarBorderIcon
                                                  key={starIndex}
                                                  style={{
                                                    color: "#FFD700",
                                                    fontSize: "18px",
                                                    marginRight: "2px",
                                                  }}
                                                />
                                              )
                                            )}
                                        </Typography>
                                        <div className="time">
                                          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" fill="none">
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M8.49626 5.06522C8.49626 4.66347 8.17058 4.33779 7.76884 4.33779C7.36709 4.33779 7.04142 4.66347 7.04142 5.06522V8.67726C7.04142 8.95279 7.19709 9.20467 7.44353 9.32789L10.1526 10.6824C10.5119 10.8621 10.9488 10.7164 11.1285 10.3571C11.3082 9.99775 11.1625 9.56081 10.8032 9.38114L8.49626 8.22768V5.06522Z"
                                              fill="#99A2BC"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M8.33322 0.5C4.19109 0.5 0.833221 3.85786 0.833221 8C0.833221 12.1421 4.19109 15.5 8.33322 15.5C12.4754 15.5 15.8332 12.1421 15.8332 8C15.8332 3.85786 12.4754 0.5 8.33322 0.5ZM2.28807 8C2.28807 4.66136 4.99458 1.95485 8.33322 1.95485C11.6719 1.95485 14.3784 4.66136 14.3784 8C14.3784 11.3386 11.6719 14.0452 8.33322 14.0452C4.99458 14.0452 2.28807 11.3386 2.28807 8Z"
                                              fill="#99A2BC"
                                            />
                                          </svg>
                                          Duration: {item?.tours?.duration}
                                        </div>
                                      </div>
                                      <div className="col-xl-4 col-lg-5 col-md-5 col-12">
                                        <div className="start">
                                          <svg xmlns="http://www.w3.org/2000/svg" width={14} height={17} viewBox="0 0 14 17" fill="none">
                                            <path
                                              d="M6.72266 1C9.68069 1 12.4286 3.36877 12.4286 6.35714C12.4286 8.33243 11.7612 9.72895 10.6429 11.3571C9.47097 13.0632 7.99455 14.6756 7.22848 15.4754C6.94575 15.7706 6.48282 15.7706 6.20009 15.4754C5.43402 14.6756 3.9576 13.0632 2.78571 11.3571C1.66733 9.72895 1 8.33243 1 6.35714C1 3.36877 3.74782 1 6.70585 1"
                                              stroke="#99A2BC"
                                              strokeWidth={1}
                                              strokeLinecap="round"
                                            />
                                            <path d="M8.85713 6.67259C8.85713 7.86769 7.90085 8.85605 6.71764 8.85605C5.53443 8.85605 4.57141 7.86769 4.57141 6.67259C4.57141 5.47748 5.53443 4.57119 6.71764 4.57119C7.90085 4.57119 8.85713 5.47748 8.85713 6.67259Z" stroke="#99A2BC" strokeWidth={1} />
                                          </svg>
                                          Departure: {item?.tours?.tourDepartureLocation || "No information available"}
                                        </div>
                                        <div className="price-box">
                                          <Typography variant="body1" color="primary">
                                            Price: {item?.packagePrice ? ` $ ${item?.packagePrice.toLocaleString()}` : "No information"}
                                          </Typography>
                                        </div>
                                        <div className="view-detail">
                                          <a href={`/tour/${item?.tours?.tourId}`} style={{ textDecoration: "none" }}>
                                            View Details
                                          </a>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pagination">
                  <Pagination
                    count={totalPages} // Tổng số trang
                    page={currentPage} // Trang hiện tại
                    onChange={(event, value) => paginate(value)} // Gọi hàm phân trang
                    variant="outlined"
                    shape="rounded" // Hoặc "circular" nếu bạn muốn nút hình tròn
                    sx={{
                      "& .Mui-selected": {
                        backgroundColor: "#0056b3", // Màu nền xanh cho trang được chọn
                        color: "white", // Màu chữ trắng cho trang được chọn
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
