import axios from 'axios';
import React, { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Verify = () => {
    const [searchParams, setSearchParams] = useSearchParams()

    const success = searchParams.get("success")
    const appointmentId = searchParams.get("appointmentId")
    const paypal = searchParams.get("paypal")
    const payfast = searchParams.get("payfast")
    const pfPaymentId = searchParams.get("pfPaymentId")

    const { backendUrl, token } = useContext(AppContext)

    const navigate = useNavigate()

    // Function to verify stripe payment
    const verifyStripe = async () => {
        try {
            const { data } = await axios.post(backendUrl + "/api/user/verifyStripe", { success, appointmentId }, { headers: { token } })
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
            navigate("/my-appointments")
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // Function to verify PayPal payment
    const verifyPayPal = async () => {
        try {
            // Retrieve full custom data from local storage
            const fullCustomData = JSON.parse(localStorage.getItem('paypalCustomData') || '{}');
            
            const { data } = await axios.post(
                backendUrl + "/api/user/verifyPayPal", 
                { 
                    success, 
                    appointmentId, 
                    token: searchParams.get("token"),
                    fullCustomData,
                    paymentAmount: fullCustomData.amount ? parseFloat(fullCustomData.amount) : null
                }, 
                { headers: { token } }
            )
            
            // Clear the stored custom data
            localStorage.removeItem('paypalCustomData');

            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
            navigate("/my-appointments")
        } catch (error) {
            toast.error(error.message)
            console.log(error)
            // Ensure local storage is cleared even if there's an error
            localStorage.removeItem('paypalCustomData');
        }
    }

    // Function to verify PayFast payment
    const verifyPayFast = async () => {
        try {
            const { data } = await axios.post(
                backendUrl + "/api/user/verifyPayFast", 
                { 
                    success: success === "true", // Convert string to boolean
                    appointmentId, 
                    pfPaymentId 
                },
                { headers: { token } }
            );

            if (data.success) {
                if (success === "true") {
                    toast.success(data.message);
                } else {
                    // Show different message based on whether it's a first payment or additional payment
                    if (data.message.includes('Additional payment cancelled')) {
                        toast.info("Payment cancelled");
                    } else {
                        toast.info("Payment cancelled and appointment has been cancelled");
                    }
                }
            } else {
                toast.error(data.message);
            }
            navigate("/my-appointments");
        } catch (error) {
            console.error('PayFast verification error:', error);
            toast.error(error.message);
            navigate("/my-appointments");
        }
    }

    useEffect(() => {
        if (token && appointmentId) {
            // Handle PayFast verification regardless of success status
            if (payfast === "true") {
                verifyPayFast();
            }
            // Only verify other payments if success is true
            else if (success === "true") {
                if (paypal === "true") {
                    verifyPayPal();
                } else {
                    verifyStripe();
                }
            }
        }
    }, [token])

    return (
        <div className='min-h-[60vh] flex items-center justify-center'>
            <div className="w-20 h-20 border-4 border-gray-300 border-t-4 border-t-primary rounded-full animate-spin"></div>
        </div>
    )
}

export default Verify
