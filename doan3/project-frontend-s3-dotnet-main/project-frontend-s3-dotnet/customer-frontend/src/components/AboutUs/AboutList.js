import React, { useEffect, useState } from "react";
import "./aboutlist.css";

const AboutUsList = () => {
  const [aboutUsList, setAboutUsList] = useState([]);

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const response = await fetch("http://localhost:5119/api/abouts");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setAboutUsList(data);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchAboutUs();
  }, []);

  return (
    <div>
      <div className="intro-section">
        <h1 className="animate-text">Welcome to Our Amazing Team!</h1>
        <p className="animate-text">
          We are a dynamic group of professionals united by a shared passion for making a meaningful impact. Each day, we collaborate, innovate, and strive for excellence to create solutions that make a difference. Our team is built on creativity, expertise, and a commitment to breaking barriers.
          Let us introduce you to the talented individuals behind our mission.
        </p>
      </div>

      <section id="achievements">
        <div className="containertt">
          <h2 className="section-title">Proud Achievements in the Tourism Industry</h2>
          <div className="achievements-grid">
            <div className="achievement-item">
              <div className="achievement-text">
                <h3>International Tourism Award</h3>
                <p>Honored with the prestigious International Tourism Award for excellence in service and innovation.</p>
              </div>
              <div className="achievement-image">
                <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/11/04f4g0riqtts1699191142950.png" alt="International Tourism Award" />
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-text">
                <h3>Tourism Growth</h3>
                <p>Consistently achieved a 15% annual growth rate over the past 5 years.</p>
              </div>
              <div className="achievement-image">
                <img src="https://dulichsaigon.edu.vn/wp-content/uploads/2024/01/hoi-an-thanh-pho-du-lich-o-viet-nam-thu-hut-nhieu-du-khach.jpg" alt="Tourism Growth" />
              </div>
            </div>
            <div className="achievement-item">
              <div className="achievement-text">
                <h3>Top Destination</h3>
                <p>Voted as the most attractive destination in Southeast Asia in 2024.</p>
              </div>
              <div className="achievement-image">
                <img src="https://images.hcmcpv.org.vn/res/news/2024/09/05-09-2024-khai-mac-hoi-cho-du-lich-quoc-te-tphcm-lan-thu-18-nam-2024-27AEF29E-details.jpg?vs=05092024015655" alt="Top Destination" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="strategic-partners-section">
        <div className="strategic-partners-container">
          <div className="strategic-partners-text">
            <h3 className="strategic-partners-heading">Strategic Partners</h3>
            <p className="strategic-partners-description">We are proud to collaborate with leading strategic partners in the tourism industry to provide the best services to our customers.</p>
          </div>
          <div className="strategic-partners-images">
            <img className="strategic-partner-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbydn6WRhwOrlnw4TITJ0vydrrgYlFCdY9OsaJcQRbu49VS_TeWuoi_730O5664RV1ezM&usqp=CAU" alt="Partner 1" />
            <img className="strategic-partner-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnJrtJhlXeKVm6r47manIY-seL3-qhs1Avzr8TPtrhe7-mN_WF1waPEAhrqdREKH_ovQk&usqp=CAU" alt="Partner 2" />
            <img className="strategic-partner-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSo8M5Z3I_sMPoec_SVN5AmMwauN93V7sHKlA&s" alt="Partner 3" />
            <img className="strategic-partner-image" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXbxyq3wNDy1q8STaV3C6zJqFDM_5Kboan3_RNSy5MJ8WE9zV5uRNlIO9IxuVL-mV3Qq0&usqp=CAU" alt="Partner 4" />
          </div>
        </div>
      </section>

      <div className="values-section">
        <h2 className="values-title animate-text">Our Mission & Values</h2>
        <p className="values-description animate-text">Our mission is to empower individuals and communities through innovation, collaboration, and passion. We are committed to these core values:</p>
        <div className="values-list">
          <div className="value-item">
            <i className="fas fa-lightbulb value-icon"></i>
            <h3 className="value-name">Innovation</h3>
            <p className="value-description">We believe in constant innovation, pushing the boundaries to create new solutions that make a real impact.</p>
          </div>
          <div className="value-item">
            <i className="fas fa-handshake value-icon"></i>
            <h3 className="value-name">Collaboration</h3>
            <p className="value-description">Working together as a team to achieve shared goals and foster an environment of mutual respect.</p>
          </div>
          <div className="value-item">
            <i className="fas fa-heart value-icon"></i>
            <h3 className="value-name">Passion</h3>
            <p className="value-description">Passion drives us to deliver exceptional results and make a difference in everything we do.</p>
          </div>
          <div className="value-item">
            <i className="fas fa-users value-icon"></i>
            <h3 className="value-name">Teamwork</h3>
            <p className="value-description">We thrive in a supportive and collaborative environment, where each member contributes to the success of the team.</p>
          </div>
        </div>
      </div>
      <div className="meet-us">
        <h1 className="meet-us-title animate-text">Meet Our Talented Team</h1>
        <p className="meet-us-description animate-text">
          Behind every successful project is a team of passionate, innovative, and dedicated individuals. Our team is our greatest asset, and we're proud to introduce the brilliant minds who make everything happen. Get to know the talented professionals who bring creativity, expertise, and
          commitment to our mission.
        </p>
        <div className="us">
          {aboutUsList.map((member) => (
            <div className="file" key={member.id}>
              <div className="images">
                {member.imageUrl?.split(";").map((url, index) => (
                  <img
                    key={index}
                    src={url.trim()} // Loại bỏ khoảng trắng dư thừa
                    alt={member.fullName || "Team Member"}
                  />
                ))}
              </div>
              <div className="name">{member.fullName || "Name"}</div>
              <div className="role">{member.role || "Role"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUsList;
