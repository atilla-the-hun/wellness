import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TopTreatments = () => {
    const navigate = useNavigate();
    const { treatments } = useContext(AppContext);

    const handleTreatmentClick = (itemId) => {
        // Save current scroll position before navigating
        sessionStorage.setItem('treatmentsScrollPosition', window.pageYOffset.toString());
        navigate(`/appointment/${itemId}`);
        // Force scroll to top after a short delay to ensure navigation has completed
        setTimeout(() => window.scrollTo(0, 0), 100);
    };

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-[#262626] md:mx-10'>
            <div className='mt-[5px] md:mt-[10px]'></div> {/* Empty space above on mobile */}
            <h1 className='text-3xl font-medium text-white'>Top Treatments to Book</h1>
            <p className='sm:w-1/3 text-center text-sm text-white'>Our top featured treatments.</p>
            <div className='w-full grid grid-cols-1 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {treatments.slice(0, 3).map((item, index) => (
                    <div 
                        onClick={() => handleTreatmentClick(item._id)} 
                        className='border border-[#ADADAD] rounded-lg p-8 py-7 bg-white cursor-pointer hover:translate-y-[-10px] transition-all duration-500' 
                        key={index}
                    >
                        {/* ----- Doc Info : name, degree, experience ----- */}
                        <p className='flex items-center gap-2 text-xl font-medium text-gray-700'>{item.name} <img className='w-5' src={item.verified_icon} alt="" /></p>
                        <div className='flex items-center gap-2 mt-1 text-gray-600'>
                            <p>{item.degree} - {item.speciality}</p>
                        </div>

                        {/* ----- Doc About ----- */}
                        <div>
                            <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>About <img className='w-3' src={item.info_icon} alt="" /></p>
                            <p className='text-sm text-gray-600 mt-1'>{item.about}</p>
                        </div>

                        {/* ----- Treatment Options ----- */}
                        <div className="mt-4">
                            <p className="text-gray-600 font-medium mb-2">Treatment Options:</p>
                            <div className="flex flex-wrap gap-2">
                                {item.time_slots && item.time_slots.map((slot, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-gray-50 px-3 py-1 rounded border border-gray-200"
                                    >
                                        <span className="text-gray-700">{slot.duration} minutes</span>
                                        <span className="text-gray-600 ml-2">
                                                R{slot.price}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button 
                onClick={() => { 
                    sessionStorage.setItem('treatmentsScrollPosition', '0'); // Start at top when viewing all treatments
                    navigate('/treatments'); 
                }} 
                className='bg-[#EAEFFF] text-gray-600 px-12 py-3 rounded-full mt-10'
            >
                more
            </button>
        </div>
    );
};

export default TopTreatments;
