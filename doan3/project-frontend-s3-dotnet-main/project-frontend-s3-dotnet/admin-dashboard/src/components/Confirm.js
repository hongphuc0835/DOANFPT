import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DestinationDetail = () => {
  const { name } = useParams(); // Lấy tên của destination từ URL
  const [destinationDetail, setDestinationDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDestinationDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5089/api/destination/getAllDestinationsWithTours`);
        const destination = response.data.find((dest) => dest.destination.name === name);
        setDestinationDetail(destination);
      } catch (err) {
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationDetail();
  }, [name]);

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!destinationDetail) {
    return <div>Không tìm thấy destination.</div>;
  }

  return (
    <div>
      <h1>{destinationDetail.destination.name}</h1>
      <p>{destinationDetail.destination.description}</p>

      <h3>Danh sách các tour:</h3>
      <ul>
        {destinationDetail.tours.map((tour) => (
          <li key={tour.tourId}>
            {tour.name} - {tour.description}
          </li>
        ))}
      </ul>

      <h3>Danh sách khách sạn:</h3>
      <ul>
        {destinationDetail.hotels.map((hotel) => (
          <li key={hotel.hotelId}>
            {hotel.name} - {hotel.description}
          </li>
        ))}
      </ul>

      <h3>Danh sách nhà hàng:</h3>
      <ul>
        {destinationDetail.restaurants.map((restaurant) => (
          <li key={restaurant.restaurantId}>
            {restaurant.name} - {restaurant.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DestinationDetail;
