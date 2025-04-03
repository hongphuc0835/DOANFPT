import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewsList.css";

function NewsList() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("http://localhost:5119/api/News");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        const sortedData = data.sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
        setNewsList(sortedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (error) return <p className="error">Error: {error}</p>;

  return (
    <>
      <section className="bread-crumb">
        <div className="container">
          <ul className="breadcrumb">
            <li className="home">
              <a href="/" title="Home">
                <span>Home</span>
              </a>
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
              <a href="/NewsList" title="News">
                <span>News</span>
              </a>
            </li>
          </ul>
        </div>
      </section>
      <div className="news-container">
        <h1 className="title1">News List</h1>
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : newsList.length === 0 ? (
          <p className="no-news">No news available.</p>
        ) : (
          <ul className="news-list">
            {newsList.map((news) => (
              <li key={news.newId} className="news-item" onClick={() => navigate(`/NewsDetail/${news.newId}`)}>
                <div className="news-content">
                  {news.imageUrl && <img src={news.imageUrl.split(";").slice(-1)[0].trim()} alt={news.title} className="news-detail-image" />}
                  <h2 className="news-title">{news.title}</h2>
                  <p className="news-summary">{news.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default NewsList;
