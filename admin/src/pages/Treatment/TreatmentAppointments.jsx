import React from 'react'
import { useContext, useEffect } from 'react'
import { TreatmentContext } from '../../context/TreatmentContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const TreatmentAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(TreatmentContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        {appointments.map((item, index) => (
          <div key={index} className='py-3 px-6 border-b hover:bg-gray-50'>
            <div className='flex flex-col gap-1 pt-[20px] pb-[20px]'>
              <p className='font-semibold'>#</p>
              <p>{index + 1}</p>
              <p className='font-semibold mt-[20px]'>Patient</p>
              <div className='flex items-center gap-2'>
                <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
              </div>
              <p className='font-semibold mt-[20px]'>Email</p>
              <p>{item.userData.email}</p>
              <p className='font-semibold mt-[20px] '>Phone Number</p>
              <p>{item.userData.phone}</p>
              <p className='font-semibold mt-[20px]'>Payment</p>
              <p className='text-xs inline-block rounded-full'>
                {item.payment ? 'Online' : 'CASH'}
              </p>
              <p className='font-semibold mt-[20px]'>Age</p>
              <p>{calculateAge(item.userData.dob)}</p>
              <p className='font-semibold mt-[20px]'>Date & Time</p>
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              <p className='font-semibold mt-[20px]'>Fees</p>
              <p>{currency}{item.amount}</p>
              <p className='font-semibold mt-[20px]'>Action</p>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <div className='flex'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer -ml-[5px]' src={assets.cancel_icon} alt="" />
                    <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                  </div>
              }
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default TreatmentAppointments