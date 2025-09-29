import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./MedicalRecordDetails.css";

function MedicalRecordDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (location.state && location.state.record) {
      setSelectedRecord(location.state.record);
    } else {
      navigate("/dashboard");
    }
  }, [location, navigate]);

  if (!selectedRecord) {
    return null;
  }

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Parse prescription drugs from string (split by semicolon)
  const prescriptions = selectedRecord.prescription
    ? selectedRecord.prescription
        .split(";")
        .filter((drug) => drug.trim() !== "")
    : [];

  // Placeholder function for downloading PDF (implementation depends on your backend)
  const handleDownloadPDF = () => {
    // Add logic to generate and download PDF, e.g., using a library like jsPDF or a backend endpoint
    console.log("Download PDF for record:", selectedRecord.record_id);
    // Example: window.open(`/api/records/${selectedRecord.record_id}/pdf`, '_blank');
  };

  const dosages = ["1 pill", "2 pills", "1/2 pill"];
  const quantities = ["10 pills", "20 pills", "15 pills"];
  const instructions = [
    "Take after meals",
    "Take before sleeping",
    "Take in the morning",
  ];

  return (
    <div className="medical-record-details-page">
      <div className="medical-record-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11H7.83l4.88-4.88-1.41-1.41L4.83 11l6.47 6.47 1.41-1.41L7.83 13H19v-2z" />
          </svg>
          Back
        </button>

        <div className="record-header">
          <div className="record-avatar">
            {getInitials(selectedRecord.patient_name)}
          </div>
          <div className="record-info">
            <h1>Medical Record</h1>
            <p className="record-subtitle">{selectedRecord.patient_name}</p>
            <div className="record-meta">
              <div className="meta-item">
                <svg
                  className="meta-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                </svg>
                <span>
                  {selectedRecord.follow_up_date
                    ? new Date(
                        selectedRecord.follow_up_date
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="meta-item">
                <svg
                  className="meta-icon"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Code: 583{selectedRecord.record_id || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="record-content">
          {/* Patient Information */}
          <div className="record-section">
            <div className="section-title">
              <div className="section-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h2>Patient Information</h2>
            </div>
            <div className="patient-profile">
              <div className="patient-avatar">
                {getInitials(selectedRecord.patient_name)}
              </div>
              <div className="patient-info">
                <h3>{selectedRecord.patient_name}</h3>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">
                  {selectedRecord.patient_email || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Date of Birth:</span>
                <span className="value">
                  {selectedRecord.patient_dob
                    ? new Date(selectedRecord.patient_dob).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Gender:</span>
                <span className="value">
                  {selectedRecord.patient_gender || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Address:</span>
                <span className="value">
                  {selectedRecord.patient_address || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">
                  {selectedRecord.patient_phone || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="record-section">
            <div className="section-title">
              <div className="section-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h2>Doctor Information</h2>
            </div>
            <div className="doctor-profile">
              <div className="doctor-avatar">
                {getInitials(selectedRecord.doctors?.[0]?.doctor_name)}
              </div>
              <div className="doctor-info">
                <h3>{selectedRecord.doctors?.[0]?.doctor_name || "N/A"}</h3>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">
                  {selectedRecord.doctors?.[0]?.doctor_email || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Phone:</span>
                <span className="value">
                  {selectedRecord.doctors?.[0]?.doctor_phone || "N/A"}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Specialization:</span>
                <span className="value">
                  {selectedRecord.doctors?.[0]?.summary || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Medical Record Details */}
          <div className="record-section">
            <div className="section-title">
              <div className="section-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>
              <h2>Medical Record Details</h2>
            </div>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Follow-up Date:</span>
                <span className="value">
                  {selectedRecord.follow_up_date
                    ? new Date(
                        selectedRecord.follow_up_date
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Symptoms:</span>
                <span className="value">
                  {selectedRecord.symptoms || "N/A"}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <span className="label">Diagnosis:</span>
              <span className="value">{selectedRecord.diagnosis || "N/A"}</span>
            </div>

            <div className="detail-item">
              <span className="label">Treatment:</span>
              <span className="value">{selectedRecord.treatment || "N/A"}</span>
            </div>
            {prescriptions.length > 0 && (
              <div className="prescription-section">
                <h3 className="prescription-title">Prescription</h3>
                <table className="prescription-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Drug Name</th>
                      <th>Dosage</th>
                      <th>Quantity</th>
                      <th>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((drug, index) => {
                      // Random cho từng trường
                      const dosage =
                        dosages[Math.floor(Math.random() * dosages.length)];
                      const quantity =
                        quantities[
                          Math.floor(Math.random() * quantities.length)
                        ];
                      const instruction =
                        instructions[
                          Math.floor(Math.random() * instructions.length)
                        ];
                      return (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{drug.trim()}</td>
                          <td>{dosage}</td>
                          <td>{quantity}</td>
                          <td>{instruction}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selectedRecord.image && (
            <div className="image-container">
              <img
                src={selectedRecord.image}
                alt="Medical record image"
                className="record-image"
                onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/300x200?text=No+Image")
                }
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="record-footer">
          {selectedRecord.image && (
            <a
              href={selectedRecord.image}
              download
              className="action-button"
              aria-label="Download medical record image"
            >
              Download Image
            </a>
          )}
          <button
            className="action-button"
            onClick={handleDownloadPDF}
            aria-label="Download medical record as PDF"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default MedicalRecordDetails;
