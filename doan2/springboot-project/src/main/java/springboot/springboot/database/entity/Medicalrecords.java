package springboot.springboot.database.entity;

import java.util.Date;
import java.util.List;

public class Medicalrecords extends Entity<Integer> {
    private Integer record_id;
    private Integer patient_id;
    private String symptoms;
    private String diagnosis;
    private String treatment;
    private String prescription;
    private Date follow_up_date;
    private Integer doctor_id;
    private String test_urine;
    private String test_blood;
    private String x_ray;
    private List<Patients> patients;
    private List<Doctors> doctors;

    public Medicalrecords() {
    }

    public Integer getRecord_id() {
        return record_id;
    }

    public void setRecord_id(Integer record_id) {
        this.record_id = record_id;
    }

    public Integer getPatient_id() {
        return patient_id;
    }

    public void setPatient_id(Integer patient_id) {
        this.patient_id = patient_id;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public Date getFollow_up_date() {
        return follow_up_date;
    }

    public void setFollow_up_date(Date follow_up_date) {
        this.follow_up_date = follow_up_date;
    }

    public Integer getDoctor_id() {
        return doctor_id;
    }

    public void setDoctor_id(Integer doctor_id) {
        this.doctor_id = doctor_id;
    }

    public String getTest_urine() {
        return test_urine;
    }

    public void setTest_urine(String test_urine) {
        this.test_urine = test_urine;
    }

    public String getTest_blood() {
        return test_blood;
    }

    public void setTest_blood(String test_blood) {
        this.test_blood = test_blood;
    }

    public String getX_ray() {
        return x_ray;
    }

    public void setX_ray(String x_ray) {
        this.x_ray = x_ray;
    }

    public List<Patients> getPatients() {
        return patients;
    }

    public void setPatients(List<Patients> patients) {
        this.patients = patients;
    }

    public List<Doctors> getDoctors() {
        return doctors;
    }

    public void setDoctors(List<Doctors> doctors) {
        this.doctors = doctors;
    }

    @Override
    public String toString() {
        return "Medicalrecords{" +
                "record_id=" + record_id +
                ", patient_id=" + patient_id +
                ", symptoms='" + symptoms + '\'' +
                ", diagnosis='" + diagnosis + '\'' +
                ", treatment='" + treatment + '\'' +
                ", prescription='" + prescription + '\'' +
                ", follow_up_date=" + follow_up_date +
                ", doctor_id=" + doctor_id +
                ", test_urine='" + test_urine + '\'' +
                ", test_blood='" + test_blood + '\'' +
                ", x_ray='" + x_ray + '\'' +
                ", patients=" + patients +
                ", doctors=" + doctors +
                '}';
    }
}
