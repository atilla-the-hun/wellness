import React, { useState, useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'

const ManageAppointments = () => {
    const { adminRegisterUser, adminLoginUser, adminBookAppointment, treatments, getAllTreatments } = useContext(AdminContext)
    const { currency } = useContext(AppContext)
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    // User Form State
    const [isLogin, setIsLogin] = useState(true)
    const [userForm, setUserForm] = useState({
        name: '',
        phone: ''
    })

    // Booking State
    const [userId, setUserId] = useState(null)
    const [selectedTreatment, setSelectedTreatment] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedDuration, setSelectedDuration] = useState(null)
    const [selectedPrice, setSelectedPrice] = useState(null)
    const [slotTime, setSlotTime] = useState('')
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [selectedPractitioner, setSelectedPractitioner] = useState('Maria')
    const [isLoading, setIsLoading] = useState(false)

    // Payment Dialog State
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)
    const [paymentType, setPaymentType] = useState('full')
    const [paymentMethod, setPaymentMethod] = useState('cash')

    useEffect(() => {
        getAllTreatments()
    }, [])

    const handleUserSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (isLogin) {
                if (!userForm.phone) {
                    toast.error('Phone number is required')
                    setIsLoading(false)
                    return
                }
                const userId = await adminLoginUser(userForm.phone)
                if (userId) {
                    setUserId(userId)
                    toast.success('User logged in successfully')
                }
            } else {
                if (!userForm.name || !userForm.phone) {
                    toast.error('Name and phone number are required')
                    setIsLoading(false)
                    return
                }
                const userId = await adminRegisterUser(userForm)
                if (userId) {
                    setUserId(userId)
                    toast.success('User registered successfully')
                }
            }
        } catch (error) {
            toast.error(error.message)
        }

        setIsLoading(false)
    }

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}_${month}_${year}`;
    }

    const checkPractitionerAvailability = async (date, time, duration) => {
        try {
            const slotDate = formatDate(date);
            const { data } = await axios.post(`${backendUrl}/api/user/check-practitioner-availability`, {
                practitioner: selectedPractitioner,
                slotDate,
                slotTime: time,
                duration
            })
            return data.success && data.available
        } catch (error) {
            console.error('Error checking practitioner availability:', error)
            return false
        }
    }

    const getAvailableSlots = async () => {
        if (!selectedDuration) return;

        setIsLoading(true);
        setDocSlots([]);
        setSlotTime('');

        try {
            let currentSlot = new Date(selectedDate);
            let currentDate = new Date();
            const isToday = currentSlot.toDateString() === currentDate.toDateString();

            if (isToday) {
                const currentHour = currentDate.getHours();
                const currentMinutes = currentDate.getMinutes();
                currentSlot.setHours(currentHour + (currentMinutes > 0 ? 1 : 0), 0, 0, 0);
            } else {
                currentSlot.setHours(9, 0, 0, 0);
            }

            let endTime = new Date(selectedDate);
            endTime.setHours(17, 0, 0, 0);

            let timeSlots = [];
            let lastEndTime = null;

            while (currentSlot < endTime && timeSlots.length < 12) {
                const slotStartTime = formatTime(currentSlot);
                const treatmentEndTime = new Date(currentSlot.getTime() + selectedDuration * 60000);

                if (treatmentEndTime <= endTime) {
                    if (!lastEndTime || currentSlot >= new Date(lastEndTime.getTime() + 15 * 60000)) {
                        const isAvailable = await checkPractitionerAvailability(
                            selectedDate,
                            slotStartTime,
                            selectedDuration
                        );

                        if (isAvailable) {
                            timeSlots.push({
                                datetime: new Date(currentSlot),
                                time: slotStartTime,
                                endTime: formatTime(treatmentEndTime)
                            });
                            lastEndTime = treatmentEndTime;
                        }
                    }
                }

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

    useEffect(() => {
        if (selectedTreatment && selectedDuration) {
            getAvailableSlots()
        }
    }, [selectedTreatment, selectedDate, selectedDuration, selectedPractitioner])

    const handleDurationSelect = (duration, price) => {
        setSelectedDuration(duration)
        setSelectedPrice(price)
        setSlotTime('')
        setSlotIndex(0)
    }

    const handleBookingClick = () => {
        if (!slotTime) {
            return toast.warning('Please select a time slot')
        }

        if (!selectedDuration) {
            return toast.warning('Please select a duration')
        }

        setShowPaymentDialog(true)
    }

    const handleBooking = async () => {
        setShowPaymentDialog(false)
        setIsLoading(true)

        const date = docSlots[slotIndex].datetime
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        const slotDate = `${day}_${month}_${year}`

        try {
            const success = await adminBookAppointment({
                userId,
                docId: selectedTreatment._id,
                slotDate,
                slotTime,
                duration: selectedDuration,
                amount: selectedPrice,
                paymentType,
                paymentMethod,
                practitioner: selectedPractitioner
            })

            if (success) {
                // Reset form
                setUserId(null)
                setSelectedTreatment(null)
                setSelectedDuration(null)
                setSelectedPrice(null)
                setSlotTime('')
                setUserForm({
                    name: '',
                    phone: ''
                })
                setIsLogin(true)
                toast.success('Appointment booked successfully')
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (!userId) {
        return (
            <div className="min-h-[80vh] flex items-center">
                <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[280px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
                    <p className="text-2xl font-semibold m-auto">
                        {isLogin ? 'Login' : 'Register'} User
                    </p>
                    <form onSubmit={handleUserSubmit} className="w-full space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="border border-[#DADADA] rounded w-full p-2 mt-1"
                                    placeholder="Enter user's name"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                value={userForm.phone}
                                onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                                className="border border-[#DADADA] rounded w-full p-2 mt-1"
                                placeholder="Enter phone number"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-all"
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </form>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setUserForm({ name: '', phone: '' })
                        }}
                        className="w-full text-center text-primary hover:underline"
                    >
                        {isLogin ? 'Need to register?' : 'Already have an account?'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            {!selectedTreatment ? (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Select Treatment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                        {treatments.map(treatment => (
                            <div
                                key={treatment._id}
                                onClick={() => setSelectedTreatment(treatment)}
                                className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-all"
                            >
                                <p className="text-lg font-medium">{treatment.name}</p>
                                <p className="text-gray-600">{treatment.speciality}</p>
                                <p className="text-sm text-gray-500 mt-2">{treatment.about}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 border rounded-lg p-8 bg-white">
                            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
                                {selectedTreatment.name}
                                <img className="w-5" src={assets.verified_icon} alt="" />
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-gray-600">
                                <p>{selectedTreatment.speciality}</p>
                            </div>
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="mt-6">
                        <p className="mb-3 font-medium">Select Treatment Duration:</p>
                        <div className="flex flex-wrap gap-4">
                            {selectedTreatment.time_slots.map((slot) => (
                                <button
                                    key={slot.duration}
                                    onClick={() => handleDurationSelect(slot.duration, slot.price)}
                                    className={`px-4 py-2 rounded ${
                                        selectedDuration === slot.duration
                                            ? 'bg-primary text-white'
                                            : 'bg-white text-gray-600 border'
                                    }`}
                                >
                                    {slot.duration} minutes - {currency}{slot.price}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div className="mt-6">
                        <p className="mb-3 font-medium">Select Date:</p>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="border rounded p-2"
                        />
                    </div>

                    {/* Practitioner Selection */}
                    <div className="mt-6">
                        <p className="mb-3 font-medium">Select Practitioner:</p>
                        <select
                            value={selectedPractitioner}
                            onChange={(e) => setSelectedPractitioner(e.target.value)}
                            className="border rounded p-2"
                        >
                            <option value="Maria">Maria</option>
                            <option value="Thandi">Thandi</option>
                            <option value="Nompumelelo">Nompumelelo</option>
                            <option value="Mandy">Mandy</option>
                            <option value="Zsuzsanna">Zsuzsanna</option>
                        </select>
                    </div>

                    {/* Time Slots */}
                    <div className="mt-6">
                        <p className="mb-3 font-medium">Select Time:</p>
                        {isLoading ? (
                            <p>Loading available slots...</p>
                        ) : docSlots.length === 0 ? (
                            <p>No available slots for this date</p>
                        ) : (
                            <div className="grid grid-cols-4 gap-4">
                                {docSlots.map((slot, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSlotTime(slot.time)
                                            setSlotIndex(index)
                                        }}
                                        className={`text-center p-2 rounded cursor-pointer ${
                                            slotTime === slot.time
                                                ? 'bg-primary text-white'
                                                : 'bg-white border'
                                        }`}
                                    >
                                        <div>{slot.time}</div>
                                        <div className="text-xs">to</div>
                                        <div>{slot.endTime}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-4">
                        <button
                            onClick={() => setSelectedTreatment(null)}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleBookingClick}
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:bg-primary/50"
                        >
                            {isLoading ? 'Processing...' : 'Book Appointment'}
                        </button>
                    </div>

                    {/* Payment Options Dialog */}
                    {showPaymentDialog && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                                <h3 className="text-lg font-semibold mb-4">Payment Options</h3>
                                
                                {/* Payment Type */}
                                <div className="mb-4">
                                    <p className="font-medium mb-2">Payment Type:</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="paymentType"
                                                value="full"
                                                checked={paymentType === 'full'}
                                                onChange={(e) => setPaymentType(e.target.value)}
                                            />
                                            Full Payment ({currency}{selectedPrice})
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="paymentType"
                                                value="partial"
                                                checked={paymentType === 'partial'}
                                                onChange={(e) => setPaymentType(e.target.value)}
                                            />
                                            50% Payment ({currency}{selectedPrice / 2})
                                        </label>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="mb-6">
                                    <p className="font-medium mb-2">Payment Method:</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cash"
                                                checked={paymentMethod === 'cash'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            Cash
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="speed_point"
                                                checked={paymentMethod === 'speed_point'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            Speed Point
                                        </label>
                                    </div>
                                </div>

                                {/* Dialog Actions */}
                                <div className="flex justify-end gap-4">
                                    <button
                                        onClick={() => setShowPaymentDialog(false)}
                                        className="px-4 py-2 border rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBooking}
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:bg-primary/50"
                                    >
                                        {isLoading ? 'Processing...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ManageAppointments
