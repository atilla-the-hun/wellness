import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const navigate = useNavigate()
  const { backendUrl, token, setToken, setActiveMenu } = useContext(AppContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (state === 'Sign Up') {
        const { data } = await axios.post(backendUrl + '/api/user/register', { 
          name, 
          phone 
        })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Account created successfully!')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/login', { 
          name, 
          phone 
        })

        if (data.success) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
          toast.success('Logged in successfully!')
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      // Only show error toast if there's an actual error message
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      }
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-white text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        
        <div className='w-full'>
          <p>Full Name</p>
          <input 
            onChange={(e) => setName(e.target.value)} 
            value={name} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1 text-black' 
            type="text" 
            placeholder="Enter your name"
            required 
          />
        </div>

        <div className='w-full'>
          <p>Phone Number</p>
          <input 
            onChange={(e) => setPhone(e.target.value)} 
            value={phone} 
            className='border border-[#DADADA] rounded w-full p-2 mt-1 text-black' 
            type="tel"
            placeholder="Enter your phone number" 
            required 
          />
        </div>

        <button className='bg-primary text-white w-full py-2 my-2 rounded-md text-base'>
          {state === 'Sign Up' ? 'Create account' : 'Login'}
        </button>

        {state === 'Sign Up' ? (
          <p>Already have an account? <span 
            onClick={() => setState('Login')} 
            className='text-primary underline cursor-pointer'>
              Login here
            </span>
          </p>
        ) : (
          <p>Create a new account? <span 
            onClick={() => setState('Sign Up')} 
            className='text-primary underline cursor-pointer'>
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  )
}

export default Login
