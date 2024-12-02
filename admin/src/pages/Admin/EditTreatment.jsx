import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { specialityData } from '../../../../frontend/src/assets/assets'

const EditTreatment = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { aToken } = useContext(AdminContext)
    const { currency, backendUrl } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [treatment, setTreatment] = useState(null)

    const getTreatment = async () => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/get-treatment', 
                { treatmentId: id }, 
                { headers: { aToken } }
            )
            if (data.success) {
                setTreatment(data.treatment)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const updateTreatment = async () => {
        try {
            const updateData = {
                treatmentId: id,
                name: treatment.name,
                speciality: treatment.speciality,
                about: treatment.about,
                available: treatment.available,
                time_slots: JSON.stringify(treatment.time_slots || [])
            }

            const { data } = await axios.post(backendUrl + '/api/admin/update-treatment', 
                updateData, 
                { headers: { aToken } }
            )

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getTreatment()
            } else {
                toast.error(data.message)
            }

            setIsEdit(false)
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    const handleTimeSlotChange = (index, field, value) => {
        setTreatment(prev => {
            const updatedSlots = [...prev.time_slots]
            updatedSlots[index] = {
                ...updatedSlots[index],
                [field]: field === 'price' ? parseFloat(value) : parseInt(value)
            }
            return { ...prev, time_slots: updatedSlots }
        })
    }

    const addTimeSlot = () => {
        setTreatment(prev => ({
            ...prev,
            time_slots: [...(prev.time_slots || []), { duration: 30, price: 0 }]
        }))
    }

    const removeTimeSlot = (index) => {
        setTreatment(prev => ({
            ...prev,
            time_slots: prev.time_slots.filter((_, i) => i !== index)
        }))
    }

    useEffect(() => {
        if (aToken && id) {
            getTreatment()
        }
    }, [aToken, id])

    return treatment && (
        <div>
            <div className='flex flex-col gap-4 m-5'>
                <div>
                    <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={treatment.image} alt="" />
                </div>

                <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-xl font-medium mb-4'>Edit Treatment</h2>
                        <button 
                            onClick={() => navigate('/admin/treatments')}
                            className='px-4 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-all'
                        >
                            Back
                        </button>
                    </div>

                    {/* Name */}
                    <div className='mb-4'>
                        <p className='text-sm font-medium text-[#262626] mb-1'>Name:</p>
                        {isEdit ? (
                            <input 
                                type='text' 
                                className='w-full outline-primary p-2 border rounded' 
                                value={treatment.name}
                                onChange={(e) => setTreatment(prev => ({ ...prev, name: e.target.value }))}
                            />
                        ) : (
                            <p className='text-gray-600'>{treatment.name}</p>
                        )}
                    </div>

                    {/* Speciality */}
                    <div className='mb-4'>
                        <p className='text-sm font-medium text-[#262626] mb-1'>Speciality:</p>
                        {isEdit ? (
                            <select 
                                className='w-full outline-primary p-2 border rounded'
                                value={treatment.speciality}
                                onChange={(e) => setTreatment(prev => ({ ...prev, speciality: e.target.value }))}
                            >
                                {specialityData.map((specialty, index) => (
                                    <option key={index} value={specialty.speciality}>
                                        {specialty.speciality}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className='text-gray-600'>{treatment.speciality}</p>
                        )}
                    </div>

                    {/* About */}
                    <div className='mb-4'>
                        <p className='text-sm font-medium text-[#262626] mb-1'>About:</p>
                        {isEdit ? (
                            <textarea 
                                className='w-full outline-primary p-2 border rounded' 
                                rows={8} 
                                value={treatment.about}
                                onChange={(e) => setTreatment(prev => ({ ...prev, about: e.target.value }))}
                            />
                        ) : (
                            <p className='text-gray-600'>{treatment.about}</p>
                        )}
                    </div>

                    {/* Time Slots */}
                    <div className='mb-4'>
                        <p className='text-sm font-medium text-[#262626] mb-1'>Treatment Duration & Price:</p>
                        {isEdit ? (
                            <div className='space-y-2'>
                                {treatment.time_slots?.map((slot, index) => (
                                    <div key={index} className='flex items-center gap-4'>
                                        <div className='flex items-center gap-2'>
                                            <input 
                                                type='number'
                                                className='outline-primary p-2 border rounded w-20'
                                                value={slot.duration}
                                                onChange={(e) => handleTimeSlotChange(index, 'duration', e.target.value)}
                                                placeholder='Minutes'
                                            />
                                            <span>minutes</span>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <span>{currency}</span>
                                            <input 
                                                type='number'
                                                className='outline-primary p-2 border rounded w-20'
                                                value={slot.price}
                                                onChange={(e) => handleTimeSlotChange(index, 'price', e.target.value)}
                                                placeholder='Price'
                                            />
                                        </div>
                                        <button 
                                            onClick={() => removeTimeSlot(index)}
                                            className='px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-all'
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={addTimeSlot}
                                    className='px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-all mt-2'
                                >
                                    Add Time Slot
                                </button>
                            </div>
                        ) : (
                            <div className='space-y-1'>
                                {treatment.time_slots?.map((slot, index) => (
                                    <p key={index} className='text-gray-600'>
                                        {slot.duration} minutes - {currency} {slot.price}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Available */}
                    <div className='flex gap-2 items-center mb-4'>
                        <input 
                            type="checkbox" 
                            onChange={() => isEdit && setTreatment(prev => ({ ...prev, available: !prev.available }))} 
                            checked={treatment.available} 
                        />
                        <label className='text-sm font-medium text-[#262626]'>Available</label>
                    </div>

                    {isEdit ? (
                        <button 
                            onClick={updateTreatment} 
                            className='px-4 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-all'
                        >
                            Save Changes
                        </button>
                    ) : (
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className='px-4 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-all'
                        >
                            Edit Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EditTreatment
