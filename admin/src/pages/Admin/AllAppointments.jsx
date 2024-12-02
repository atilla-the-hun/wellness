import React, { useEffect } from 'react'
import { assets } from '../../assets/assets'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, completeAppointment, getAllAppointments } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)

  // Function to calculate end time
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + duration;
    
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  // Function to get payment status text
  const getPaymentStatusText = (appointment) => {
    if (appointment.cancelled) {
      if (appointment.cancelledAtCheckout) {
        return "Unpaid - cancelled on checkout";
      }
      return "Cancelled";
    }
    
    switch (appointment.paymentStatus) {
      case 'full':
        return 'Paid in full';
      case 'partial':
        return `Partially paid (${currency}${appointment.paidAmount})`;
      case 'none':
      default:
        return 'Unpaid';
    }
  }

  useEffect(() => {
    if (aToken) {
      getAllAppointments()
    }
  }, [aToken])

  return (
    <div className='w-full max-w-6xl m-5 '>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>
      
      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        {appointments.map((item, index) => {
          const endTime = calculateEndTime(item.slotTime, item.duration);
          const paymentStatusText = getPaymentStatusText(item);
          const showBalancePayment = !item.cancelled && item.paymentStatus === 'partial';

          return (
            <div key={index} className='py-3 px-6 border-b pt-[20px] pb-[20px] hover:bg-gray-50'>
              <div className='flex flex-col gap-1'>
                <p className='font-semibold'>#</p>
                <p>{item.bookingNumber}</p>
              </div>

              <div>
                <p className='font-semibold mt-[20px]'>Treatment</p>
                <p>{item.docData.name}</p>
              </div>
              
              <p className='font-semibold mt-[20px]'>Client</p>
              <div className='flex items-center gap-2'>
                <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
              </div>
              
              <p className='font-semibold mt-[20px]'>Email</p>
              <p>{item.userData.email}</p>
              
              <p className='font-semibold mt-[20px]'>Phone Number</p>
              <p>{item.userData.phone}</p>
              
              <p className='font-semibold mt-[20px]'>Payment Status</p>
              <div className='flex flex-col gap-2'>
                <p className={`text-sm ${item.cancelled ? 'text-red-500' : item.paymentStatus === 'full' ? 'text-green-500' : 'text-orange-500'}`}>
                  {paymentStatusText}
                </p>
                {showBalancePayment && (
                  <button 
                    className='bg-primary text-white text-sm px-4 py-1 rounded-full w-fit'
                    onClick={() => {/* Handle balance payment */}}
                  >
                    Balance Payment
                  </button>
                )}
              </div>
              
              <p className='font-semibold mt-[20px]'>Age</p>
              <p>{calculateAge(item.userData.dob)}</p>
              
              <p className='font-semibold mt-[20px]'>Date & Time</p>
              <p>{slotDateFormat(item.slotDate)} | {item.slotTime} to {endTime} ({item.duration} min)</p>
              
              <p className='font-semibold mt-[20px]'>Fees</p>
              <p>{currency}{item.amount}</p>
              
              <p className='font-semibold mt-[20px]'>Action</p>
              {item.cancelled
                ? <div className='flex items-center gap-2'>
                    <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                  </div>
                : item.isCompleted
                  ? <div className='flex items-center gap-2'>
                      <p className='text-green-500 text-xs font-medium'>Completed</p>
                    </div>
                  : <div className='flex items-center gap-2'>
                      <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer -ml-[5px]' src={assets.cancel_icon} alt="" />
                      <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                    </div>
              }
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AllAppointments
