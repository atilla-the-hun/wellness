import React, { useContext, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AddTreatment = () => {
    const [name, setName] = useState('')
    const [about, setAbout] = useState('')
    const [speciality, setSpeciality] = useState('Nails')
    const [timeSlots, setTimeSlots] = useState([])

    const availableDurations = [30, 60, 90, 120, 240, 360]

    const { backendUrl } = useContext(AppContext)
    const { aToken } = useContext(AdminContext)

    const handleTimeSlotToggle = (duration) => {
        setTimeSlots(prev => {
            // If duration exists, remove it
            if (prev.find(slot => slot.duration === duration)) {
                return prev.filter(slot => slot.duration !== duration)
            }
            // If duration doesn't exist, add it with empty price
            return [...prev, { duration, price: '' }]
        })
    }

    const handlePriceChange = (duration, price) => {
        setTimeSlots(prev => {
            return prev.map(slot => {
                if (slot.duration === duration) {
                    return { ...slot, price: Number(price) }
                }
                return slot
            })
        })
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            // Validate time slots and prices
            if (timeSlots.length === 0) {
                return toast.error('Please select at least one time slot duration')
            }

            // Check if all selected time slots have valid prices
            const invalidSlots = timeSlots.filter(slot => !slot.price || slot.price <= 0)
            if (invalidSlots.length > 0) {
                return toast.error('Please enter valid prices for all selected durations')
            }

            const formData = new FormData()
            formData.append('name', name)
            formData.append('about', about)
            formData.append('speciality', speciality)
            formData.append('time_slots', JSON.stringify(timeSlots))

            const { data } = await axios.post(backendUrl + '/api/admin/add-treatment', formData, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setName('')
                setAbout('')
                setTimeSlots([])
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    return (
        <form onSubmit={onSubmitHandler} className='m-5 w-[250px] sm:w-3/4'>
            <p className='mb-3 text-lg font-medium'>Add Treatment</p>

            <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
                <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
                    <div className='w-full lg:flex-1 flex flex-col gap-4'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Treatment Name</p>
                            <input 
                                onChange={e => setName(e.target.value)} 
                                value={name} 
                                className='border rounded px-3 py-2' 
                                type="text" 
                                placeholder='Treatment Name' 
                                required 
                            />
                        </div>

                        <div className='flex-1 flex flex-col gap-1'>
                            <p>Speciality</p>
                            <select 
                                onChange={e => setSpeciality(e.target.value)} 
                                value={speciality} 
                                className='border rounded px-2 py-2'
                            >
                                <option value="Nails">Nails</option>
                                <option value="Facial">Facial Care</option>
                                <option value="Massage">Massage</option>
                                <option value="Waxing">Waxing</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <p className='mt-4 mb-2'>About Treatment</p>
                    <textarea 
                        onChange={e => setAbout(e.target.value)} 
                        value={about} 
                        className='w-full px-4 pt-2 border rounded' 
                        rows={5} 
                        placeholder='Write about treatment'
                        required
                    ></textarea>
                </div>

                <div className='mt-4'>
                    <p className='mb-2'>Time Slot Durations and Prices</p>
                    <div className='flex flex-wrap gap-4'>
                        {availableDurations.map(duration => {
                            const isSelected = timeSlots.find(slot => slot.duration === duration)
                            return (
                                <div key={duration} className='flex flex-col gap-2'>
                                    <button
                                        type="button"
                                        onClick={() => handleTimeSlotToggle(duration)}
                                        className={`px-4 py-2 rounded ${
                                            isSelected
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-gray-600 border border-gray-300'
                                        }`}
                                    >
                                        {duration} minutes
                                    </button>
                                    {isSelected && (
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={isSelected.price}
                                            onChange={(e) => handlePriceChange(duration, e.target.value)}
                                            className='border rounded px-3 py-2 w-full'
                                            required
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <button type='submit' className='bg-primary px-2 py-3 mt-4 text-white rounded-full'>
                    Add treatment
                </button>
            </div>
        </form>
    )
}

export default AddTreatment
