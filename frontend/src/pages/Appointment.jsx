import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedTreatments from '../components/RelatedTreatments'
import axios from 'axios'
import { toast } from 'react-toastify'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

const Appointment = () => {
    const { docId } = useParams()
    const { treatments, currencySymbol, backendUrl, token } = useContext(AppContext)

    const [docInfo, setDocInfo] = useState(false)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [paymentType, setPaymentType] = useState('partial') // Default to partial payment
    const [paymentMethod, setPaymentMethod] = useState('payfast') // Default to PayFast
    const [appointmentId, setAppointmentId] = useState(null)
    const [selectedPractitioner, setSelectedPractitioner] = useState('Maria')
    const [selectedDuration, setSelectedDuration] = useState(null)
    const [selectedPrice, setSelectedPrice] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isPaymentLoading, setIsPaymentLoading] = useState(false)
    const [userCredit, setUserCredit] = useState(0)

    const navigate = useNavigate()

    const fetchDocInfo = async () => {
        const docInfo = treatments.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
        // Set default duration to first available duration if exists
        if (docInfo?.time_slots?.length > 0) {
            const firstSlot = docInfo.time_slots[0]
            setSelectedDuration(firstSlot.duration)
            setSelectedPrice(firstSlot.price)
        }
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    const formatDate = (date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}_${month}_${year}`;
    }

    const checkPractitionerAvailability = async (date, time, duration) => {
        try {
            const slotDate = formatDate(date);
            console.log('Checking availability for:', { slotDate, time, duration, practitioner: selectedPractitioner });

            const { data } = await axios.post(backendUrl + '/api/user/check-practitioner-availability', {
                practitioner: selectedPractitioner,
                slotDate,
                slotTime: time,
                duration
            })

            console.log('Availability response:', data);
            return data.success && data.available;
        } catch (error) {
            console.error('Error checking practitioner availability:', error)
            return false
        }
    }

    const getAvailableSolts = async () => {
        if (!selectedDuration) return;

        setIsLoading(true);
        setDocSlots([]);
        setSlotTime('');

        try {
            // getting the selected date
            let currentSlot = new Date(selectedDate);
            let currentDate = new Date();

            // Check if selected date is today
            const isToday = currentSlot.toDateString() === currentDate.toDateString();

            // If it's today, start from the next hour
            if (isToday) {
                const currentHour = currentDate.getHours();
                const currentMinutes = currentDate.getMinutes();
                
                // Round up to the next hour
                currentSlot.setHours(currentHour + (currentMinutes > 0 ? 1 : 0), 0, 0, 0);
            } else {
                // For future dates, start from beginning of day
                currentSlot.setHours(9, 0, 0, 0); // Start at 9 AM
            }

            // setting end time to 5 PM
            let endTime = new Date(selectedDate);
            endTime.setHours(17, 0, 0, 0); // End at 5 PM

            let timeSlots = [];
            let lastEndTime = null;

            while (currentSlot < endTime && timeSlots.length < 12) {
                const slotStartTime = formatTime(currentSlot);
                const treatmentEndTime = new Date(currentSlot.getTime() + selectedDuration * 60000);

                // Only add slot if the treatment would finish before or at end time (5 PM)
                if (treatmentEndTime <= endTime) {
                    // Check if this slot starts after the last end time plus break
                    if (!lastEndTime || currentSlot >= new Date(lastEndTime.getTime() + 15 * 60000)) {
                        const slotEndTime = formatTime(treatmentEndTime);
                        
                        // Check if this slot is available
                        const isAvailable = await checkPractitionerAvailability(
                            currentSlot,
                            slotStartTime,
                            selectedDuration
                        );

                        if (isAvailable) {
                            timeSlots.push({
                                datetime: new Date(currentSlot),
                                time: slotStartTime,
                                endTime: slotEndTime
                            });
                            lastEndTime = treatmentEndTime;
                        }
                    }
                }

                // Always move in 15-minute increments
                currentSlot = new Date(currentSlot.getTime() + 15 * 60000);
            }

            setDocSlots(timeSlots);
        } catch (error) {
            console.error('Error getting available slots:', error);
            toast.error('Error loading time slots');
        } finally {
            setIsLoading(false);
        }
    }

    const handleDurationSelect = (duration, price) => {
        setSelectedDuration(duration)
        setSelectedPrice(price)
        setSlotTime('') // Reset selected time when duration changes
        setSlotIndex(0)
    }

    const handlePractitionerChange = (practitioner) => {
        setSelectedPractitioner(practitioner)
        setSlotTime('') // Reset selected time when practitioner changes
        setSlotIndex(0)
    }

    const fetchUserCredit = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/user/get-profile',
                { headers: { token } }
            );
            if (data.success) {
                setUserCredit(data.userData.creditBalance || 0);
            }
        } catch (error) {
            console.error('Error fetching user credit:', error);
        }
    };

    const calculatePaymentAmount = (totalAmount) => {
        if (!totalAmount) return 0;
        const requiredAmount = paymentType === 'partial' ? totalAmount / 2 : totalAmount;
        const remainingAfterCredit = Math.max(0, requiredAmount - userCredit);
        return remainingAfterCredit;
    };

    const initiateBooking = async () => {
        if (!token) {
            toast.warning('Login to book appointment')
            return navigate('/login')
        }

        if (!slotTime) {
            return toast.warning('Please select a time slot')
        }

        if (!selectedDuration) {
            return toast.warning('Please select a duration')
        }

        setIsPaymentLoading(true)

        const date = docSlots[slotIndex].datetime
        const slotDate = formatDate(date);

        try {
            console.log('Initiating booking with:', {
                docId,
                slotDate,
                slotTime,
                duration: selectedDuration,
                amount: selectedPrice,
                paymentType,
                practitioner: selectedPractitioner,
                useCredit: userCredit > 0
            });

            const { data } = await axios.post(backendUrl + '/api/user/book-appointment', 
                { 
                    docId, 
                    slotDate, 
                    slotTime, 
                    duration: selectedDuration,
                    amount: selectedPrice,
                    paymentType, 
                    practitioner: selectedPractitioner,
                    useCredit: userCredit > 0
                },
                { headers: { token } }
            )
            
            if (data.success) {
                setAppointmentId(data.appointmentId)
                const paymentAmount = calculatePaymentAmount(selectedPrice);
                
                // If payment amount is 0 (fully covered by credit), no need for PayFast
                if (paymentAmount === 0) {
                    toast.success('Appointment booked using credit balance');
                    navigate('/my-appointments');
                    return;
                }

                initiatePayment(data.appointmentId, paymentAmount)
            } else {
                setIsPaymentLoading(false)
                toast.error(data.message)
            }

        } catch (error) {
            setIsPaymentLoading(false)
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const initiatePayment = async (appointmentId, amount) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/payment-payfast',
                { 
                    appointmentId, 
                    paymentType,
                    amount 
                },
                { headers: { token } }
            )

            if (data.success) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.payfast_url;

                Object.entries(data.paymentData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit();
            } else {
                setIsPaymentLoading(false)
                toast.error(data.message)
            }
        } catch (error) {
            setIsPaymentLoading(false)
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (treatments.length > 0) {
            fetchDocInfo()
        }
    }, [treatments, docId])

    useEffect(() => {
        if (docInfo && selectedDuration) {
            getAvailableSolts()
        }
    }, [docInfo, selectedDate, selectedDuration, selectedPractitioner])

    useEffect(() => {
        if (token) {
            fetchUserCredit();
        }
    }, [token]);

    return docInfo ? (
        <div>
            {/* Loading Overlay */}
            {isPaymentLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                        <p className="text-lg font-medium">Connecting to PayFast...</p>
                    </div>
                </div>
            )}

            {/* ---------- Treatment Details ----------- */}
            <div className='flex flex-col sm:flex-row gap-4'>
                <div className='flex-1 border border-[#ADADAD] rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[20px] sm:mt-0'>
                    <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>{docInfo.name} <img className='w-5' src={assets.verified_icon} alt="" /></p>
                    <div className='flex items-center gap-2 mt-1 text-gray-600'>
                        <p>{docInfo.speciality}</p>
                    </div>

                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={assets.info_icon} alt="" /></p>
                        <p className='text-sm text-gray-600 mt-1'>{docInfo.about}</p>
                    </div>
                </div>
            </div>

            {/* Duration Selection */}
            {docInfo.time_slots && docInfo.time_slots.length > 0 && (
                <div className='mt-6'>
                    <p className='mb-3 font-medium text-white'>Select Treatment Duration:</p>
                    <div className='flex flex-wrap gap-4'>
                        {docInfo.time_slots.map((slot) => (
                            <button
                                key={slot.duration}
                                onClick={() => handleDurationSelect(slot.duration, slot.price)}
                                className={`px-4 py-2 rounded ${
                                    selectedDuration === slot.duration
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-600 border border-gray-300'
                                }`}
                            >
                                {slot.duration} minutes - {currencySymbol}{slot.price}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Title for Date Picker */}
            <h2 className='mt-4 text-lg font-semibold text-white'>Click below to select the day</h2>

            {/* Date Picker for selecting booking date */}
            <div className='mt-4'>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    minDate={new Date()}
                    dateFormat="yyyy/MM/dd"
                    className="border border-gray-300 rounded p-2"
                />
            </div>

            {/* Practitioner Selection */}
            <div className='mt-4'>
                <label className='block mb-2 text-white'>Select Practitioner:</label>
                <select 
                    value={selectedPractitioner} 
                    onChange={(e) => handlePractitionerChange(e.target.value)} 
                    className="border border-gray-300 rounded p-2"
                >
                    <option value="Maria">Maria</option>
                    <option value="Thandi">Thandi</option>
                    <option value="Nompumelelo">Nompumelelo</option>
                    <option value="Mandy">Mandy</option>
                    <option value="Zsuzsanna">Zsuzsanna</option>
                </select>
            </div>

            {/* Booking slots */}
            <div className='sm:ml-72 sm:pl-4 mt-8 font-medium text-white'>
                <p>Available Time Slots</p>
                {isLoading ? (
                    <p className="mt-4 text-center text-white">Loading available slots...</p>
                ) : (
                    <div className='grid grid-cols-4 sm:grid-cols-4 gap-6 mt-4'>
                        {docSlots.length > 0 ? docSlots.map((item, index) => (
                            <div
                                onClick={() => {
                                    setSlotTime(item.time)
                                    setSlotIndex(index)
                                }}
                                key={index}
                                className={`text-sm font-light flex flex-col items-center justify-center px-5 py-2 rounded-lg cursor-pointer ${
                                    item.time === slotTime ? 'bg-primary text-white' : 'text-white border border-white'
                                }`}
                            >
                                <span>{item.time}</span>
                                <span className="text-xs mt-1 text-white">to</span>
                                <span>{item.endTime}</span>
                            </div>
                        )) : (
                            <p className="col-span-4 text-center text-white">No available slots for this duration</p>
                        )}
                    </div>
                )}

                {/* Payment Options */}
                <div className='mt-6'>
                    <p className='mb-3'>Payment Amount:</p>
                    <div className='flex gap-4 mb-4'>
                        <label className='flex items-center gap-2'>
                            <input
                                type="radio"
                                value="partial"
                                checked={paymentType === 'partial'}
                                onChange={(e) => setPaymentType(e.target.value)}
                            />
                            <span>Pay 50% ({currencySymbol}{selectedPrice ? selectedPrice / 2 : 0})</span>
                        </label>
                    </div>
                    {userCredit > 0 && (
                        <div className='mb-4 text-green-600'>
                            <p>Available Credit: {currencySymbol}{userCredit}</p>
                            <p className='text-sm'>
                                {calculatePaymentAmount(selectedPrice) === 0 
                                    ? 'Your credit balance will cover the full payment'
                                    : `${currencySymbol}${calculatePaymentAmount(selectedPrice)} will be charged after using credit`}
                            </p>
                        </div>
                    )}
                </div>

                <div className='flex gap-4 mt-6'>
                    <button 
                        onClick={() => navigate(-1)} 
                        className='bg-gray-500 text-white text-sm font-light px-6 py-3 rounded-full'
                        disabled={isPaymentLoading}
                    >
                        Go Back
                    </button>
                    <button 
                        onClick={initiateBooking} 
                        className='bg-primary text-white text-sm font-light px-6 py-3 rounded-full'
                        disabled={isPaymentLoading}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>

            {/* Listing Related Treatments */}
            <RelatedTreatments speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment
