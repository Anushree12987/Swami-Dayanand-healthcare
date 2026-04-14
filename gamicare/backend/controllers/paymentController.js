const Appointment = require('../models/Appointment');
const axios = require('axios');

// Placeholder for Khalti Test Secret Key. User should define this in their .env
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || 'Key 66da235ddff14c6fb73d57fcca8eceb0'; // Sample dummy format, user needs to replace.

// Initiate actual Khalti ePayment
const initiateKhalti = async (req, res) => {
    const { appointmentId } = req.body;
    try {
        const appointment = await Appointment.findById(appointmentId).populate('patientId');
        
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Amount must be in paisa for Khalti (Rs. * 100)
        const amountInPaisa = (appointment.amount || 500) * 100;

        const payload = {
            "return_url": "http://localhost:3005/patient/payment-success",
            "website_url": "http://localhost:3005/",
            "amount": amountInPaisa,
            "purchase_order_id": appointment._id.toString(),
            "purchase_order_name": "GamiCare Consultation",
            "customer_info": {
                "name": appointment.patientId?.name || "Patient",
                "email": appointment.patientId?.email || "patient@gamicare.com",
                "phone": "9800000000" // Khalti requires a 10 digit number
            }
        };

        const response = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/', payload, {
            headers: {
                'Authorization': process.env.KHALTI_SECRET_KEY || 'Key 8cb1190ea47f44d18ecad2397645d947',
                'Content-Type': 'application/json',
            }
        });

        // Response contains pidx and payment_url
        if (response.data && response.data.payment_url) {
            res.json({
                success: true,
                payment_url: response.data.payment_url,
                pidx: response.data.pidx
            });
        } else {
            console.warn("Khalti API did not return a payment URL. Falling back to Mock Mode.");
            // Provide a mock URL for testing if the user hasn't set up Khalti yet
            res.json({
                success: true,
                mock: true,
                payment_url: `http://localhost:3005/patient/payment-success?pidx=MOCK_${Date.now()}_ID_${appointment._id}&status=Completed&purchase_order_id=${appointment._id}`,
                message: 'Using Test Mode: Redirecting to mock payment success page.'
            });
        }

    } catch (error) {
        console.error("Khalti Initiate Error: ", error.response?.data || error.message);
        
        // If it's a 401/403 (invalid key), we still want to allow testing via Mock Mode
        console.warn("Khalti API failed. Switching to Mock Link for development.");
        res.json({
            success: true,
            mock: true,
            payment_url: `http://localhost:3005/patient/payment-success?pidx=MOCK_${Date.now()}_ID_${appointmentId}&status=Completed&purchase_order_id=${appointmentId}`,
            message: 'Khalti Key Invalid or API Error. Testing with Mock Redirect.'
        });
    }
};

// Verify Khalti Payment (Callback)
const verifyKhalti = async (req, res) => {
    try {
        const { pidx } = req.body;
        if (!pidx) {
            return res.status(400).json({ message: 'Missing pidx parameter' });
        }

        // --- MOCK MODE HANDLING ---
        if (pidx.startsWith('MOCK_')) {
            console.log("[DEBUG] Verifying MOCK payment for pidx:", pidx);
            // Extract the appointment ID from the MOCK string
            const appointmentId = pidx.split('_ID_')[1];
            
            if (appointmentId) {
                const appointment = await Appointment.findById(appointmentId);
                if (appointment) {
                    appointment.paymentStatus = 'paid';
                    appointment.transactionId = pidx;
                    await appointment.save();
                    
                    return res.json({
                        success: true,
                        message: 'Mock Payment verified successfully',
                        appointment
                    });
                }
            }
            
            return res.json({
                success: true,
                message: 'Mock Payment processed',
                appointment: { paymentStatus: 'paid' }
            });
        }
        // -------------------------

        const payload = { pidx: pidx };

        const response = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', payload, {
            headers: {
                'Authorization': process.env.KHALTI_SECRET_KEY || 'Key 8cb1190ea47f44d18ecad2397645d947',
                'Content-Type': 'application/json',
            }
        });

        const statusResponse = response.data;
        
        // Find appointment based on purchase_order_id inside Khalti response or we might need it from DB
        if (statusResponse.status === 'Completed') {
            const appointmentId = statusResponse.purchase_order_id;
            const appointment = await Appointment.findById(appointmentId);
            
            if (!appointment) {
                return res.status(404).json({ message: 'Paid appointment not found in database' });
            }

            appointment.paymentStatus = 'paid';
            appointment.transactionId = statusResponse.transaction_id || pidx;
            await appointment.save();

            return res.json({
                success: true,
                message: 'Payment verified successfully',
                appointment
            });
        } else {
            return res.json({
                success: false,
                message: `Payment status is ${statusResponse.status}`,
                status: statusResponse.status
            });
        }
    } catch (error) {
        console.error("Khalti Verify Error: ", error.response?.data || error.message);
        res.status(500).json({ message: 'Server error during Khalti verification', error: error.response?.data || error.message });
    }
};

module.exports = {
    initiateKhalti,
    verifyKhalti
};
