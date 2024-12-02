import React, { useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const AdminLayout = () => {

    const navigate = useNavigate()
    const { aToken } = useContext(AdminContext)

    useEffect(() => {
        if (!aToken) {
            navigate('/')
        }
    }, [aToken])

    return aToken && (
        <div className='flex'>
            <Sidebar />
            <div className='flex-1'>
                <Navbar />
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout
