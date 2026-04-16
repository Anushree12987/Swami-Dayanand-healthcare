const Appointment = require('../models/Appointment');
const axios = require('axios');
const crypto = require('crypto');

// eSewa Sandbox (UAT) Credentials
const ESEWA_SECRET_KEY = '8gBm/:&EnhH.1/q'; 
const ESEWA_PRODUCT_CODE = 'EPAYTEST';
const ESEWA_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

// Initiate eSewa v2 Payment
const initiateEsewa = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const amount = appointment.amount || 500;
        const transaction_uuid = `E_${appointmentId}_${Date.now()}`;
        const frontendUrl = req.headers.origin || 'http://localhost:3005';
        
        // Message format for eSewa v2 Signature: total_amount=X,transaction_uuid=Y,product_code=Z
        const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
        
        const signature = crypto.createHmac('sha256', ESEWA_SECRET_KEY)
            .update(message)
            .digest('base64');

        const payload = {
            amount: amount,
            failure_url: `${frontendUrl}/patient/payment-failure`,
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: ESEWA_PRODUCT_CODE,
            signature: signature,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: `${frontendUrl}/patient/payment-success`,
            tax_amount: "0",
            total_amount: amount,
            transaction_uuid: transaction_uuid
        };

        res.json({
            success: true,
            payment_url: ESEWA_URL,
            payload
        });

    } catch (error) {
        console.error("eSewa Initiate Error: ", error.message);
        res.status(500).json({ message: 'Error initiating eSewa payment' });
    }
};

// Verify eSewa v2 Payment (Callback)
const verifyEsewa = async (req, res) => {
    try {
        const { data } = req.body;
        if (!data) {
            return res.status(400).json({ message: 'Missing data parameter' });
        }

        // Decode eSewa base64 response
        const decodedString = Buffer.from(data, 'base64').toString('ascii');
        const decodedData = JSON.parse(decodedString);
        
        // Status should be 'COMPLETE' for success
        if (decodedData.status === 'COMPLETE') {
            // Extract original appointment ID from UUID (format: E_ID_TIMESTAMP)
            const appointmentId = decodedData.transaction_uuid.split('_')[1];
            const appointment = await Appointment.findById(appointmentId);
            
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }

            appointment.paymentStatus = 'paid';
            appointment.transactionId = decodedData.transaction_code || decodedData.transaction_uuid;
            await appointment.save();

            return res.json({
                success: true,
                message: 'eSewa Payment verified successfully',
                appointment
            });
        } else {
            return res.json({
                success: false,
                message: `Payment status is ${decodedData.status}`,
                status: decodedData.status
            });
        }
    } catch (error) {
        console.error("eSewa Verify Error: ", error.message);
        res.status(500).json({ message: 'Server error during eSewa verification' });
    }
};

module.exports = {
    initiateEsewa,
    verifyEsewa
};
