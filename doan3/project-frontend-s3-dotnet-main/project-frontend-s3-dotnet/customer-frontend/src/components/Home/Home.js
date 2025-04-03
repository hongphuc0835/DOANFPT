import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./Home.css";
const Home = () => {
  const [tourData, setTourData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [destinations, setDestinations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const navigate = useNavigate();
  SwiperCore.use([Navigation, Pagination]);

  React.useEffect(() => {
    // Tạo bộ chọn ngày
    flatpickr("#date-input", {
      dateFormat: "Y-m-d", // Định dạng ngày
      minDate: "today", // Không cho phép chọn ngày quá khứ
      onChange: (selectedDates) => {
        setSelectedDate(selectedDates[0]); // Cập nhật ngày đã chọn
      },
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const element = elementRef.current; // Capture the value of elementRef.current
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        // Use the captured element reference in the cleanup
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const cachedTours = localStorage.getItem("tours");
      const cachedDestinations = localStorage.getItem("destinations");
      if (cachedTours && cachedDestinations) {
        const filteredTourSchedules = JSON.parse(cachedTours).flatMap((tour) =>
          tour.tourSchedules.filter((schedule) => schedule.name === "Basic")
        );
        setTourData(filteredTourSchedules);
        setDestinations(JSON.parse(cachedDestinations));
      }

      try {
        const tourResponse = await axios.get(
          "http://localhost:5089/api/Tour/GetAllWithTours"
        );
        const filteredTourSchedules = tourResponse.data.flatMap((tour) =>
          tour.tourSchedules.filter((schedule) => schedule.name === "Basic")
        );
        setTourData(filteredTourSchedules);
        localStorage.setItem(
          "tours",
          JSON.stringify(tourResponse.data).sort(
            (a, b) => new Date(b?.tour?.tourId) - new Date(a?.tour?.tourId)
          )
        );
        const destinationResponse = await axios.get(
          "http://localhost:5089/api/destination/getAllDestinationsWithTours"
        );
        setDestinations(destinationResponse.data);
        localStorage.setItem(
          "destinations",
          JSON.stringify(destinationResponse.data)
        );
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleSelectDestination = (destination) => {
    setSelectedDestination(destination?.destination?.name);
    setSearchTerm(destination?.destination?.name);
  };

  const handleSearchClick = () => {
    if (selectedDestination) {
      navigate(`/tour-list/${selectedDestination}`);
    }
  };

  const filteredDestinations = destinations.filter((destination) =>
    destination?.destination?.name
      ? destination?.destination?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      : false
  );

  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="theme-color" content="#f02b2b" />
      <meta
        name="viewport"
        content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <meta name="robots" content="noodp,index,follow" />
      <link
        rel="icon"
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/favicon.png?1728351987196"
        type="image/x-icon"
      />
      <link
        rel="preload"
        as="style"
        type="text/css"
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/main.scss.css?1728351987196"
      />
      <link
        rel="preload"
        as="style"
        type="text/css"
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/header.scss.css?1728351987196"
      />
      <link
        rel="preload"
        as="style"
        type="text/css"
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/index.scss.css?1728351987196"
      />
      <link
        rel="preload"
        as="style"
        type="text/css"
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/404page.scss.css?1728351987196"
      />
      <link
        rel="preload"
        as="style"
        type="text/css"
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/bootstrap-4-3-min.css?1728351987196"
      />
      <style
        dangerouslySetInnerHTML={{
          __html:
            "\n\t:root{\n\t\t--maincolor: #0396ff;\n\t\t--oldcolor: #e6f4ff;\n\t\t--hover: #ff5e14;\n\t\t--pricecolor: #0396ff;\n\t}\n",
        }}
      />
      <link
        rel="stylesheet"
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/bootstrap-4-3-min.css?1728351987196"
      />
      <link
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/main.scss.css?1728351987196"
        rel="stylesheet"
        type="text/css"
        media="all"
      />
      <link
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/header.scss.css?1728351987196"
        rel="stylesheet"
        type="text/css"
        media="all"
      />
      <link
        href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/index.scss.css?1728351987196"
        rel="stylesheet"
        type="text/css"
        media="all"
      />
      <div className="bodywrap">
        <h1 className="d-none">Karnel Travel - </h1>
        <div className="bg-index">
          <div className="home-slider swiper-container">
            <div className="swiper-wrapper">
              <div className="swiper-slide">
                <Link href="/" className="clearfix" title="Banner">
                  <Swiper
                    spaceBetween={10}
                    slidesPerView={1}
                    navigation={true}
                    pagination={{ clickable: true }}
                    modules={[Navigation, Pagination, Autoplay]}
                    autoplay={{
                      delay: 5000,
                      disableOnInteraction: false,
                    }}
                    loop={true}
                    effect="slide"
                    speed={2000}
                    cssMode={true}
                  >
                    <SwiperSlide>
                      <picture>
                        <source
                          media="(min-width: 1200px)"
                          srcSet="https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/10/26015647/dich-vu-thiet-ke-banner-du-lich-chuyen-nghiep-tai-ha-noi4.jpg"
                        />
                        <source
                          media="(min-width: 992px)"
                          srcSet="https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/10/26015647/dich-vu-thiet-ke-banner-du-lich-chuyen-nghiep-tai-ha-noi4.jpg"
                        />
                        <source
                          media="(min-width: 569px)"
                          srcSet="https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/10/26015647/dich-vu-thiet-ke-banner-du-lich-chuyen-nghiep-tai-ha-noi4.jpg"
                        />
                        <source
                          media="(max-width: 567px)"
                          srcSet="https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/10/26015647/dich-vu-thiet-ke-banner-du-lich-chuyen-nghiep-tai-ha-noi4.jpg"
                        />
                        <img
                          src="https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/10/26015647/dich-vu-thiet-ke-banner-du-lich-chuyen-nghiep-tai-ha-noi4.jpg"
                          alt="Banner 1"
                          className="img-responsive"
                        />
                      </picture>
                    </SwiperSlide>
                    <SwiperSlide>
                      <picture>
                        <source
                          media="(min-width: 1200px)"
                          srcSet="https://img.upanh.tv/2025/01/10/tour-du-lich-da-nang-1d4e640b946221d48.jpg"
                        />
                        <source
                          media="(min-width: 992px)"
                          srcSet="https://img.upanh.tv/2025/01/10/tour-du-lich-da-nang-1d4e640b946221d48.jpg"
                        />
                        <source
                          media="(min-width: 569px)"
                          srcSet="https://img.upanh.tv/2025/01/10/tour-du-lich-da-nang-1d4e640b946221d48.jpg"
                        />
                        <source
                          media="(max-width: 567px)"
                          srcSet="https://img.upanh.tv/2025/01/10/tour-du-lich-da-nang-1d4e640b946221d48.jpg"
                        />
                        <img
                          src="https://img.upanh.tv/2025/01/10/tour-du-lich-da-nang-1d4e640b946221d48.jpg"
                          alt="Banner 2"
                          className="img-responsive"
                        />
                      </picture>
                    </SwiperSlide>
                    <SwiperSlide>
                      <picture>
                        <source
                          media="(min-width: 1200px)"
                          srcSet="https://img.upanh.tv/2025/01/10/img20230818104907-1692330738831385338779.png"
                        />
                        <source
                          media="(min-width: 992px)"
                          srcSet="https://img.upanh.tv/2025/01/10/img20230818104907-1692330738831385338779.png"
                        />
                        <source
                          media="(min-width: 569px)"
                          srcSet="https://img.upanh.tv/2025/01/10/img20230818104907-1692330738831385338779.png"
                        />
                        <source
                          media="(max-width: 567px)"
                          srcSet="https://img.upanh.tv/2025/01/10/img20230818104907-1692330738831385338779.png"
                        />
                        <img
                          src="https://img.upanh.tv/2025/01/10/img20230818104907-1692330738831385338779.png"
                          alt="Banner 3"
                          className="img-responsive"
                        />
                      </picture>
                    </SwiperSlide>
                  </Swiper>
                </Link>
              </div>
            </div>
          </div>
          <div className="nd-tour-search-index">
            <div className="container">
              <div className="form-search nd-main-search">
                <div
                  className="row"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "0px",
                  }}
                >
                  <div className="col-lg-5 col-md-7 col-12">
                    <div className="item address date rounded">
                      <div className="row">
                        <div>
                          <div className="group-search item-chose destination">
                            <div className="icon icon-location">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={18}
                                height={24}
                                viewBox="0 0 18 24"
                                fill="none"
                              >
                                <path
                                  d="M9.01107 1.625C13.103 1.625 16.9043 4.90179 16.9043 9.03571C16.9043 11.7682 15.9811 13.7001 14.434 15.9524C12.707 18.4667 10.5018 20.8338 9.51601 21.8515C9.23162 22.1451 8.76735 22.1451 8.48296 21.8515C7.4972 20.8338 5.29202 18.4667 3.56496 15.9524C2.01787 13.7001 1.09473 11.7682 1.09473 9.03571C1.09473 4.90179 4.89588 1.625 8.98782 1.625"
                                  stroke="var(--maincolor)"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M11.9637 9.47235C11.9637 11.1256 10.6409 12.4928 9.00411 12.4928C7.36733 12.4928 6.03516 11.1256 6.03516 9.47235C6.03516 7.81912 7.36733 6.56542 9.00411 6.56542C10.6409 6.56542 11.9637 7.81912 11.9637 9.47235Z"
                                  stroke="var(--maincolor)"
                                  strokeWidth={2}
                                />
                              </svg>
                            </div>
                            <div className="group-search-content">
                              <input
                                type="text"
                                className="filter-destination"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Where do you want to go?"
                                name="search-add"
                                style={{ width: "100%" }}
                              />
                              <div className="list" style={{ width: "100%" }}>
                                <div className="items-list">
                                  <div className="scroll">
                                    {filteredDestinations.length > 0 ? (
                                      filteredDestinations
                                        .sort((a, b) =>
                                          a?.destination?.name.localeCompare(
                                            b?.destination?.name
                                          )
                                        )
                                        .map((destination) => (
                                          <div
                                            key={destination?.destination?.name}
                                            onClick={() =>
                                              handleSelectDestination(
                                                destination
                                              )
                                            }
                                            className="destination-item"
                                          >
                                            {destination?.destination?.name}
                                          </div>
                                        ))
                                    ) : (
                                      <p>No matching results were found.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5 col-md-7 col-12">
                    <div className="item address date rounded">
                      <div className="row">
                        <div>
                          <div className="group-search item-chose date">
                            {/* Biểu tượng lịch */}
                            <div
                              className="icon icon-calendar"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                document.getElementById("date-input").focus()
                              } // Nhấn vào biểu tượng lịch cũng mở bộ chọn ngày
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={18}
                                height={24}
                                viewBox="0 0 18 24"
                                fill="none"
                              >
                                <path
                                  d="M3 4.5H15M4.5 2V5.25M13.5 2V5.25M3 8.25H15V20.25H3V8.25ZM6.375 11.625H8.625V13.875H6.375V11.625Z"
                                  stroke="var(--maincolor)"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>

                            {/* Ô input */}
                            <div className="group-search-content">
                              <input
                                id="date-input"
                                type="text" // Dùng text thay vì date để hiển thị placeholder
                                placeholder="Chọn ngày đi"
                                value={
                                  selectedDate
                                    ? selectedDate.toISOString().split("T")[0]
                                    : ""
                                }
                                readOnly // Chỉ hiển thị ngày đã chọn, không thể nhập trực tiếp
                                className="filter-date"
                                style={{ width: "100%" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-2 col-md-7 col-12">
                    <span
                      className="btn-search bgc d-flex align-items-center justify-content-center rounded"
                      onClick={handleSearchClick}
                    >
                      Search
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section_whychoose">
            <div
              className="container"
              ref={elementRef}
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(100px)",
                transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
              }}
            >
              <h2>Why should you choose Karnel Travel</h2>
              <div className="block-content">
                <div className="row">
                  <div className="col-lg-4 col-md-4 col-12 item">
                    <div className="inner">
                      <div className="icon">
                        <img
                          className="img-responsive lazyload1"
                          src="https://bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_whychoose_1.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_whychoose_1.png?1728351987196"
                          alt="Giá tốt nhất cho bạn"
                        />
                      </div>
                      <div className="info">
                        <h3>Best price for you</h3>
                        <p>
                          There are many different price levels to suit.
                          <br className="d-xl-block d-none" /> with your budget
                          and needs
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-12 item">
                    <div className="inner">
                      <div className="icon">
                        <img
                          className="img-responsive lazyload loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_whychoose_2.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_whychoose_2.png?1728351987196"
                          alt="Booking dễ dàng"
                          data-was-processed="true"
                        />
                      </div>
                      <div className="info">
                        <h3>Booking made easy</h3>
                        <p>
                          Booking and care steps
                          <br className="d-xl-block d-none" />
                          customers quickly and conveniently
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-12 item">
                    <div className="inner">
                      <div className="icon">
                        <img
                          className="img-responsive lazyload loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_whychoose_3.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_whychoose_3.png?1728351987196"
                          alt="Tour du lịch tối ưu"
                          data-was-processed="true"
                        />
                      </div>
                      <div className="info">
                        <h3>Optimal Tour</h3>
                        <p>
                          Variety of tour types
                          <br className="d-xl-block d-none" /> with different
                          prices
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section_step">
            <div className="container">
              <div className="block-title">
                <h2>Booking with Karnel Travel</h2>
                <p>Just 3 simple and easy steps to have a great experience!</p>
              </div>
              <div className="block-content">
                <div className="row">
                  <div
                    className="col-lg-4 col-md-4 col-12 item"
                    ref={elementRef}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateX(0)"
                        : "translateX(-100px)", // Chạy từ trái vào
                      transition:
                        "opacity 0.5s ease-out, transform 0.5s ease-out",
                    }}
                  >
                    <div className="number-thumb">
                      <div className="number">1</div>
                      <img
                        className="thumb lazyload1"
                        src="https://bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_step_1.png?1728351987196"
                        data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_step_1.png?1728351987196"
                        alt="Tìm nơi muốn đến"
                      />
                    </div>
                    <div className="info">
                      <h3>Find where you want to go</h3>
                      <p>
                        Wherever you want to go, we will
                        <br className="d-lg-block d-none" /> has everything you
                        need
                      </p>
                    </div>
                  </div>
                  <div
                    className="col-lg-4 col-md-4 col-12 item"
                    ref={elementRef}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateY(0)"
                        : "translateY(100px)",
                      transition:
                        "opacity 0.5s ease-out, transform 0.5s ease-out",
                    }}
                  >
                    <div className="number-thumb">
                      <div className="number">2</div>
                      <img
                        className="thumb lazyload1"
                        src="https://bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_step_2.png?1728351987196"
                        data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_step_2.png?1728351987196"
                        alt="Đặt vé"
                      />
                    </div>
                    <div className="info">
                      <h3>Book tickets</h3>
                      <p>
                        Kernel Travel will assist you in booking tickets
                        directly
                        <br className="d-lg-block d-none" /> fast and convenient
                      </p>
                    </div>
                  </div>
                  <div
                    className="col-lg-4 col-md-4 col-12 item"
                    ref={elementRef}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateX(0)"
                        : "translateX(100px)", // Chạy từ phải vào
                      transition:
                        "opacity 0.5s ease-out, transform 0.5s ease-out",
                    }}
                  >
                    <div className="number-thumb">
                      <div className="number">3</div>
                      <img
                        className="thumb lazyload1"
                        src="https://bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_step_3.png?1728351987196"
                        data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/icon_step_3.png?1728351987196"
                        alt="Thanh toán"
                      />
                    </div>
                    <div className="info">
                      <h3>Pay</h3>
                      <p>
                        Complete the checkout and you're ready to go.
                        <br className="d-lg-block d-none" />
                        for the trip now
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section_about">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-lg-5 col-md-12 col-12 col-left">
                  <h2>
                    Plan your trip
                    <br className="d-xl-block d-none" /> yours with Karnel
                    Travel
                  </h2>
                  <div className="des">
                    It is our pleasure to bring you memorable trips. To bring
                    you inspiring trips. Explore new lands. Explore freely with
                    us.
                  </div>
                  <div className="content_about">
                    <div className="title">
                      Great opportunity to place your trust in Karnel Travel.
                      Why not?
                    </div>
                    <div className="list-content">
                      <div className="item">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={40}
                          height={40}
                          viewBox="0 0 40 40"
                          fill="none"
                        >
                          <rect width={40} height={40} rx={20} fill="#E6F4FF" />
                          <path
                            d="M12 19.5455L16.9523 24.3289C17.3398 24.7033 17.9542 24.7033 18.3417 24.3289L28 15"
                            stroke="var(--maincolor)"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="text">
                          More than 10,000 customers nationwide have accompanied
                          us
                        </div>
                      </div>
                      <div className="item">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={40}
                          height={40}
                          viewBox="0 0 40 40"
                          fill="none"
                        >
                          <rect width={40} height={40} rx={20} fill="#E6F4FF" />
                          <path
                            d="M12 19.5455L16.9523 24.3289C17.3398 24.7033 17.9542 24.7033 18.3417 24.3289L28 15"
                            stroke="var(--maincolor)"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="text">
                          Covering more than 1,000 domestic and international
                          tours
                        </div>
                      </div>
                      <div className="item">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={40}
                          height={40}
                          viewBox="0 0 40 40"
                          fill="none"
                        >
                          <rect width={40} height={40} rx={20} fill="#E6F4FF" />
                          <path
                            d="M12 19.5455L16.9523 24.3289C17.3398 24.7033 17.9542 24.7033 18.3417 24.3289L28 15"
                            stroke="var(--maincolor)"
                            strokeWidth={3}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="text">Tours and prices vary</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-7 offset-md-2 offset-lg-0 col-md-8 col-12 col-right">
                  <img
                    className="img-responsive lazyload loaded"
                    src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img-section-about.jpg?1728351987196"
                    data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img-section-about.jpg?1728351987196"
                    alt="ND Travel"
                    data-was-processed="true"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="section_tour_good_price">
            <div className="container">
              <div className="block-title">
                <h2>
                  <Link href="san-pham-noi-bat" title="Great Deals on Tours">
                    Great Deals on Tours
                  </Link>
                </h2>
                <p>Over 1,000 diverse tours with limited-time great prices</p>
              </div>
              <div className="block-product" style={{ marginLeft: "-29px" }}>
                <div
                  className="tour-good-price-swiper swiper-container swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
                  style={{ cursor: "grab" }}
                >
                  <div
                    className="swiper-wrapper"
                    style={{ transform: "translate3d(0px, 0px, 0px)" }}
                  >
                    <Swiper
                      className="my-swiper"
                      modules={[Navigation]}
                      spaceBetween={20}
                      slidesPerView={4} // Mặc định hiển thị 4 slide
                      navigation={true}
                      loop={false} // Dừng lại khi hết phần tử
                      style={{ cursor: "grab" }}
                      breakpoints={{
                        1200: {
                          slidesPerView: 4,
                        },
                        768: {
                          slidesPerView: 2,
                        },
                        576: {
                          slidesPerView: 1,
                        },
                        0: {
                          slidesPerView: 1,
                        },
                      }}
                    >
                      {tourData.length === 0 ? (
                        <Typography variant="h6" textAlign="center">
                          No tours available.
                        </Typography>
                      ) : (
                        tourData
                          .sort(
                            (a, b) =>
                              (b?.packagePrice || 0) - (a?.packagePrice || 0)
                          )
                          .slice(0, 10)
                          .map((item, index) => (
                            <SwiperSlide key={index}>
                              <div
                                className="swiper-slide swiper-slide-visible swiper-slide-active"
                                style={{ width: "297.5px", marginRight: 10 }}
                              >
                                <form
                                  action="/cart/add"
                                  method="post"
                                  className="variants product-action "
                                  data-cart-form=""
                                  data-id={`${item?.tours?.tourId}`}
                                  encType="multipart/form-data"
                                >
                                  <div className="product-thumbnail">
                                    <Link
                                      className="image_thumb scale_hover"
                                      to={`/tour/${item?.tours?.tourId}`}
                                      title={item?.tours?.name}
                                    >
                                      <img
                                        src={
                                          item?.tours?.imageUrl?.split(
                                            ";"
                                          )[0] || "default-image-url"
                                        }
                                        alt={item?.tours?.name}
                                      />
                                    </Link>
                                  </div>
                                  <div className="product-info">
                                    <div className="start">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={14}
                                        height={17}
                                        viewBox="0 0 14 17"
                                        fill="none"
                                      >
                                        <path
                                          d="M6.72266 1C9.68069 1 12.4286 3.36877 12.4286 6.35714C12.4286 8.33243 11.7612 9.72895 10.6429 11.3571C9.47097 13.0632 7.99455 14.6756 7.22848 15.4754C6.94575 15.7706 6.48282 15.7706 6.20009 15.4754C5.43402 14.6756 3.9576 13.0632 2.78571 11.3571C1.66733 9.72895 1 8.33243 1 6.35714C1 3.36877 3.74782 1 6.70585 1"
                                          stroke="#99A2BC"
                                          strokeWidth={1}
                                          strokeLinecap="round"
                                        />
                                        <path
                                          d="M8.85713 6.67259C8.85713 7.86769 7.90085 8.85605 6.71764 8.85605C5.53443 8.85605 4.57141 7.86769 4.57141 6.67259C4.57141 5.47748 5.53443 4.57119 6.71764 4.57119C7.90085 4.57119 8.85713 5.47748 8.85713 6.67259Z"
                                          stroke="#99A2BC"
                                          strokeWidth={1}
                                        />
                                      </svg>
                                      Departure from:{" "}
                                      {item?.tours?.tourDepartureLocation ||
                                        "No information available"}
                                    </div>
                                    <h3 className="product-name">
                                      <Link
                                        to={`/tour/${item?.tours?.tourId}`}
                                        style={{
                                          textDecoration: "none",
                                          color: "inherit",
                                        }}
                                      >
                                        <a href>{item?.tours?.name}</a>
                                      </Link>
                                    </h3>
                                    <div
                                      className="sapo-product-reviews-badge"
                                      data-id={item?.tours?.tourId}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Reviews:{" "}
                                        {Array(5)
                                          .fill(0)
                                          .map((_, starIndex) =>
                                            starIndex <
                                              (item?.tours?.rating || 0) ? (
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
                                    </div>
                                    <div className="price-box">
                                      <Typography
                                        variant="body1"
                                        color="primary"
                                      >
                                        Price:{" "}
                                        {item?.packagePrice
                                          ? ` $ ${item?.packagePrice.toLocaleString()}`
                                          : "No information"}
                                      </Typography>
                                    </div>
                                    <div className="time">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={16}
                                        height={16}
                                        viewBox="0 0 16 16"
                                        fill="none"
                                      >
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
                                </form>
                              </div>
                            </SwiperSlide>
                          ))
                      )}
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section_flashsale">
            <div className="container">
              <div className="block-title">
                <h2>Featured tour of the week</h2>
                <p>Unbelievably low tour prices</p>
              </div>

              <div className="reponsiven">
                <div className="block-product">
                  <Swiper
                    className="your-swiper"
                    modules={[Navigation, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={2}
                    navigation={{
                      nextEl: ".swiper-button-next",
                      prevEl: ".swiper-button-prev",
                    }}
                    loop={false}
                    autoplay={{
                      delay: 1500,
                      disableOnInteraction: false,
                    }}
                    onSlideChange={() => console.log("Slide changed")}
                    onSwiper={(swiper) => console.log(swiper)}
                    style={{ cursor: "grab" }}
                  >
                    {tourData.length === 0 ? (
                      <Typography variant="h6" textAlign="center">
                        No tours available.
                      </Typography>
                    ) : (
                      tourData
                        .filter((item) => item?.tours?.rating === 5)
                        .sort(
                          (a, b) =>
                            (a?.packagePrice || 0) - (b?.packagePrice || 0)
                        )
                        .map((item, index) => (
                          <SwiperSlide key={index}>
                            <div className="item_product_main">
                              <form
                                action="/cart/add"
                                method="post"
                                className="style-2 variants product-action"
                                data-cart-form=""
                                data-id={`${item?.tours?.tourId}`}
                                encType="multipart/form-data"
                              >
                                <div className="product-thumbnail">
                                  <Link
                                    className="image_thumb scale_hover"
                                    to={`/tour/${item?.tours?.tourId}`}
                                    title={item?.tours?.name}
                                  >
                                    <img
                                      src={
                                        item?.tours?.imageUrl?.split(";")[0] ||
                                        "default-image-url"
                                      }
                                      alt={item?.tours?.name}
                                    />
                                  </Link>
                                  <div className="action d-xl-block d-none">
                                    <div className="actions-secondary">
                                      <svg
                                        className="icon"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                      >
                                        <path d="M1133 4800 c-539 -94 -954 -505 -1088 -1075 -112 -478 -9 -946 308 -1400 127 -181 228 -297 471 -541 265 -265 409 -393 1159 -1037 394 -338 516 -438 542 -443 80 -15 77 -16 612 443 279 239 600 517 713 616 246 216 655 623 767 762 226 282 366 531 438 780 163 565 2 1191 -404 1567 -388 359 -966 450 -1430 225 -223 -108 -442 -316 -592 -562 -35 -57 -66 -104 -69 -104 -3 0 -34 47 -69 104 -189 310 -462 536 -761 630 -179 56 -404 69 -597 35z" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                <div className="product-info">
                                  <div className="start">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={14}
                                      height={17}
                                      viewBox="0 0 14 17"
                                      fill="none"
                                    >
                                      <path
                                        d="M6.72266 1C9.68069 1 12.4286 3.36877 12.4286 6.35714C12.4286 8.33243 11.7612 9.72895 10.6429 11.3571C9.47097 13.0632 7.99455 14.6756 7.22848 15.4754C6.94575 15.7706 6.48282 15.7706 6.20009 15.4754C5.43402 14.6756 3.9576 13.0632 2.78571 11.3571C1.66733 9.72895 1 8.33243 1 6.35714C1 3.36877 3.74782 1 6.70585 1"
                                        stroke="#99A2BC"
                                        strokeWidth={1}
                                        strokeLinecap="round"
                                      />
                                      <path
                                        d="M8.85713 6.67259C8.85713 7.86769 7.90085 8.85605 6.71764 8.85605C5.53443 8.85605 4.57141 7.86769 4.57141 6.67259C4.57141 5.47748 5.53443 4.57119 6.71764 4.57119C7.90085 4.57119 8.85713 5.47748 8.85713 6.67259Z"
                                        stroke="#99A2BC"
                                        strokeWidth={1}
                                      />
                                    </svg>
                                    Departure from:{" "}
                                    {item?.tours?.tourDepartureLocation ||
                                      "No information available"}
                                  </div>

                                  <h3 className="product-name">
                                    <Link
                                      to={`/tour/${item?.tours?.tourId}`}
                                      style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                      }}
                                    >
                                      <a href>{item?.tours?.name}</a>
                                    </Link>
                                  </h3>
                                  <div
                                    className="sapo-product-reviews-badge"
                                    data-id={item?.tours?.tourId}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      Reviews:{" "}
                                      {Array(5)
                                        .fill(0)
                                        .map((_, starIndex) =>
                                          starIndex <
                                            (item?.tours?.rating || 0) ? (
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
                                  </div>

                                  <div className="price-box">
                                    <Typography variant="body1" color="primary">
                                      Price:{" "}
                                      {item?.packagePrice
                                        ? ` $ ${item?.packagePrice.toLocaleString()}`
                                        : "No information"}
                                    </Typography>
                                  </div>

                                  <div className="time">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={16}
                                      height={16}
                                      viewBox="0 0 16 16"
                                      fill="none"
                                    >
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
                              </form>
                            </div>
                          </SwiperSlide>
                        ))
                    )}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
          <div className="section_experience">
            <div className="container">
              <div className="row">
                <div className="col-xl-5 col-lg-4 col-12 block-title">
                  <div className="title-old">Explore the World</div>
                  <h2>Experiences &amp; Activities</h2>
                  <div className="des">
                    Karnel Travel offers you a wide variety of travel types with
                    <br className="d-xl-block d-none" /> diverse experiences.
                    Don't hesitate, get ready and start now!
                  </div>
                </div>
                <div className="col-xl-7 col-lg-8 col-12 block-content">
                  <div className="list-experience">
                    <div className="item">
                      <Link href="/collections/all" title="Resort">
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_1.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_1.png?1728351987196"
                          alt="Resort"
                          data-was-processed="true"
                        />
                      </Link>
                      <h3>
                        <Link>Resort</Link>
                      </h3>
                    </div>
                    <div className="item">
                      <img
                        className="img-responsive lazyload11loaded"
                        src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_2.png?1728351987196"
                        data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_2.png?1728351987196"
                        alt="Cable Car"
                        data-was-processed="true"
                      />
                      <h3>
                        <Link>Cable Car</Link>
                      </h3>
                    </div>
                    <div className="item">
                      <Link>
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_3.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_3.png?1728351987196"
                          alt="Cruise"
                          data-was-processed="true"
                        />
                      </Link>
                      <h3>
                        <Link>Cruise</Link>
                      </h3>
                    </div>
                    <div className="item">
                      <Link>
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_4.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_4.png?1728351987196"
                          alt="Adventure"
                          data-was-processed="true"
                        />
                      </Link>
                      <h3>
                        <Link>Adventure</Link>
                      </h3>
                    </div>
                    <div className="item">
                      <Link>
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_5.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_5.png?1728351987196"
                          alt="Discovery"
                          data-was-processed="true"
                        />
                      </Link>
                      <h3>
                        <Link>Discovery</Link>
                      </h3>
                    </div>
                    <div className="item">
                      <Link>
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_6.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_6.png?1728351987196"
                          alt="Underwater"
                          data-was-processed="true"
                        />
                      </Link>
                      <h3>
                        <Link>Underwater</Link>
                      </h3>
                    </div>
                    <div className="item">
                      <Link>
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_7.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_7.png?1728351987196"
                          alt="Cuisine"
                          data-was-processed="true"
                        />
                      </Link>
                      <h3>
                        <Link>Cuisine</Link>
                      </h3>
                    </div>
                    <div className="item">
                      <Link>
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_8.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_experience_8.png?1728351987196"
                          alt="Camping"
                          data-was-processed="true"
                        />
                      </Link>
                      <h3>
                        <Link>Camping</Link>
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section_favorite_travel">
            <div className="container">
              <div className="block-content">
                <div className="list-favorite-travel row-1 row">
                  <div className="col-lg-4 col-md-4 col-12 item">
                    <div className="inner">
                      <Link>
                        <img
                          width={386}
                          height={312}
                          className="img-responsive lazyload11loaded"
                          src="https://dulichhobabe.com/UserFiles/image/10%20diem%20den%20bac%20kan/ho%20ba%20be.jpg"
                          data-src="https://dulichhobabe.com/UserFiles/image/10%20diem%20den%20bac%20kan/ho%20ba%20be.jpg"
                          alt="Du Lịch Bắc Cạn"
                          data-was-processed="true"
                        />
                      </Link>
                      <div className="info info-1">
                        <h3>
                          <Link>Bac Kan Travel</Link>
                        </h3>
                        <p>Travel deals - Hot combos</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-12 item">
                    <div className="inner">
                      <Link href="" title="Combo du lịch đà lạt">
                        <img
                          width={386}
                          height={312}
                          className="img-responsive lazyload11loaded"
                          src="https://ttchospitality.vn/files/images/BLOG/thung-lung-tinh-yeu.jpg"
                          data-src="https://ttchospitality.vn/files/images/BLOG/thung-lung-tinh-yeu.jpg"
                          alt="https://ttchospitality.vn/files/images/BLOG/thung-lung-tinh-yeu.jpg"
                          data-was-processed="true"
                        />
                      </Link>
                      <div className="info info-1">
                        <h3>
                          <Link>Da Lat Travel</Link>
                        </h3>
                        <p>Travel deals - Hot combos</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-4 col-12 item">
                    <div className="inner">
                      <Link>
                        <img
                          width={386}
                          height={312}
                          className="img-responsive lazyload11loaded"
                          src="https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA"
                          data-src="https://vcdn1-dulich.vnecdn.net/2022/06/03/cauvang-1654247842-9403-1654247849.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Swd6JjpStebEzT6WARcoOA"
                          alt="Du Lịch Đà nẵng"
                          data-was-processed="true"
                        />
                      </Link>
                      <div className="info info-1">
                        <h3>
                          <Link>Travel to Đa NangNang</Link>
                        </h3>
                        <p>Travel deals - Hot combos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section_customer_reviews">
            <div className="container">
              <div className="block-title">
                <h2>What customers say about us</h2>
                <p>
                  We are honored to have had the opportunity to accompany more
                  than 10,000 people customers around the world
                </p>
              </div>
              <div className="block-content">
                <div
                  className="customer-review-swiper swiper-container swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
                  style={{ cursor: "grab" }}
                >
                  <div
                    className="swiper-wrapper"
                    style={{ transform: "translate3d(0px, 0px, 0px)" }}
                  >
                    <div
                      className="swiper-slide swiper-slide-visible swiper-slide-active"
                      style={{ width: "386.667px", marginRight: 30 }}
                    >
                      <p>
                        "The service was great. I had an amazing trip memorable.
                        Karnel Travel provided very quick support when
                        encountering problems And I really appreciate customer
                        care. Thankfully Lucky to choose Karnel Travel for this
                        trip."
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={169}
                        height={24}
                        viewBox="0 0 169 24"
                        fill="none"
                      >
                        <path
                          d="M11.3482 3.36346C11.8243 2.39761 13.2014 2.39761 13.6774 3.36346L15.6188 7.30237C15.8079 7.68612 16.174 7.95206 16.5974 8.01336L20.9036 8.63675C21.9673 8.79074 22.394 10.0967 21.6263 10.849L18.4919 13.9209C18.1878 14.2189 18.0492 14.6469 18.1208 15.0665L18.8599 19.3997C19.0411 20.4618 17.9243 21.2697 16.9722 20.7653L13.1207 18.7247C12.7405 18.5233 12.2852 18.5233 11.905 18.7247L8.05349 20.7653C7.10136 21.2697 5.98456 20.4618 6.16575 19.3997L6.9046 15.0684C6.97635 14.6478 6.83682 14.2187 6.53135 13.9207L3.38475 10.8511C2.61417 10.0994 3.0405 8.79039 4.10598 8.63666L8.42788 8.01309C8.85154 7.95197 9.21785 7.68596 9.40708 7.30201L11.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M47.3482 3.36346C47.8243 2.39761 49.2014 2.39761 49.6774 3.36346L51.6188 7.30237C51.8079 7.68612 52.174 7.95206 52.5974 8.01336L56.9036 8.63675C57.9673 8.79074 58.394 10.0967 57.6263 10.849L54.4919 13.9209C54.1878 14.2189 54.0492 14.6469 54.1208 15.0665L54.8599 19.3997C55.0411 20.4618 53.9243 21.2697 52.9722 20.7653L49.1207 18.7247C48.7405 18.5233 48.2852 18.5233 47.905 18.7247L44.0535 20.7653C43.1014 21.2697 41.9846 20.4618 42.1658 19.3997L42.9046 15.0684C42.9764 14.6478 42.8368 14.2187 42.5314 13.9207L39.3847 10.8511C38.6142 10.0994 39.0405 8.79039 40.106 8.63666L44.4279 8.01309C44.8515 7.95197 45.2178 7.68596 45.4071 7.30201L47.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M83.3482 3.36346C83.8243 2.39761 85.2014 2.39761 85.6774 3.36346L87.6188 7.30237C87.8079 7.68612 88.174 7.95206 88.5974 8.01336L92.9036 8.63675C93.9673 8.79074 94.394 10.0967 93.6263 10.849L90.4919 13.9209C90.1878 14.2189 90.0492 14.6469 90.1208 15.0665L90.8599 19.3997C91.0411 20.4618 89.9243 21.2697 88.9722 20.7653L85.1207 18.7247C84.7405 18.5233 84.2852 18.5233 83.905 18.7247L80.0535 20.7653C79.1014 21.2697 77.9846 20.4618 78.1658 19.3997L78.9046 15.0684C78.9764 14.6478 78.8368 14.2187 78.5314 13.9207L75.3847 10.8511C74.6142 10.0994 75.0405 8.79039 76.106 8.63666L80.4279 8.01309C80.8515 7.95197 81.2178 7.68596 81.4071 7.30201L83.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M119.348 3.36346C119.824 2.39761 121.201 2.39761 121.677 3.36346L123.619 7.30237C123.808 7.68612 124.174 7.95206 124.597 8.01336L128.904 8.63675C129.967 8.79074 130.394 10.0967 129.626 10.849L126.492 13.9209C126.188 14.2189 126.049 14.6469 126.121 15.0665L126.86 19.3997C127.041 20.4618 125.924 21.2697 124.972 20.7653L121.121 18.7247C120.74 18.5233 120.285 18.5233 119.905 18.7247L116.053 20.7653C115.101 21.2697 113.985 20.4618 114.166 19.3997L114.905 15.0684C114.976 14.6478 114.837 14.2187 114.531 13.9207L111.385 10.8511C110.614 10.0994 111.041 8.79039 112.106 8.63666L116.428 8.01309C116.852 7.95197 117.218 7.68596 117.407 7.30201L119.348 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M155.348 3.36297C155.824 2.39712 157.201 2.39712 157.677 3.36297L159.619 7.30188C159.808 7.68563 160.174 7.95157 160.597 8.01287L164.903 8.63626C165.967 8.79025 166.394 10.0962 165.626 10.8485L162.492 13.9204C162.188 14.2184 162.049 14.6464 162.121 15.0661L162.86 19.3992C163.041 20.4613 161.924 21.2693 160.972 20.7648L157.12 18.7242C156.74 18.5228 156.285 18.5228 155.905 18.7242L152.053 20.7648C151.101 21.2693 149.984 20.4613 150.166 19.3992L150.904 15.0679C150.976 14.6473 150.837 14.2182 150.531 13.9202L147.385 10.8506C146.614 10.0989 147.04 8.7899 148.106 8.63617L152.428 8.01261C152.851 7.95148 153.218 7.68547 153.407 7.30152L155.348 3.36297Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                      </svg>
                      <div className="thumb">
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_customer_review_1.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_customer_review_1.png?1728351987196"
                          alt="Salim"
                          data-was-processed="true"
                        />
                      </div>
                      <div className="name">Salim</div>
                    </div>
                    <div
                      className="swiper-slide swiper-slide-visible swiper-slide-next"
                      style={{ width: "386.667px", marginRight: 30 }}
                    >
                      <p>
                        "The service was great. I had an amazing trip memorable.
                        Karnel Travel provided very quick support when
                        encountering problems And I really appreciate customer
                        care. Thankfully Lucky to choose Karnel Travel for this
                        trip."
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={169}
                        height={24}
                        viewBox="0 0 169 24"
                        fill="none"
                      >
                        <path
                          d="M11.3482 3.36346C11.8243 2.39761 13.2014 2.39761 13.6774 3.36346L15.6188 7.30237C15.8079 7.68612 16.174 7.95206 16.5974 8.01336L20.9036 8.63675C21.9673 8.79074 22.394 10.0967 21.6263 10.849L18.4919 13.9209C18.1878 14.2189 18.0492 14.6469 18.1208 15.0665L18.8599 19.3997C19.0411 20.4618 17.9243 21.2697 16.9722 20.7653L13.1207 18.7247C12.7405 18.5233 12.2852 18.5233 11.905 18.7247L8.05349 20.7653C7.10136 21.2697 5.98456 20.4618 6.16575 19.3997L6.9046 15.0684C6.97635 14.6478 6.83682 14.2187 6.53135 13.9207L3.38475 10.8511C2.61417 10.0994 3.0405 8.79039 4.10598 8.63666L8.42788 8.01309C8.85154 7.95197 9.21785 7.68596 9.40708 7.30201L11.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M47.3482 3.36346C47.8243 2.39761 49.2014 2.39761 49.6774 3.36346L51.6188 7.30237C51.8079 7.68612 52.174 7.95206 52.5974 8.01336L56.9036 8.63675C57.9673 8.79074 58.394 10.0967 57.6263 10.849L54.4919 13.9209C54.1878 14.2189 54.0492 14.6469 54.1208 15.0665L54.8599 19.3997C55.0411 20.4618 53.9243 21.2697 52.9722 20.7653L49.1207 18.7247C48.7405 18.5233 48.2852 18.5233 47.905 18.7247L44.0535 20.7653C43.1014 21.2697 41.9846 20.4618 42.1658 19.3997L42.9046 15.0684C42.9764 14.6478 42.8368 14.2187 42.5314 13.9207L39.3847 10.8511C38.6142 10.0994 39.0405 8.79039 40.106 8.63666L44.4279 8.01309C44.8515 7.95197 45.2178 7.68596 45.4071 7.30201L47.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M83.3482 3.36346C83.8243 2.39761 85.2014 2.39761 85.6774 3.36346L87.6188 7.30237C87.8079 7.68612 88.174 7.95206 88.5974 8.01336L92.9036 8.63675C93.9673 8.79074 94.394 10.0967 93.6263 10.849L90.4919 13.9209C90.1878 14.2189 90.0492 14.6469 90.1208 15.0665L90.8599 19.3997C91.0411 20.4618 89.9243 21.2697 88.9722 20.7653L85.1207 18.7247C84.7405 18.5233 84.2852 18.5233 83.905 18.7247L80.0535 20.7653C79.1014 21.2697 77.9846 20.4618 78.1658 19.3997L78.9046 15.0684C78.9764 14.6478 78.8368 14.2187 78.5314 13.9207L75.3847 10.8511C74.6142 10.0994 75.0405 8.79039 76.106 8.63666L80.4279 8.01309C80.8515 7.95197 81.2178 7.68596 81.4071 7.30201L83.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M119.348 3.36346C119.824 2.39761 121.201 2.39761 121.677 3.36346L123.619 7.30237C123.808 7.68612 124.174 7.95206 124.597 8.01336L128.904 8.63675C129.967 8.79074 130.394 10.0967 129.626 10.849L126.492 13.9209C126.188 14.2189 126.049 14.6469 126.121 15.0665L126.86 19.3997C127.041 20.4618 125.924 21.2697 124.972 20.7653L121.121 18.7247C120.74 18.5233 120.285 18.5233 119.905 18.7247L116.053 20.7653C115.101 21.2697 113.985 20.4618 114.166 19.3997L114.905 15.0684C114.976 14.6478 114.837 14.2187 114.531 13.9207L111.385 10.8511C110.614 10.0994 111.041 8.79039 112.106 8.63666L116.428 8.01309C116.852 7.95197 117.218 7.68596 117.407 7.30201L119.348 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M155.348 3.36297C155.824 2.39712 157.201 2.39712 157.677 3.36297L159.619 7.30188C159.808 7.68563 160.174 7.95157 160.597 8.01287L164.903 8.63626C165.967 8.79025 166.394 10.0962 165.626 10.8485L162.492 13.9204C162.188 14.2184 162.049 14.6464 162.121 15.0661L162.86 19.3992C163.041 20.4613 161.924 21.2693 160.972 20.7648L157.12 18.7242C156.74 18.5228 156.285 18.5228 155.905 18.7242L152.053 20.7648C151.101 21.2693 149.984 20.4613 150.166 19.3992L150.904 15.0679C150.976 14.6473 150.837 14.2182 150.531 13.9202L147.385 10.8506C146.614 10.0989 147.04 8.7899 148.106 8.63617L152.428 8.01261C152.851 7.95148 153.218 7.68547 153.407 7.30152L155.348 3.36297Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                      </svg>
                      <div className="thumb">
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_customer_review_2.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_customer_review_2.png?1728351987196"
                          alt="Moon"
                          data-was-processed="true"
                        />
                      </div>
                      <div className="name">Moon</div>
                    </div>
                    <div
                      className="swiper-slide swiper-slide-visible"
                      style={{ width: "386.667px", marginRight: 30 }}
                    >
                      <p>
                        "The service was great. I had an amazing trip memorable.
                        Karnel Travel provided very quick support when
                        encountering problems And I really appreciate customer
                        care. Thankfully Lucky to choose Karnel Travel for this
                        trip."
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={169}
                        height={24}
                        viewBox="0 0 169 24"
                        fill="none"
                      >
                        <path
                          d="M11.3482 3.36346C11.8243 2.39761 13.2014 2.39761 13.6774 3.36346L15.6188 7.30237C15.8079 7.68612 16.174 7.95206 16.5974 8.01336L20.9036 8.63675C21.9673 8.79074 22.394 10.0967 21.6263 10.849L18.4919 13.9209C18.1878 14.2189 18.0492 14.6469 18.1208 15.0665L18.8599 19.3997C19.0411 20.4618 17.9243 21.2697 16.9722 20.7653L13.1207 18.7247C12.7405 18.5233 12.2852 18.5233 11.905 18.7247L8.05349 20.7653C7.10136 21.2697 5.98456 20.4618 6.16575 19.3997L6.9046 15.0684C6.97635 14.6478 6.83682 14.2187 6.53135 13.9207L3.38475 10.8511C2.61417 10.0994 3.0405 8.79039 4.10598 8.63666L8.42788 8.01309C8.85154 7.95197 9.21785 7.68596 9.40708 7.30201L11.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M47.3482 3.36346C47.8243 2.39761 49.2014 2.39761 49.6774 3.36346L51.6188 7.30237C51.8079 7.68612 52.174 7.95206 52.5974 8.01336L56.9036 8.63675C57.9673 8.79074 58.394 10.0967 57.6263 10.849L54.4919 13.9209C54.1878 14.2189 54.0492 14.6469 54.1208 15.0665L54.8599 19.3997C55.0411 20.4618 53.9243 21.2697 52.9722 20.7653L49.1207 18.7247C48.7405 18.5233 48.2852 18.5233 47.905 18.7247L44.0535 20.7653C43.1014 21.2697 41.9846 20.4618 42.1658 19.3997L42.9046 15.0684C42.9764 14.6478 42.8368 14.2187 42.5314 13.9207L39.3847 10.8511C38.6142 10.0994 39.0405 8.79039 40.106 8.63666L44.4279 8.01309C44.8515 7.95197 45.2178 7.68596 45.4071 7.30201L47.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M83.3482 3.36346C83.8243 2.39761 85.2014 2.39761 85.6774 3.36346L87.6188 7.30237C87.8079 7.68612 88.174 7.95206 88.5974 8.01336L92.9036 8.63675C93.9673 8.79074 94.394 10.0967 93.6263 10.849L90.4919 13.9209C90.1878 14.2189 90.0492 14.6469 90.1208 15.0665L90.8599 19.3997C91.0411 20.4618 89.9243 21.2697 88.9722 20.7653L85.1207 18.7247C84.7405 18.5233 84.2852 18.5233 83.905 18.7247L80.0535 20.7653C79.1014 21.2697 77.9846 20.4618 78.1658 19.3997L78.9046 15.0684C78.9764 14.6478 78.8368 14.2187 78.5314 13.9207L75.3847 10.8511C74.6142 10.0994 75.0405 8.79039 76.106 8.63666L80.4279 8.01309C80.8515 7.95197 81.2178 7.68596 81.4071 7.30201L83.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M119.348 3.36346C119.824 2.39761 121.201 2.39761 121.677 3.36346L123.619 7.30237C123.808 7.68612 124.174 7.95206 124.597 8.01336L128.904 8.63675C129.967 8.79074 130.394 10.0967 129.626 10.849L126.492 13.9209C126.188 14.2189 126.049 14.6469 126.121 15.0665L126.86 19.3997C127.041 20.4618 125.924 21.2697 124.972 20.7653L121.121 18.7247C120.74 18.5233 120.285 18.5233 119.905 18.7247L116.053 20.7653C115.101 21.2697 113.985 20.4618 114.166 19.3997L114.905 15.0684C114.976 14.6478 114.837 14.2187 114.531 13.9207L111.385 10.8511C110.614 10.0994 111.041 8.79039 112.106 8.63666L116.428 8.01309C116.852 7.95197 117.218 7.68596 117.407 7.30201L119.348 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M155.348 3.36297C155.824 2.39712 157.201 2.39712 157.677 3.36297L159.619 7.30188C159.808 7.68563 160.174 7.95157 160.597 8.01287L164.903 8.63626C165.967 8.79025 166.394 10.0962 165.626 10.8485L162.492 13.9204C162.188 14.2184 162.049 14.6464 162.121 15.0661L162.86 19.3992C163.041 20.4613 161.924 21.2693 160.972 20.7648L157.12 18.7242C156.74 18.5228 156.285 18.5228 155.905 18.7242L152.053 20.7648C151.101 21.2693 149.984 20.4613 150.166 19.3992L150.904 15.0679C150.976 14.6473 150.837 14.2182 150.531 13.9202L147.385 10.8506C146.614 10.0989 147.04 8.7899 148.106 8.63617L152.428 8.01261C152.851 7.95148 153.218 7.68547 153.407 7.30152L155.348 3.36297Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                      </svg>
                      <div className="thumb">
                        <img
                          className="img-responsive lazyload11loaded"
                          src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_customer_review_3.png?1728351987196"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_customer_review_3.png?1728351987196"
                          alt="Pam"
                          data-was-processed="true"
                        />
                      </div>
                      <div className="name">Pam</div>
                    </div>
                    <div
                      className="swiper-slide"
                      style={{ width: "386.667px", marginRight: 30 }}
                    >
                      <p>
                        "The service was great. I had an amazing trip memorable.
                        Karnel Travel provided very quick support when
                        encountering problems And I really appreciate customer
                        care. Thankfully Lucky to choose Karnel Travel for this
                        trip."
                      </p>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={169}
                        height={24}
                        viewBox="0 0 169 24"
                        fill="none"
                      >
                        <path
                          d="M11.3482 3.36346C11.8243 2.39761 13.2014 2.39761 13.6774 3.36346L15.6188 7.30237C15.8079 7.68612 16.174 7.95206 16.5974 8.01336L20.9036 8.63675C21.9673 8.79074 22.394 10.0967 21.6263 10.849L18.4919 13.9209C18.1878 14.2189 18.0492 14.6469 18.1208 15.0665L18.8599 19.3997C19.0411 20.4618 17.9243 21.2697 16.9722 20.7653L13.1207 18.7247C12.7405 18.5233 12.2852 18.5233 11.905 18.7247L8.05349 20.7653C7.10136 21.2697 5.98456 20.4618 6.16575 19.3997L6.9046 15.0684C6.97635 14.6478 6.83682 14.2187 6.53135 13.9207L3.38475 10.8511C2.61417 10.0994 3.0405 8.79039 4.10598 8.63666L8.42788 8.01309C8.85154 7.95197 9.21785 7.68596 9.40708 7.30201L11.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M47.3482 3.36346C47.8243 2.39761 49.2014 2.39761 49.6774 3.36346L51.6188 7.30237C51.8079 7.68612 52.174 7.95206 52.5974 8.01336L56.9036 8.63675C57.9673 8.79074 58.394 10.0967 57.6263 10.849L54.4919 13.9209C54.1878 14.2189 54.0492 14.6469 54.1208 15.0665L54.8599 19.3997C55.0411 20.4618 53.9243 21.2697 52.9722 20.7653L49.1207 18.7247C48.7405 18.5233 48.2852 18.5233 47.905 18.7247L44.0535 20.7653C43.1014 21.2697 41.9846 20.4618 42.1658 19.3997L42.9046 15.0684C42.9764 14.6478 42.8368 14.2187 42.5314 13.9207L39.3847 10.8511C38.6142 10.0994 39.0405 8.79039 40.106 8.63666L44.4279 8.01309C44.8515 7.95197 45.2178 7.68596 45.4071 7.30201L47.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M83.3482 3.36346C83.8243 2.39761 85.2014 2.39761 85.6774 3.36346L87.6188 7.30237C87.8079 7.68612 88.174 7.95206 88.5974 8.01336L92.9036 8.63675C93.9673 8.79074 94.394 10.0967 93.6263 10.849L90.4919 13.9209C90.1878 14.2189 90.0492 14.6469 90.1208 15.0665L90.8599 19.3997C91.0411 20.4618 89.9243 21.2697 88.9722 20.7653L85.1207 18.7247C84.7405 18.5233 84.2852 18.5233 83.905 18.7247L80.0535 20.7653C79.1014 21.2697 77.9846 20.4618 78.1658 19.3997L78.9046 15.0684C78.9764 14.6478 78.8368 14.2187 78.5314 13.9207L75.3847 10.8511C74.6142 10.0994 75.0405 8.79039 76.106 8.63666L80.4279 8.01309C80.8515 7.95197 81.2178 7.68596 81.4071 7.30201L83.3482 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M119.348 3.36346C119.824 2.39761 121.201 2.39761 121.677 3.36346L123.619 7.30237C123.808 7.68612 124.174 7.95206 124.597 8.01336L128.904 8.63675C129.967 8.79074 130.394 10.0967 129.626 10.849L126.492 13.9209C126.188 14.2189 126.049 14.6469 126.121 15.0665L126.86 19.3997C127.041 20.4618 125.924 21.2697 124.972 20.7653L121.121 18.7247C120.74 18.5233 120.285 18.5233 119.905 18.7247L116.053 20.7653C115.101 21.2697 113.985 20.4618 114.166 19.3997L114.905 15.0684C114.976 14.6478 114.837 14.2187 114.531 13.9207L111.385 10.8511C110.614 10.0994 111.041 8.79039 112.106 8.63666L116.428 8.01309C116.852 7.95197 117.218 7.68596 117.407 7.30201L119.348 3.36346Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                        <path
                          d="M155.348 3.36297C155.824 2.39712 157.201 2.39712 157.677 3.36297L159.619 7.30188C159.808 7.68563 160.174 7.95157 160.597 8.01287L164.903 8.63626C165.967 8.79025 166.394 10.0962 165.626 10.8485L162.492 13.9204C162.188 14.2184 162.049 14.6464 162.121 15.0661L162.86 19.3992C163.041 20.4613 161.924 21.2693 160.972 20.7648L157.12 18.7242C156.74 18.5228 156.285 18.5228 155.905 18.7242L152.053 20.7648C151.101 21.2693 149.984 20.4613 150.166 19.3992L150.904 15.0679C150.976 14.6473 150.837 14.2182 150.531 13.9202L147.385 10.8506C146.614 10.0989 147.04 8.7899 148.106 8.63617L152.428 8.01261C152.851 7.95148 153.218 7.68547 153.407 7.30152L155.348 3.36297Z"
                          fill="#FFB800"
                          stroke="#FFB800"
                          strokeWidth="1.29837"
                          strokeMiterlimit={10}
                        />
                      </svg>
                      <div className="thumb">
                        <img
                          className="img-responsive lazyload1"
                          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3MCIgaGVpZ2h0PSI3MCIgdmlld0JveD0iMCAwIDcwIDcwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmIi8+PC9zdmc+"
                          data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/img_customer_review_4.png?1728351987196"
                          alt="Toni"
                        />
                      </div>
                      <div className="name">Toni</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sec_brand">
            <div className="container">
              <h2>Accompany Karnel Travel</h2>
              <div
                className="swiper-container swiper-brand swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events"
                style={{ cursor: "grab" }}
              >
                <div
                  className="swiper-wrapper"
                  style={{ transform: "translate3d(0px, 0px, 0px)" }}
                >
                  <div
                    className="swiper-slide swiper-slide-active"
                    style={{ width: 186, marginRight: 20 }}
                  >
                    <Link href="/#" title="Karnel Travel">
                      <img
                        className="img-responsive lazyload11logo-brand"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbydn6WRhwOrlnw4TITJ0vydrrgYlFCdY9OsaJcQRbu49VS_TeWuoi_730O5664RV1ezM&usqp=CAU"
                        alt="Karnel Travel"
                      />
                    </Link>
                  </div>
                  <div
                    className="swiper-slide swiper-slide-next"
                    style={{ width: 186, marginRight: 20 }}
                  >
                    <Link href="/#" title="Karnel Travel">
                      <img
                        className="img-responsive lazyload11logo-brand"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnJrtJhlXeKVm6r47manIY-seL3-qhs1Avzr8TPtrhe7-mN_WF1waPEAhrqdREKH_ovQk&usqp=CAU"
                        alt="Karnel Travel"
                      />
                    </Link>
                  </div>
                  <div
                    className="swiper-slide"
                    style={{ width: 186, marginRight: 20 }}
                  >
                    <Link href="/#" title="Karnel Travel">
                      <img
                        className="img-responsive lazyload11logo-brand"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo8M5Z3I_sMPoec_SVN5AmMwauN93V7sHKlA&s"
                        alt="Karnel Travel"
                      />
                    </Link>
                  </div>
                  <div
                    className="swiper-slide"
                    style={{ width: 186, marginRight: 20 }}
                  >
                    <Link href="/#" title="Karnel Travel">
                      <img
                        className="img-responsive lazyload11logo-brand"
                        src="https://bizweb.dktcdn.net/100/505/645/themes/956063/assets/logo_brand4.jpg?1728351987196"
                        alt="Karnel Travel"
                      />
                    </Link>
                  </div>
                  <div
                    className="swiper-slide"
                    style={{ width: 186, marginRight: 20 }}
                  >
                    <Link href="/#" title="Karnel Travel">
                      <img
                        className="img-responsive lazyload11logo-brand"
                        src="https://bizweb.dktcdn.net/100/505/645/themes/956063/assets/logo_brand5.jpg?1728351987196"
                        alt="Karnel Travel"
                      />
                    </Link>
                  </div>
                  <div
                    className="swiper-slide"
                    style={{ width: 186, marginRight: 20 }}
                  >
                    <Link href="/collections/all" title="Karnel Travel">
                      <img
                        className="img-responsive lazyload11logo-brand"
                        src="https://bizweb.dktcdn.net/100/505/645/themes/956063/assets/logo_brand6.jpg?1728351987196"
                        alt="Karnel Travel"
                      />
                    </Link>
                  </div>
                  <div
                    className="swiper-slide"
                    style={{ width: 186, marginRight: 20 }}
                  >
                    <Link href="/collections/all" title="Karnel Travel">
                      <img
                        className="img-responsive lazyload11logo-brand"
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
                        data-src="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/logo_brand7.jpg?1728351987196"
                        alt="Karnel Travel"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="addThis_listSharing addThis_listing is-show">
          <div className="addThis_item">
            <a
              className="addThis_item-icon"
              href="tel:0123456789"
              rel="nofollow"
              aria-label="phone"
              title="Gọi ngay cho chúng tôi"
            >
              <svg
                width={44}
                height={44}
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx={22} cy={22} r={22} fill="url(#paint2_linear)" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.0087 9.35552C14.1581 9.40663 14.3885 9.52591 14.5208 9.61114C15.3315 10.148 17.5888 13.0324 18.3271 14.4726C18.7495 15.2949 18.8903 15.9041 18.758 16.3558C18.6214 16.8415 18.3953 17.0971 17.384 17.9109C16.9786 18.239 16.5988 18.5756 16.5391 18.6651C16.3855 18.8866 16.2617 19.3212 16.2617 19.628C16.266 20.3395 16.7269 21.6305 17.3328 22.6232C17.8021 23.3944 18.6428 24.3828 19.4749 25.1413C20.452 26.0361 21.314 26.6453 22.2869 27.1268C23.5372 27.7488 24.301 27.9064 24.86 27.6466C25.0008 27.5826 25.1501 27.4974 25.1971 27.4591C25.2397 27.4208 25.5683 27.0202 25.9268 26.5772C26.618 25.7079 26.7759 25.5674 27.2496 25.4055C27.8513 25.201 28.4657 25.2563 29.0844 25.5716C29.5538 25.8145 30.5779 26.4493 31.2393 26.9095C32.1098 27.5187 33.9703 29.0355 34.2221 29.3381C34.6658 29.8834 34.7427 30.5821 34.4439 31.3534C34.1281 32.1671 32.8992 33.6925 32.0415 34.3444C31.2649 34.9323 30.7145 35.1581 29.9891 35.1922C29.3917 35.222 29.1442 35.1709 28.3804 34.8556C22.3893 32.3887 17.6059 28.7075 13.8081 23.65C11.8239 21.0084 10.3134 18.2688 9.28067 15.427C8.67905 13.7696 8.64921 13.0495 9.14413 12.2017C9.35753 11.8438 10.2664 10.9575 10.9278 10.4633C12.0288 9.64524 12.5365 9.34273 12.9419 9.25754C13.2193 9.19787 13.7014 9.24473 14.0087 9.35552Z"
                  fill="white"
                />
                <defs>
                  <linearGradient
                    id="paint2_linear"
                    x1={22}
                    y1="-7.26346e-09"
                    x2="22.1219"
                    y2="40.5458"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="50%" stopColor="#e8434c" />
                    <stop offset="100%" stopColor="#d61114" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="tooltip-text">Gọi ngay cho chúng tôi</span>
            </a>

          </div>
          <div className="addThis_item">
            <a
              href="https://m.me/100078904554026?ref=Hello%20from%20React!"
              target="_blank"
              rel="noopener noreferrer"
              title="Nhắn tin ngay cho chúng tôi"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="44px"
                height="44px"
                viewBox="96 93 322 324"
                id="messenger"
              >
                <path
                  fill="#0084ff"
                  d="M257 93c-88.918 0-161 67.157-161 150 0 47.205 23.412 89.311 60 116.807V417l54.819-30.273C225.449 390.801 240.948 393 257 393c88.918 0 161-67.157 161-150S345.918 93 257 93zm16 202l-41-44-80 44 88-94 42 44 79-44-88 94z"
                />
              </svg>
              <span className="tooltip-text">
                Chat với chúng tôi qua Messenger
              </span>
            </a>
          </div>
        </div>
        <Link href="#" className="backtop show" title="Lên đầu trang">
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            data-icon="angle-up"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            className="svg-inline--fa fa-angle-up fa-w-10"
          >
            <path
              fill="currentColor"
              d="M168.5 164.2l148 146.8c4.7 4.7 4.7 12.3 0 17l-19.8 19.8c-4.7 4.7-12.3 4.7-17 0L160 229.3 40.3 347.8c-4.7 4.7-12.3 4.7-17 0L3.5 328c-4.7-4.7-4.7-12.3 0-17l148-146.8c4.7-4.7 12.3-4.7 17 0z"
              className=""
            />
          </svg>
        </Link>
      </div >
    </>
  );
};

export default Home;
