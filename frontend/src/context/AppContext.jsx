import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const currencySymbol = 'R'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [treatments, setTreatments] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Format date function
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    // Getting Treatments using API
    const getTreatments = async () => {
        try {
            setIsLoading(true);
            const { data } = await axios.get(backendUrl + '/api/treatment/list')
            if (data.success) {
                console.log('Treatments loaded:', data.treatments);
                setTreatments(data.treatments)
            } else {
                console.error('Failed to load treatments:', data.message);
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error loading treatments:', error);
            toast.error(error.message)
        } finally {
            setIsLoading(false);
        }
    }

    // Getting User Profile using API
    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(
                backendUrl + '/api/user/get-profile', 
                { headers: { token } }
            )

            if (data.success) {
                setUserData(data.userData)
            } else {
                console.error('Failed to load user profile:', data.message);
                toast.error(data.message)
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getTreatments()
    }, [])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        treatments, 
        getTreatments,
        isLoading,
        currencySymbol,
        backendUrl,
        token, 
        setToken,
        userData, 
        setUserData, 
        loadUserProfileData,
        formatDate
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider
