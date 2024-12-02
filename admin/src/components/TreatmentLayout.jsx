import React, { useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TreatmentContext } from '../context/TreatmentContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const TreatmentLayout = () => {

    const navigate = useNavigate()
    const { dToken } = useContext(TreatmentContext)

    useEffect(() => {
        if (!dToken) {
            navigate('/')
        }
    }, [dToken])

    return dToken && (
        <div className='flex'>
            <Sidebar />
            <div className='flex-1'>
                <Navbar />
                <Outlet />
            </div>
        </div>
    )
}

export default TreatmentLayout
