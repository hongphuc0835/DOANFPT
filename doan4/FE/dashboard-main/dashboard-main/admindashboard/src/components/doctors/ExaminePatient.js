import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ExaminePatient.css';

const ExaminePatient = () => {
    const { appointmentId } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [patient, setPatient] = useState(null);
    const [patientMedicalRecords, setPatientMedicalRecords] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [openMedicalRecordsDialog, setOpenMedicalRecordsDialog] = useState(false);
    const [newMedicalRecord, setNewMedicalRecord] = useState({
        symptoms: '',
        diagnosis: '',
        test_results: '',
        prescription: '',
        notes: '',
        image: ''
    });
    const [doctorName, setDoctorName] = useState('');
    const navigate = useNavigate();

    const timeSlots = [
        { value: 1, label: '08:00 - 09:00' },
        { value: 2, label: '09:00 - 10:00' },
        { value: 3, label: '10:00 - 11:00' },
        { value: 4, label: '11:00 - 12:00' },
        { value: 5, label: '13:00 - 14:00' },
        { value: 6, label: '14:00 - 15:00' },
        { value: 7, label: '15:00 - 16:00' },
        { value: 8, label: '16:00 - 17:00' }
    ];

    const getTimeSlotLabel = (slotValue) => {
        const slot = timeSlots.find(s => s.value === slotValue);
        return slot ? slot.label : '';
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        if (!appointmentId) {
            console.error('No appointmentId available');
            setError('NO APPOINTMENT ID');
            return;
        }
        axios.get(`http://localhost:8081/api/v1/appointments/${appointmentId}`)
            .then(response => {
                console.log('Appointment data:', response.data);
                setAppointment(response.data);
                setPatient(response.data.patient?.[0] || null);
            })
            .catch(error => {
                console.error('Error fetching appointment details:', error);
                setError('ERROR FETCHING APPOINTMENT DETAILS');
            });

        const doctorId = localStorage.getItem('doctor_id');
        axios.get(`http://localhost:8081/api/v1/doctors/${doctorId}`)
            .then(response => {
                setDoctorName(response.data.doctor_name || 'Unknown');
            })
            .catch(error => {
                console.error('Error fetching doctor details:', error);
                setDoctorName('Unknown');
            });
    }, [appointmentId]);

    const handleNewMedicalRecordChange = (e) => {
        const { name, value } = e.target;
        setNewMedicalRecord((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setNewMedicalRecord((prevData) => ({
                    ...prevData,
                    image: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmComplete = () => {
        axios.put('http://localhost:8081/api/v1/appointments/updateStatus', {
            appointment_id: appointmentId,
            status: 'COMPLETED',
            doctor_id: localStorage.getItem('doctor_id')
        })
            .then(response => {
                console.log('Status updated successfully:', response.data);
                setSuccessMessage('APPOINTMENT COMPLETED SUCCESSFULLY');
                setTimeout(() => {
                    setSuccessMessage('');
                    navigate('/todayappointments'); // Navigate back to previous page
                }, 2000);
                axios.get(`http://localhost:8081/api/v1/appointments/${appointmentId}`)
                    .then(response => {
                        setAppointment(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching updated appointment', error);
                        setError('ERROR FETCHING UPDATED APPOINTMENT');
                    });
            })
            .catch(error => {
                console.error('Error updating status', error);
                setError('ERROR UPDATING STATUS');
            });
    };

    const handleAddMedicalRecordSubmit = () => {
        if (!newMedicalRecord.symptoms.trim()) {
            setError('PLEASE ENTER SYMPTOMS');
            return;
        }
        if (!newMedicalRecord.diagnosis.trim()) {
            setError('PLEASE ENTER DIAGNOSIS');
            return;
        }
        if (!newMedicalRecord.test_results.trim()) {
            setError('PLEASE ENTER TEST RESULTS');
            return;
        }
        if (!newMedicalRecord.prescription.trim()) {
            setError('PLEASE ENTER PRESCRIPTION');
            return;
        }
        if (!newMedicalRecord.notes.trim()) {
            setError('PLEASE ENTER TREATMENT PLAN');
            return;
        }

        if (!patient?.patient_id) {
            console.error('No patient ID');
            setError('NO PATIENT ID');
            return;
        }

        const medicalRecordData = {
            ...newMedicalRecord,
            patient_id: patient.patient_id,
            doctor_id: localStorage.getItem('doctor_id'),
            follow_up_date: new Date().toISOString().split('T')[0],
            test_results: newMedicalRecord.test_results || 'No test results',
            notes: newMedicalRecord.notes || 'No treatment plan'
        };

        axios.post('http://localhost:8081/api/v1/medicalrecords/insert', medicalRecordData)
            .then(response => {
                console.log('Medical record added successfully:', response.data);
                setNewMedicalRecord({
                    symptoms: '',
                    diagnosis: '',
                    test_results: '',
                    prescription: '',
                    notes: '',
                    image: ''
                });
                setSuccessMessage('MEDICAL RECORD ADDED SUCCESSFULLY');
                setTimeout(() => setSuccessMessage(''), 2000);
                setError('');
                handleConfirmComplete(); // Call handleConfirmComplete after successful save
            })
            .catch(error => {
                console.error('Error adding medical record:', error);
                setError('ERROR ADDING MEDICAL RECORD');
            });
    };

    if (error && !newMedicalRecord.symptoms && !newMedicalRecord.diagnosis && !newMedicalRecord.test_results && !newMedicalRecord.prescription && !newMedicalRecord.notes) {
        return <div className="mrd-error-message">{error}</div>;
    }

    if (!appointment || !patient) {
        return <div className="mrd-loading">LOADING...</div>;
    }

    return (
        <div className="mrd-examine-patient-page">
            <div className="mrd-examine-patient-container">
                <button className="mrd-back-btn" onClick={() => navigate('/todayappointments')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 11H7.83l4.88-4.88-1.41-1.41L4.83 11l6.47 6.47 1.41-1.41L7.83 13H19v-2z" />
                    </svg>
                    Back
                </button>

                <div className="mrd-record-header">
                    <div className="mrd-record-avatar">
                        {getInitials(patient.patient_name)}
                    </div>
                    <div className="mrd-record-info">
                        <h1>Patient Examination Form</h1>
                        <p className="mrd-record-subtitle">{patient.patient_name || 'Unknown'}</p>
                        {successMessage && (
                            <div className="mrd-success-message">{successMessage}</div>
                        )}
                        {error && <div className="mrd-error-message">{error}</div>}
                    </div>
                </div>

                <div className="mrd-two-column-layout">
                    <div className="mrd-record-section mrd-patient-info">
                        <div className="mrd-section-title">
                            <div className="mrd-section-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <h2>Patient Information</h2>
                        </div>
                        <div className="mrd-info-grid">
                            <div className="mrd-info-item">
                                <span className="mrd-label">Code:</span>
                                <span className="mrd-value">8305{patient.patient_id || 'N/A'}</span>
                            </div>
                            <div className="mrd-info-item">
                                <span className="mrd-label">Full Name:</span>
                                <span className="mrd-value">{patient.patient_name || 'N/A'}</span>
                            </div>
                            <div className="mrd-info-item">
                                <span className="mrd-label">Email:</span>
                                <span className="mrd-value">{patient.patient_email || 'N/A'}</span>
                            </div>
                            <div className="mrd-info-item">
                                <span className="mrd-label">Examination Date:</span>
                                <span className="mrd-value">{new Date(appointment.medical_day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="mrd-info-item">
                                <span className="mrd-label">Time Slot:</span>
                                <span className="mrd-value">{getTimeSlotLabel(appointment.slot)}</span>
                            </div>
                            <div className="mrd-info-item">
                                <span className="mrd-label">Doctor Name:</span>
                                <span className="mrd-value">{doctorName}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mrd-record-section mrd-examination-info">
                    <div className="mrd-section-title">
                        <div className="mrd-section-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                            </svg>
                        </div>
                        <h2>Examination Information</h2>
                    </div>
                    <div className="mrd-details-grid">
                        <div className="mrd-detail-item mrd-full-width">
                            <span className="mrd-label">Clinical Examination *:</span>
                            <textarea
                                id="symptoms"
                                name="symptoms"
                                placeholder="Enter symptoms, clinical signs, medical history"
                                value={newMedicalRecord.symptoms}
                                onChange={handleNewMedicalRecordChange}
                                className="mrd-form-textarea"
                                required
                            />
                        </div>
                        <div className="mrd-detail-item mrd-full-width">
                            <span className="mrd-label">Diagnostic Tests *:</span>
                            <textarea
                                id="test_results"
                                name="test_results"
                                placeholder="Enter test results (e.g., X-ray, ultrasound, blood tests)"
                                value={newMedicalRecord.test_results}
                                onChange={handleNewMedicalRecordChange}
                                className="mrd-form-textarea"
                                required
                            />
                        </div>
                        <div className="mrd-detail-item mrd-full-width">
                            <span className="mrd-label">Diagnosis Conclusion *:</span>
                            <textarea
                                id="diagnosis"
                                name="diagnosis"
                                placeholder="Enter confirmed or suspected diagnosis"
                                value={newMedicalRecord.diagnosis}
                                onChange={handleNewMedicalRecordChange}
                                className="mrd-form-textarea"
                                required
                            />
                        </div>
                        <div className="mrd-detail-item mrd-full-width">
                            <span className="mrd-label">Treatment Plan *:</span>
                            <textarea
                                id="notes"
                                name="notes"
                                placeholder="Enter treatment instructions and follow-up schedule"
                                value={newMedicalRecord.notes}
                                onChange={handleNewMedicalRecordChange}
                                className="mrd-form-textarea"
                                required
                            />
                        </div>
                        <div className="mrd-detail-item mrd-full-width">
                            <span className="mrd-label">Prescription *:</span>
                            <textarea
                                id="prescription"
                                name="prescription"
                                placeholder="Enter medication name, dosage, and usage instructions"
                                value={newMedicalRecord.prescription}
                                onChange={handleNewMedicalRecordChange}
                                className="mrd-form-textarea"
                                required
                            />
                        </div>
                        <div className="mrd-detail-item">
                            <span className="mrd-label">Upload Image:</span>
                            <input
                                id="imageFile"
                                type="file"
                                name="imageFile"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mrd-form-file"
                            />
                            {newMedicalRecord.image && (
                                <div className="mrd-image-container">
                                    <img
                                        src={newMedicalRecord.image}
                                        alt="Medical record image"
                                        className="mrd-record-image"
                                        onError={(e) => (e.target.src = "https://via.placeholder.com/300x200?text=No+Image")}
                                        loading="lazy"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mrd-record-footer">
                    <button
                        onClick={() => setNewMedicalRecord({
                            symptoms: '',
                            diagnosis: '',
                            test_results: '',
                            prescription: '',
                            notes: '',
                            image: ''
                        })}
                        className="mrd-action-button mrd-secondary"
                    >
                        Clear Form
                    </button>
                    <button
                        onClick={handleAddMedicalRecordSubmit}
                        className="mrd-action-button"
                    >
                        Save Medical Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExaminePatient;