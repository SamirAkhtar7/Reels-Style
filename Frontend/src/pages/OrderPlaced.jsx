import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const OrderPlaced = () => {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'
      >
          <FaCheckCircle className='text-green-500 text-6xl mb-4' />
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed Successfully!</h1>
          <p className='text-gray-600 mb-6'>Thank you for your order. Your delicious food is being prepared and will be with you shortly.</p>
          <Link to='/' className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e04324] transition duration-300'>Back to Home</Link>
          <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white opacity-50 pointer-events-none'></div>

    </div>
  )
}

export default OrderPlaced