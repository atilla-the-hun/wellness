import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import SpecialityMenu from '../../components/SpecialityMenu'

const TreatmentsList = () => {
  const navigate = useNavigate()
  const { treatments, changeAvailability, getAllTreatments, deleteTreatment } = useContext(AdminContext)
  const [selectedSpeciality, setSelectedSpeciality] = useState(null)

  useEffect(() => {
    getAllTreatments()
  }, [])

  const filteredTreatments = selectedSpeciality
    ? treatments.filter(treatment => treatment.speciality === selectedSpeciality)
    : treatments

  if (!treatments.length) {
    return (
      <div className='m-5 flex justify-center items-center'>
        <p className='text-gray-600'>Loading treatments...</p>
      </div>
    )
  }

  return (
    <div className='p-5 h-[calc(100vh-64px)] overflow-y-auto'>
      <div className='flex justify-between items-center mb-5'>
        <h1 className='text-lg font-medium'>All Treatments</h1>
        <button 
          onClick={() => navigate('/admin/add-treatment')}
          className='bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-all duration-300'
        >
          Add Treatment
        </button>
      </div>

      {/* Speciality Menu */}
      <div className='mb-6 bg-gray-50 rounded-xl p-4'>
        <SpecialityMenu 
          onSpecialitySelect={setSelectedSpeciality}
          selectedSpeciality={selectedSpeciality}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredTreatments.map((item, index) => (
          <div 
            className='border border-[#C9D8FF] rounded-xl overflow-hidden cursor-pointer group bg-white' 
            key={index}
          >
            <div className='p-4'>
              <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
              <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm'>
                <input 
                  onChange={() => changeAvailability(item._id)} 
                  type="checkbox" 
                  checked={item.available}
                  className='cursor-pointer'
                />
                <p>Available</p>
              </div>
              <div className='mt-2 flex items-center gap-2'>
                <button 
                  onClick={() => navigate(`/admin/edit-treatment/${item._id}`)}
                  className='bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-all duration-300'
                >
                  Edit
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this treatment?')) {
                      deleteTreatment(item._id)
                    }
                  }}
                  className='bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-all duration-300'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTreatments.length === 0 && (
        <div className='text-center text-gray-500 mt-8'>
          No treatments found for this category
        </div>
      )}
    </div>
  )
}

export default TreatmentsList
