import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const RelatedTreatments = ({ speciality, docId }) => {

    const navigate = useNavigate()
    const { treatments } = useContext(AppContext)

    const [relDoc, setRelDoc] = useState([])

    useEffect(() => {
        if (treatments.length > 0 && speciality) {
            const treatmentsData = treatments.filter((doc) => doc.speciality === speciality && doc._id !== docId)
            setRelDoc(treatmentsData)
        }
    }, [treatments, speciality, docId])

    const handleTreatmentClick = (itemId) => {
        // Save current scroll position before navigating
        sessionStorage.setItem('treatmentsScrollPosition', window.pageYOffset.toString());
        navigate(`/appointment/${itemId}`);
        // Force scroll to top after a short delay to ensure navigation has completed
        setTimeout(() => window.scrollTo(0, 0), 100);
    };

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-white'>
            <h1 className='text-3xl font-medium'>Related Treatments</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted treatments.</p>
            <div className='w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {relDoc.map((item, index) => (
                    <div 
                        onClick={() => handleTreatmentClick(item._id)} 
                        className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500' 
                        key={index}
                    >
                        <img className='bg-[#EAEFFF]' src={item.image} alt="" />
                        <div className='p-4'>
                            <div className={`flex items-center gap-2 text-sm text-center ${item.available ? 'text-green-500' : "text-gray-500"}`}>
                                <p className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500' : "bg-gray-500"}`}></p><p>{item.available ? 'Available' : "Not Available"}</p>
                            </div>
                            <p className='text-white text-lg font-medium'>{item.name}</p>
                            <p className='text-white text-sm'>{item.speciality}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RelatedTreatments
