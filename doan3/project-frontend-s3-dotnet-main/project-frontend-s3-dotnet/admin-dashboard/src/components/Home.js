import React, { useState, useEffect } from "react";
import axios from "axios";

const Refund = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [refundAmounts, setRefundAmounts] = useState({});
  const [accessToken, setAccessToken] = useState(""); // Store PayPal Access Token

  // Fetch PayPal OAuth2 access token
  const getAccessToken = async () => {
    const clientId = "A21AAJh4KDQqdgOwWncQQRVyU2gezwTwGskfHtWgItpwcEDcv2RdckNqRjyGTMAngh1DtE4ik4tc4OFtu_gonyOjSvCfN0IkA";
    const clientSecret = "QVpxeDc5bHBaTktSTXYxVkpUVU1SNkxoT1M5VGhTZnlRYmJIckpmTXVlMmNRNHR3SU9Zd1ZnbUFRQTcweXBDQTExVHktV2x4ZFVyNEhLZDE6RUFpRDlCcVRFcDZjalRQOVhGWHV6dWNjUnNzR2Mwb1NUcVJYSG9wbW5zSW9KZmo1Z2N5WERJNkcyamU0WGFvcy1LRUo4SW5zWGZiSHlvLVQ=";

    const auth = btoa(`${clientId}:${clientSecret}`);

    try {
      const response = await axios.post("https://api-m.sandbox.paypal.com/v1/oauth2/token", "grant_type=client_credentials", {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const token = response.data.access_token;
      setAccessToken(token); // Set the access token to state
    } catch (error) {
      console.error("Error fetching access token:", error);
      setMessage("Error fetching PayPal access token.");
    }
  };

  // Fetch payments from the backend
  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5239/api/paypal/payments");
      setPayments(response.data);
    } catch (error) {
      setMessage("Error fetching payments.");
    } finally {
      setLoading(false);
    }
  };

  // Handle refund logic
  const handleRefund = async (paymentId) => {
    const refundAmount = refundAmounts[paymentId]; // Get the refund amount for the specific payment

    if (!refundAmount) {
      setMessage("Please enter a refund amount.");
      return;
    }

    if (!accessToken) {
      setMessage("Access token is missing. Please wait until it's fetched.");
      return;
    }

    try {
      const payment = payments.find((p) => p.paymentId === paymentId);

      if (!payment) {
        setMessage("Payment not found.");
        return;
      }

      setLoading(true);

      // Refund request to PayPal API
      const refundData = {
        amount: {
          total: refundAmount,
          currency: payment.currency,
        },
      };

      await axios.post(`https://api-m.sandbox.paypal.com/v1/payments/sale/${payment.payPalOrderId}/refund`, refundData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      setMessage(`Refund for Payment ${payment.payPalOrderId} successful.`);
      fetchPayments(); // Refresh payment data
    } catch (error) {
      setMessage("Error processing refund.");
      console.error("Refund Error:", error);
    } finally {
      setLoading(false);
    }
  };
  // Handle change of refund amount for a specific payment
  const handleRefundAmountChange = (paymentId, value) => {
    setRefundAmounts((prev) => ({
      ...prev,
      [paymentId]: value,
    }));
  };

  useEffect(() => {
    getAccessToken(); // Get PayPal access token on mount
    fetchPayments(); // Fetch payments when the component mounts
  }, []);

  // Filter payments with status 'PAID' or 'REFUND'
  const filteredPayments = payments.filter((payment) => payment.status === "PAID" || payment.status === "REFUND");

  return (
    <div>
      <h1>Payments</h1>

      {loading && <p>Loading payments...</p>}
      {message && <p>{message}</p>}

      <div>
        {filteredPayments.length === 0 ? (
          <p>No payments found with status PAID or REFUND.</p>
        ) : (
          <ul>
            {filteredPayments.map((payment) => (
              <li key={payment.paymentId}>
                <p>
                  <strong>Booking ID:</strong> {payment.bookingId} |<strong>PayPal Order ID:</strong> {payment.payPalOrderId} |<strong>Status:</strong> {payment.status} |<strong>Amount:</strong> {payment.value} {payment.currency}
                </p>

                <div>
                  <input type="number" value={refundAmounts[payment.paymentId] || ""} onChange={(e) => handleRefundAmountChange(payment.paymentId, e.target.value)} placeholder="Enter refund amount" />
                  <button onClick={() => handleRefund(payment.paymentId)}>Refund</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Refund;
