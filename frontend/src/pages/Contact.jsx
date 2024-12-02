import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Contact = () => {
  const navigate = useNavigate()

  const handleBookAppointment = () => {
    navigate('/treatments');
    // Force scroll to top after a short delay to ensure navigation has completed
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  return (
    <div>
      <div className='text-center text-2xl pt-10 text-white'>
        <p>CONTACT <span className='text-white font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[310px]' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6 -mt-[10px]'>
          <p className=' font-semibold text-lg text-white'>OUR OFFICE</p>
          <p className=' text-white'>1 Erf 379 <br /> 47 Outlook Road, Southbroom, 4277, KZN, South Africa</p>
          <p className=' text-white'><a href="tel:0774705140">077 470 5140</a> <br /> Email: <a href="mailto:contact@bestcareconsulting.com">contact@bestcareconsulting.com</a></p>
          <p className=' font-semibold text-lg text-white'>BOOK YOUR APPOINTMENT NOW</p>
          <p className=' text-white'>Click the button below.</p>
          <button 
            onClick={handleBookAppointment} 
            className='border border-white px-6 py-2 text-sm hover:bg-white text-white hover:text-black transition-all duration-500 mt-[10px]'
          >
            Book appointment
          </button>
        </div>
      </div>
    </div>
  )
}

export default Contact
