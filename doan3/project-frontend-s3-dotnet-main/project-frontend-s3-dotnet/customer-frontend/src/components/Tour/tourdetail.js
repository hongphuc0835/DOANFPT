import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import "./tourdetail.css";
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Button, IconButton, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { Link } from "react-router-dom";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Add, Remove } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

const App = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [adults, setAdults] = useState(1); // Số lượng người lớn
  const [children, setChildren] = useState(0); // Số lượng trẻ em
  const [selectedImage, setSelectedImage] = useState(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("tab-1");

  const navigate = useNavigate();
  const { tourId } = useParams();

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Check if the data for this tourId is cached
      const cachedData = localStorage.getItem("tours");

      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        const dataId = parsedData.find((tour) => tour?.tourId === `${tourId}`);
        if (dataId) {
          console.log(dataId);
          setData(dataId);

          // Set default schedule from cached data
          const defaultSchedule = parsedData.tourSchedules?.find((schedule) => schedule?.name.toLowerCase() === "basic");
          if (defaultSchedule) {
            setSelectedSchedule(defaultSchedule);
          }
          setLoading(false);
          return;
        }
      }

      // If no cached data or dataId not found, fetch from API
      try {
        const response = await fetch(`http://localhost:5089/api/Tour/${tourId}/related-data`);
        const result = await response.json();
        console.log(result);

        // Remove unnecessary data
        delete result.restaurants;
        delete result.hotels;
        setData(result);

        // Set default schedule
        const defaultSchedule = result.tourSchedules.find((schedule) => schedule?.name.toLowerCase() === "basic");
        if (defaultSchedule) {
          setSelectedSchedule(defaultSchedule);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tourId]);

  // Calculate the total price for adults
  const calculateAdultTotal = () => {
    if (!selectedSchedule) return 0;
    return adults * selectedSchedule?.packagePrice;
  };

  // Calculate the total price (children are free)
  const calculateTotal = () => {
    return calculateAdultTotal(); // Only consider adults
  };

  // Handle the clear selection action and pass the selection to the booking page
  const handleClearSelection = () => {
    const total = calculateTotal();

    const isoString = departureDate.toISOString();

    const selectedData = {
      tourId: data?.tour?.tourId,
      tourName: data?.tour?.name,
      tourPackage: selectedSchedule?.name,
      tourPrice: selectedSchedule?.packagePrice,
      adult: adults,
      children: children,
      totalPrice: total,
      departureDate: isoString,
      scheduleDescription: selectedSchedule?.description,
      selectedSchedule,
    };

    navigate(`/booking/${tourId}`, { state: selectedData });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Typography variant="h5">No data available</Typography>;
  }

  const { tour, tourSchedules } = data;

  return (
    <>
      <meta property="og:site_name" content="ND Travel" />
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
      <link rel="preload" as="style" type="text/css" href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/product_style.scss.css?1728351987196" />
      <link href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/product_style.scss.css?1728351987196" rel="stylesheet" type="text/css" media="all" />

      <div className="bodywrap">
        <>
          <section className="bread-crumb" style={{ backgroundColor: "#004e92" }}>
            <div className="container">
              <ul className="breadcrumb">
                <li className="home">
                  <Link href="/" title="Trang chủ">
                    <span>Home</span>
                  </Link>
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
                  <Link className="changeurl" href="/ {tourData.tour?.name}" title=" tourData.tour?.name">
                    <span> {tour?.name} </span>
                  </Link>
                </li>
              </ul>
            </div>
          </section>

          <section className="product layout-product p-multiple" itemScope="" itemType="https://schema.org/Product">
            <div className="container">
              <div className="details-product">
                <h1 className="title-product">{tour?.name}</h1>
                <div className="reviews_details_product">
                  <div className="sapo-product-reviews-badge" data-id={tour?.tourId}>
                    <div className="sapo-product-reviews-star">
                      <Typography variant="body2" color="textSecondary">
                        Evaluate:{" "}
                        {Array(5)
                          .fill(0)
                          .map((_, starIndex) =>
                            starIndex < (tour?.rating || 0) ? (
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
                  </div>
                </div>
                <div className="product-meta">
                  <div className="start item">
                    <div className="icon">
                      <img width="24" height="24" src="https://img.icons8.com/material-rounded/0b5da7/address.png" alt="address" />
                    </div>
                    <div className="info">
                      <div className="title">Depart from</div>
                      <div className="content" style={{ color: "#0b5da7" }}>
                        {tour?.tourDepartureLocation}
                      </div>
                    </div>
                  </div>
                  <div className="destination item">
                    <div className="icon">
                      <img width="24" height="24" src="https://img.icons8.com/material-rounded/0b5da7/address.png" alt="address" />
                    </div>
                    <div className="info">
                      <div className="title">Destination</div>
                      <div className="content" style={{ color: "#0b5da7" }}>
                        {tour?.tourDepartureLocation}
                      </div>
                    </div>
                  </div>
                  <div className="time item">
                    <div className="icon">
                      <img width="24" height="24" src="https://img.icons8.com/ios-filled/0b5da7/overtime.png" alt="overtime" />
                    </div>
                    <div className="info">
                      <div className="title">Duration</div>
                      <div className="content" style={{ color: "#0b5da7" }}>
                        {tour?.duration}
                      </div>
                    </div>
                  </div>

                  <div className="item maybay pt">
                    <div className="icon">
                      <img width="24" height="24" src="https://img.icons8.com/glyph-neue/0b5da7/road.png" alt="road" />
                    </div>
                    <div className="info">
                      <div className="title">TransportMode</div>
                      <div className="content" style={{ color: "#0b5da7" }}>
                        {tour?.transportMode}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="margin-bottom-20">
                  <div className="row margin-am-10">
                    <div className="col-12 col-md-12 col-lg-8 col-left">
                      <div className="product-detail-left product-images ">
                        <div className="product-image-block relative">
                          <div className="swiper-image">
                            <div className="swiper-container gallery-top">
                              <div className="swiper-wrapper" id={tour?.tourId}>
                                {/* Hiển thị ảnh đầu tiên */}
                                <Link
                                  className="swiper-slide"
                                  data-hash={0}
                                  href={tour?.imageUrl ? tour?.imageUrl.split(";")[0] : "/default-image.jpg"}
                                  title="Click để xem"
                                  onClick={() => setSelectedImage(tour?.imageUrl.split(";")[0])} // Cập nhật ảnh khi nhấn
                                >
                                  <img
                                    height={540}
                                    width={540}
                                    src={tour?.imageUrl ? tour?.imageUrl.split(";")[0] : "/default-image.jpg"}
                                    alt={tour?.title || "Tour image"}
                                    data-image={tour?.imageUrl ? tour?.imageUrl.split(";")[0] : "/default-image.jpg"}
                                    className="img-responsive mx-auto d-block swiper-lazy"
                                  />
                                </Link>
                                {/* Display all images */}
                                {tour?.imageUrl &&
                                  tour?.imageUrl.split(";").map((image, index) => (
                                    <button
                                      key={index}
                                      className="swiper-slide"
                                      data-hash={index + 1}
                                      onClick={(e) => {
                                        e.preventDefault(); // Prevent default behavior
                                        setSelectedImage(image); // Update the image when clicked
                                      }}
                                      title="Click to view"
                                      style={{ background: "none", border: "none", padding: 0 }} // Style to make it look like an <Link> tag
                                    >
                                      <img height={540} width={540} src={image} alt={`${tour?.title || "Tour"} - ${index + 1}`} data-image={image} className="img-responsive mx-auto d-block swiper-lazy" />
                                    </button>
                                  ))}

                                {/* Dialog to display the selected large image */}
                                <Dialog open={Boolean(selectedImage)} onClose={() => setSelectedImage(null)} maxWidth="md" fullWidth>
                                  <DialogContent sx={{ padding: 0 }}>
                                    <img src={selectedImage} alt="Selected Tour" style={{ width: "100%", height: "auto" }} />
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                            <div className="swiper-container gallery-thumbs swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events swiper-container-thumbs">
                              <div
                                className="swiper-wrapper"
                                style={{
                                  transform: "translate3d(0px, 0px, 0px)",
                                }}
                              >
                                {tour?.imageUrl &&
                                  tour?.imageUrl.split(";").map((image, index) => (
                                    <div
                                      key={index}
                                      className={`swiper-slide ${index === 0 ? "swiper-slide-visible swiper-slide-active swiper-slide-thumb-active" : ""}`}
                                      data-hash={index}
                                      style={{
                                        width: "153.4px",
                                        marginRight: 10,
                                      }}
                                    >
                                      <div className="p-100">
                                        <img
                                          height={80}
                                          width={80}
                                          src={image}
                                          alt={`Tour ${index + 1}`} // Removed the redundant "image"
                                          data-image={image}
                                          className="swiper-lazy"
                                        />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <ul className="social-media">
                          <li className="title">
                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={19} viewBox="0 0 20 19" fill="none">
                              <path d="M18.334 3.56671C18.334 2.186 17.2147 1.06671 15.834 1.06671C14.4533 1.06671 13.334 2.186 13.334 3.56671C13.334 4.94742 14.4533 6.06671 15.834 6.06671C17.2147 6.06671 18.334 4.94742 18.334 3.56671Z" stroke="#55585C" strokeWidth="1.5" />
                              <path d="M6.66699 9.40002C6.66699 8.01931 5.5477 6.90002 4.16699 6.90002C2.78628 6.90002 1.66699 8.01931 1.66699 9.40002C1.66699 10.7807 2.78628 11.9 4.16699 11.9C5.5477 11.9 6.66699 10.7807 6.66699 9.40002Z" stroke="#55585C" strokeWidth="1.5" />
                              <path d="M18.334 15.2334C18.334 13.8527 17.2147 12.7334 15.834 12.7334C14.4533 12.7334 13.334 13.8527 13.334 15.2334C13.334 16.6141 14.4533 17.7334 15.834 17.7334C17.2147 17.7334 18.334 16.6141 18.334 15.2334Z" stroke="#55585C" strokeWidth="1.5" />
                              <path d="M13.3333 3.9834L6.25 7.7334" stroke="#55585C" strokeWidth="1.5" strokeLinecap="round" />
                              <path d="M13.3333 14.8167L6.25 11.0667" stroke="#55585C" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            Chia sẻ
                          </li>
                          <li className="social-media__item social-media__item--facebook">
                            <Link title="Chia sẻ lên Facebook" href="https://www.facebook.com/sharer.php?u=https://nd-travel.mysapo.net/hcm-seoul-dao-nami-truot-tuyet-elysian-5n4d" target="_blank" rel="noopener" aria-label="Chia sẻ lên Facebook">
                              <svg focusable="false" className="icon icon--facebook" viewBox="0 0 30 30">
                                <path
                                  d="M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm3.2142857-17.1429611h-2.1428678v-2.1425646c0-.5852979.8203285-1.07160109 1.0714928-1.07160109h1.071375v-2.1428925h-2.1428678c-2.3564786 0-3.2142536 1.98610393-3.2142536 3.21449359v2.1425646h-1.0714822l.0032143 2.1528011 1.0682679-.0099086v7.499969h3.2142536v-7.499969h2.1428678v-2.1428925z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                />
                              </svg>
                            </Link>
                          </li>
                          <li className="social-media__item social-media__item--pinterest">
                            <Link title="Chia sẻ lên Pinterest" href="https://pinterest.com/pin/create/button/?url=https://nd-travel.mysapo.net/hcm-seoul-dao-nami-truot-tuyet-elysian-5n4d&" target="_blank" rel="noopener" aria-label="Pinterest">
                              <svg focusable="false" className="icon icon--pinterest" role="presentation" viewBox="0 0 30 30">
                                <path
                                  d="M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm-.4492946-22.49876954c-.3287968.04238918-.6577148.08477836-.9865116.12714793-.619603.15784625-1.2950238.30765013-1.7959124.60980792-1.3367356.80672832-2.26284291 1.74754848-2.88355361 3.27881599-.1001431.247352-.10374313.4870343-.17702448.7625149-.47574032 1.7840923.36779138 3.6310327 1.39120339 4.2696951.1968419.1231267.6448551.3405257.8093833.0511377.0909873-.1603963.0706852-.3734014.1265202-.5593764.036883-.1231267.1532436-.3547666.1263818-.508219-.0455542-.260514-.316041-.4256572-.4299438-.635367-.230748-.4253041-.2421365-.8027267-.3541701-1.3723228.0084116-.0763633.0168405-.1527266.0253733-.2290899.0340445-.6372108.1384107-1.0968422.3287968-1.5502554.5593198-1.3317775 1.4578212-2.07273488 2.9088231-2.5163011.324591-.09899963 1.2400541-.25867013 1.7200175-.1523539.2867042.05078464.5734084.10156927.8600087.1523539 1.0390064.33760307 1.7953931.9602003 2.2007079 1.9316992.252902.6061594.3275507 1.7651044.1517724 2.5415071-.0833199.3679287-.0705641.6832289-.1770418 1.0168107-.3936666 1.2334841-.9709174 2.3763639-2.2765854 2.6942337-.8613761.2093567-1.5070793-.3321303-1.7200175-.8896824-.0589159-.1545509-.1598205-.4285603-.1011297-.6865243.2277711-1.0010987.5562045-1.8969797.8093661-2.8969995.24115-.9528838-.2166421-1.7048063-.9358863-1.8809146-.8949186-.2192233-1.585328.6350139-1.8211644 1.1943903-.1872881.4442919-.3005678 1.2641823-.1517724 1.8557085.0471811.1874265.2666617.689447.2276672.8640842-.1728187.7731269-.3685356 1.6039823-.5818373 2.3635745-.2219729.7906632-.3415527 1.5999416-.5564641 2.3639276-.098793.3507651-.0955738.7263439-.1770244 1.092821v.5337977c-.0739045.3379758-.0194367.9375444.0505042 1.2703809.0449484.2137505-.0261175.4786388.0758948.6357396.0020943.1140055.0159752.1388388.0506254.2031582.3168026-.0095136.7526829-.8673992.9106342-1.118027.3008274-.477913.5797431-.990879.8093833-1.5506281.2069844-.5042174.2391769-1.0621226.4046917-1.60104.1195798-.3894861.2889369-.843272.328918-1.2707535h.0252521c.065614.2342095.3033024.403727.4805692.5334446.5563429.4077482 1.5137774.7873678 2.5547742.5337977 1.1769151-.2868184 2.1141687-.8571599 2.7317812-1.702982.4549537-.6225776.7983583-1.3445472 1.0624066-2.1600633.1297394-.4011574.156982-.8454494.2529193-1.2711066.2405269-1.0661438-.0797199-2.3511383-.3794396-3.0497261-.9078995-2.11694836-2.8374975-3.32410832-5.918897-3.27881604z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                />
                              </svg>
                            </Link>
                          </li>
                          <li className="social-media__item social-media__item--twitter">
                            <Link title="Chia sẻ lên Twitter" href="https://twitter.com/share?url=https://nd-travel.mysapo.net/hcm-seoul-dao-nami-truot-tuyet-elysian-5n4d" target="_blank" rel="noopener" aria-label="Tweet on Twitter">
                              <svg focusable="false" className="icon icon--twitter" role="presentation" viewBox="0 0 30 30">
                                <path
                                  d="M15 30C6.71572875 30 0 23.2842712 0 15 0 6.71572875 6.71572875 0 15 0c8.2842712 0 15 6.71572875 15 15 0 8.2842712-6.7157288 15-15 15zm3.4314771-20.35648929c-.134011.01468929-.2681239.02905715-.4022367.043425-.2602865.05139643-.5083383.11526429-.7319208.20275715-.9352275.36657324-1.5727317 1.05116784-1.86618 2.00016964-.1167278.3774214-.1643635 1.0083696-.0160821 1.3982464-.5276368-.0006268-1.0383364-.0756643-1.4800457-.1737-1.7415129-.3873214-2.8258768-.9100285-4.02996109-1.7609946-.35342035-.2497018-.70016357-.5329286-.981255-.8477679-.09067071-.1012178-.23357785-.1903178-.29762142-.3113357-.00537429-.0025553-.01072822-.0047893-.0161025-.0073446-.13989429.2340643-.27121822.4879125-.35394965.7752857-.32626393 1.1332446.18958607 2.0844643.73998215 2.7026518.16682678.187441.43731214.3036696.60328392.4783178h.01608215c-.12466715.041834-.34181679-.0159589-.45040179-.0360803-.25715143-.0482143-.476235-.0919607-.69177643-.1740215-.11255464-.0482142-.22521107-.09675-.3378675-.1449642-.00525214 1.251691.69448393 2.0653071 1.55247643 2.5503267.27968679.158384.67097143.3713625 1.07780893.391484-.2176789.1657285-1.14873321.0897268-1.47198429.0581143.40392643.9397285 1.02481929 1.5652607 2.09147249 1.9056375.2750861.0874928.6108975.1650857.981255.1593482-.1965482.2107446-.6162514.3825321-.8928439.528766-.57057.3017572-1.2328489.4971697-1.97873466.6450108-.2991075.0590785-.61700464.0469446-.94113107.0941946-.35834678.0520554-.73320321-.02745-1.0537875-.0364018.09657429.053325.19312822.1063286.28958036.1596536.2939775.1615821.60135.3033482.93309.4345875.59738036.2359768 1.23392786.4144661 1.93859037.5725286 1.4209286.3186642 3.4251707.175291 4.6653278-.1740215 3.4539354-.9723053 5.6357529-3.2426035 6.459179-6.586425.1416246-.5754053.162226-1.2283875.1527803-1.9126768.1716718-.1232517.3432215-.2465035.5148729-.3697553.4251996-.3074947.8236703-.7363286 1.118055-1.1591036v-.00765c-.5604729.1583679-1.1506672.4499036-1.8661597.4566054v-.0070232c.1397925-.0495.250515-.1545429.3619908-.2321358.5021089-.3493285.8288003-.8100964 1.0697678-1.39826246-.1366982.06769286-.2734778.13506429-.4101761.20275716-.4218407.1938214-1.1381067.4719375-1.689256.5144143-.6491893-.5345357-1.3289754-.95506074-2.6061215-.93461789z"
                                  fill="currentColor"
                                  fillRule="evenodd"
                                />
                              </svg>
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="append-product-tab-mobile">
                        <div className="product-tab">
                          <div className="tab-container">
                            {/* Mô tả và Lịch trình */}
                            <Box sx={{ display: "flex", gap: 1, marginBottom: 2 }}>
                              {/* Lịch trình */}
                              <Box>
                                <Typography variant="h6" gutterBottom>
                                  <Button
                                    onClick={() => handleTabClick("tab-1")}
                                    sx={{
                                      textTransform: "none",
                                      backgroundColor: activeTab === "tab-1" ? "#0b5da7" : "gray",
                                      color: "white",
                                      "&:hover": {
                                        backgroundColor: "#0b5da7",
                                      },
                                      padding: "10px 20px", // Điều chỉnh padding để nút vừa vặn hơn
                                    }}
                                  >
                                    Schedule
                                  </Button>
                                </Typography>
                              </Box>
                              {/* Mô tả */}
                              <Box>
                                <Typography variant="h6" gutterBottom>
                                  <Button
                                    onClick={() => handleTabClick("tab-0")}
                                    sx={{
                                      textTransform: "none",
                                      backgroundColor: activeTab === "tab-0" ? "#0b5da7" : "gray",
                                      color: "white",
                                      "&:hover": {
                                        backgroundColor: "#0b5da7",
                                      },
                                      padding: "10px 20px", // Điều chỉnh padding để nút vừa vặn hơn
                                    }}
                                  >
                                    Description
                                  </Button>
                                </Typography>
                              </Box>
                            </Box>

                            {/* Nội dung */}
                            <Box sx={{ border: "2px solid #e6f4ff", marginTop: -1, borderRadius: "10px", backgroundColor: "#ffffff" }}>
                              <Box sx={{ paddingLeft: 2, paddingRight: 2, paddingBottom: 2 }}>
                                {/* Mô tả */}
                                {activeTab === "tab-0" && <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: tour?.description }} />}

                                {/* Lịch trình */}
                                {activeTab === "tab-1" && (
                                  <Box sx={{ marginTop: 2, maxHeight: "380px", overflow: "auto" }}>
                                    <Typography variant="body2" color="text.secondary" dangerouslySetInnerHTML={{ __html: selectedSchedule?.description }} />
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </div>
                        </div>
                      </div>
                      <div class="thongtin" style={{ marginTop: "45px" }}>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: "bold",
                            marginBottom: "20px",
                            color: " #0b5da7;",
                            textAlign: "center",
                            fontSize: "1.3rem",
                            letterSpacing: "0.3px",
                            lineHeight: "1",
                            textTransform: "uppercase",
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                          }}
                        >
                          Information to Note
                        </Typography>
                        {/* Thông tin cần lưu ý 1 */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                            <Typography> - Note about booking tours * </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>- Each tour you choose will have a different price for each schedule as well as the number of rated stars displayed. When you choose, you should pay close attention to detailed information to avoid mistakes</Typography>
                          </AccordionDetails>
                        </Accordion>

                        {/* Thông tin cần lưu ý 2 */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2-content" id="panel2-header">
                            <Typography> - Note about tour packages * </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>- When you click to view details of a tour, initially vbanj's package will be the basic package. You can choose other packages such as luxury or vip depending on your choice Each tour will have a different schedule and price</Typography>
                          </AccordionDetails>
                        </Accordion>

                        {/* Thông tin cần lưu ý 3 */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3-content" id="panel3-header">
                            <Typography> - Note about choosing people to go * </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>
                              - If you are an adult, your price per person will be equal to the tour price. If you add more people, the tour price will also increase according to the number of people you have chosen If it is a child, we will give it free of charge for a maximum of 5 people and you
                              will not be able to book more than 5 people for children.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>

                        {/* Thông tin cần lưu ý 4 */}
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4-content" id="panel4-header">
                            <Typography> - Notes on tour transfer or cancellation *</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>
                              - After paying, if you want to change/cancel the tour, please bring your Tour Ticket or payment receipt to the tour registration office to complete the tour transfer/cancellation procedures and bear the costs according to Karnel travel's regulations. . Do not handle
                              tour transfer/cancellation cases over the phone.
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      </div>
                    </div>
                    <div className="col-12 col-md-12 col-lg-4 col-center">
                      <div className="product-sticky">
                        <div className="details-pro">
                          <form encType="multipart/form-data" data-cart-form="" id="add-to-cart-form" action="/cart/add" method="post" className="form-inline">
                            <div className="tour_variants">
                              <Box sx={{ mt: 3, paddingLeft: 2 }}>
                                {/* <Typography variant="h5" gutterBottom>Tour Schedules</Typography> */}
                                <Grid container spacing={2}>
                                  {tourSchedules?.map((schedule) => (
                                    <Grid item xs={12} sm={6} md={4} key={schedule?.tourScheduleId}>
                                      <Card
                                        onClick={() => setSelectedSchedule(schedule)}
                                        sx={{
                                          cursor: "pointer",
                                          border: selectedSchedule?.tourScheduleId === schedule?.tourScheduleId ? "2px solid white" : "none",
                                          backgroundColor: "#0b5da7", // Màu nền cho Card
                                          paddingTop: "5px",
                                          width: "80%",
                                          borderRadius: "20px",
                                          color: "white", // Màu chữ trắng
                                          display: "flex", // Dùng flexbox để căn giữa
                                          justifyContent: "center", // Căn giữa theo chiều ngang
                                          alignItems: "center", // Căn giữa theo chiều dọc
                                          height: "65%", // Đảm bảo Card có chiều cao đầy đủ
                                        }}
                                      >
                                        <CardContent
                                          sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            paddingBottom: "-24px",
                                          }}
                                        >
                                          <Typography variant="h6" align="center">
                                            {schedule?.name}
                                          </Typography>{" "}
                                          {/* Căn giữa nội dung */}
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  ))}
                                </Grid>

                                {selectedSchedule && (
                                  <Box sx={{ mt: 1, marginBottom: 3 }}>
                                    <Typography
                                      variant="h6"
                                      gutterBottom
                                      sx={{
                                        color: "#0b5da7",
                                        marginBottom: "20px",
                                      }}
                                    >
                                      <strong>Price:</strong> ${selectedSchedule?.packagePrice}
                                    </Typography>
                                    <div className="time-block">
                                      <div className="icon" style={{ backgroundColor: "#0b5da7" }}>
                                        <img width="24" height="24" src="https://img.icons8.com/ios-filled/ffffff/overtime.png" alt="overtime" />
                                      </div>
                                      <div className="content">
                                        <DatePicker selected={departureDate} onChange={(date) => setDepartureDate(date)} dateFormat="dd / MM / yyyy" className="tourmaster-datepicker" placeholderText="Chọn Ngày đi" minDate={new Date()} />
                                      </div>
                                    </div>

                                    <Box sx={{ mt: 4 }}>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          mt: 1,
                                          color: "#0b5da7",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        Child price (&lt; 6 years old) is free of tour price and can only be booked for less than 5 people
                                      </Typography>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: 3,
                                          mt: 2,
                                        }}
                                      >
                                        {/* Adults */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              width: 80,
                                              textAlign: "left",
                                            }}
                                          >
                                            Adults:
                                          </Typography>
                                          <IconButton onClick={() => setAdults(Math.max(adults - 1, 0))}>
                                            <Remove />
                                          </IconButton>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              width: 40,
                                              height: 40,
                                              border: "1px solid #ccc",
                                              borderRadius: "4px",
                                            }}
                                          >
                                            <Typography>{adults} </Typography>
                                          </Box>
                                          <IconButton onClick={() => setAdults(adults + 1)}>
                                            <Add />
                                          </IconButton>
                                          <Typography>$ {calculateAdultTotal()} </Typography>
                                        </Box>
                                        {/* Children */}
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                          }}
                                        >
                                          <Typography
                                            sx={{
                                              width: 80,
                                              textAlign: "left",
                                            }}
                                          >
                                            Children:
                                          </Typography>
                                          <IconButton onClick={() => setChildren(Math.max(children - 1, 0))}>
                                            <Remove />
                                          </IconButton>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "center",
                                              alignItems: "center",
                                              width: 40,
                                              height: 40,
                                              border: "1px solid #ccc",
                                              borderRadius: "4px",
                                            }}
                                          >
                                            <Typography>{children}</Typography>
                                          </Box>
                                          <IconButton onClick={() => setChildren(children < 5 ? children + 1 : children)}>
                                            <Add />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          mt: 2,
                                          color: "#0b5da7",
                                          display: "flex",
                                          justifyContent: "space-between",
                                        }}
                                      >
                                        <strong>Total Price:</strong>
                                        <span style={{ marginRight: "3rem" }}>${calculateTotal()}</span>
                                      </Typography>

                                      <Button onClick={handleClearSelection} variant="contained" sx={{ mt: 2 }}>
                                        Booking now
                                      </Button>

                                      <Button variant="contained" sx={{ mt: 2, marginLeft: "70px", backgroundColor: "transparent", color: "#0b5da7", border: "1px solid #1976d2 ", boxShadow: "none" }} component={Link} to="/contact">
                                        Consulting
                                      </Button>
                                    </Box>
                                  </Box>
                                )}
                              </Box>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="product-tab-mobile" />
                </div>
              </div>
            </div>
          </section>
          <link href="//bizweb.dktcdn.net/100/505/645/themes/956063/assets/bpr-products-module.css?1728351987196" rel="stylesheet" type="text/css" media="all" />
        </>
      </div>
    </>
  );
};

export default App;
