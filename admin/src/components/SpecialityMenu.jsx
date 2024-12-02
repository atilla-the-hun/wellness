import React from 'react'
import { specialityData } from '../../../frontend/src/assets/assets'

const SpecialityMenu = ({ onSpecialitySelect, selectedSpeciality }) => {
    return (
        <div className='flex flex-col items-start gap-4 py-8 text-[#262626]'>
            <h1 className='text-l font-medium'>Filter by Treatment Type</h1>
            <div className='flex flex-wrap justify-start gap-4 pt-5 w-full md:flex-nowrap md:overflow-x-auto'>
                {specialityData.map((item, index) => (
                    <div
                        onClick={() => onSpecialitySelect(selectedSpeciality === item.speciality ? null : item.speciality)}
                        className={`flex flex-col items-center text-[13px] cursor-pointer flex-shrink-0 hover:translate-y-[-5px] transition-all duration-300 p-4 rounded-lg ${
                            selectedSpeciality === item.speciality ? 'bg-primary text-white' : 'bg-white'
                        }`}
                        key={index}
                    >
                        <img className='w-12 mb-2' src={item.image} alt={item.speciality} />
                        <p>{item.speciality}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SpecialityMenu
