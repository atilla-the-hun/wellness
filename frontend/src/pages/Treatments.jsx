import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';

const Treatments = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [activeButton, setActiveButton] = useState('All Treatments'); // State to track active button
  const navigate = useNavigate();

  const { treatments, currencySymbol } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(treatments.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(treatments);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [treatments, speciality]);

  useEffect(() => {
    // Set the active button based on the current route
    if (speciality) {
      setActiveButton(speciality);
    } else {
      setActiveButton('All Treatments');
    }

    // Restore scroll position when navigating back
    const savedScrollPosition = sessionStorage.getItem('treatmentsScrollPosition');
    if (savedScrollPosition !== null) {
      window.scrollTo(0, parseInt(savedScrollPosition));
      sessionStorage.removeItem('treatmentsScrollPosition');
    }
  }, [speciality]);

  const handleButtonClick = (label, path) => {
    setActiveButton(label);
    navigate(path);
  };

  const handleTreatmentClick = (itemId) => {
    // Save current scroll position before navigating
    sessionStorage.setItem('treatmentsScrollPosition', window.pageYOffset.toString());
    navigate(`/appointment/${itemId}`);
    // Force scroll to top after a short delay to ensure navigation has completed
    setTimeout(() => window.scrollTo(0, 0), 100);
  };

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-white md:mx-10 overflow-x-hidden">
      <h1 className="text-3xl font-medium">Browse Treatments</h1>
      <p className="sm:w-1/2 text-center text-sm">
        Simply browse through our extensive list of trusted treatments.
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? 'bg-primary text-white' : ''
          }`}
        >
          Filters
        </button>
        <div
          style={{ marginTop: '20px' }}
          className={`flex-col gap-4 text-sm text-white ${
            showFilter ? 'flex' : 'hidden sm:flex'
          }`}
        >
          <p
            onClick={() => handleButtonClick('All Treatments', '/treatments')}
            className={`w-[94vw] sm:w-[180px] pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              activeButton === 'All Treatments' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            All Treatments
          </p>
          <p
            onClick={() => handleButtonClick('Nails', '/treatments/Nails')}
            className={`w-[94vw] sm:w-[180px] pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              activeButton === 'Nails' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            Nails
          </p>
          <p
            onClick={() => handleButtonClick('Facial', '/treatments/Facial')}
            className={`w-[94vw] sm:w-[180px] pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              activeButton === 'Facial' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            Facial
          </p>
          <p
            onClick={() => handleButtonClick('Massage', '/treatments/Massage')}
            className={`w-[94vw] sm:w-[180px] pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              activeButton === 'Massage' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            Massage
          </p>
          <p
            onClick={() => handleButtonClick('Waxing', '/treatments/Waxing')}
            className={`w-[94vw] sm:w-[180px] pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${
              activeButton === 'Waxing' ? 'bg-[#E2E5FF] text-black' : ''
            }`}
          >
            Waxing
          </p>
        </div>
        <div className="w-full grid grid-cols-1 gap-4 pt-5 gap-y-6 px-3 sm:px-0">
          {filterDoc.length > 0 ? (
            filterDoc.map((item, index) => (
              <div
                onClick={() => handleTreatmentClick(item._id)}
                className="border border-[#ADADAD] rounded-lg p-8 py-7 bg-white cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
                key={index}
              >
                {/* ----- Doc Info : name, degree, experience ----- */}
                <p className="flex items-center gap-2 text-xl font-medium text-gray-700">
                  {item.name} <img className="w-5" src={item.verified_icon} alt="" />
                </p>
                <div className="flex items-center gap-2 mt-1 text-gray-600">
                  <p>{item.speciality}</p>
                </div>

                {/* ----- Doc About ----- */}
                <div>
                  <p className="flex items-center gap-1 text-sm font-medium text-[#262626] mt-3 pr-[1000px]">
                    About
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{item.about}</p>
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
                          {currencySymbol}{slot.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-[#ADADAD] rounded-lg p-[400px] py-7 bg-white">
              <p className="text-center text-gray-600 w-[300px] -ml-[100px]">No treatments available for this category.</p>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="bg-[#EAEFFF] text-gray-600 px-12 py-3 rounded-full mt-10"
      >
        Scroll To The Top
      </button>
    </div>
  );
};

export default Treatments;
