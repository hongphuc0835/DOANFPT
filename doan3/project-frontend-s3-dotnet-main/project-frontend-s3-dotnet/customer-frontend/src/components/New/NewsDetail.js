import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./NewsDetail.css";

function NewsDetail() {
  const { newsId } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`http://localhost:5119/api/News/${newsId}`);
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsId]);

  return (
    <>
      <section className="bread-crumb">
        <div className="container">
          <ul className="breadcrumb">
            <li className="home">
              <Link to="/news" title="NewsList">
                <span>NewsList</span>
              </Link>
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
              <Link to="#" title="newsdetail">
                <span>{news?.title || "Loading..."}</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      ) : news ? (
        <div className="news-detail-wrapper">
          <div className="news-detail-content">
            <div className="news-detail-info">
              <div className="news-detail-left">
                <h1 className="news-detail-title">{news.title}</h1>
                <p className="news-text">{news.summary}</p>
                {news.imageUrl && news.imageUrl.split(";").map((url, index) => <img key={index} src={url.trim()} alt={news.title} className="news-detail-image" />)}
                <p className="author-info-news-detail">{news.author}</p>
              </div>
              <p>{news.content}</p>
            </div>
          </div>
          <div className="back-link-news-detail">
            <Link to="/news">Back to News List</Link>
          </div>
        </div>
      ) : (
        <p>No news data available.</p>
      )}
    </>
  );
}

export default NewsDetail;
