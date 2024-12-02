import React from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10  mt-40 text-sm'>

        <div>
          <img className='mb-5 w-40' src={assets.logo} alt="" />
          <p className='w-full md:w-2/3 text-white leading-6'>Wellness & Aesthetics is your coastal sanctuary for beauty and relaxation on Southbroom's breathtaking shores. Our skilled team is dedicated to enhancing your natural beauty with personalized care in a serene, oceanfront setting.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5 text-white'>COMPANY</p>
          <ul className='flex flex-col gap-2 text-white'>
            <NavLink to='/' >
              <li>Home</li>
            </NavLink>
            <NavLink to='/about' >
              <li>About</li>
            </NavLink>
            <NavLink to='/treatments' >
              <li>All Treatments</li>
            </NavLink>
            <NavLink to='/contact' >
              <li>Contact</li>
            </NavLink>
            <a href="http://localhost:5174" target="_blank" rel="noopener noreferrer">
              <li>Admin</li>
            </a>
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5 text-white">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-white">
            <li>
              <a href="tel:0774705140">077 470 5140</a>
            </li>
            <li>
              <a href="mailto:contact@bestcareconsulting.com">contact@bestcareconsulting.com</a>
            </li>
          </ul>
        </div>

      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center text-white'>Copyright 2024 Wellness & Aesthetics - All Rights Reserved.</p>
      </div>

    </div>
  )
}

export default Footer
