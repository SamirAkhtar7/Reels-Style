import React from 'react'
import Navbar from './Navbar'
import { useSelector } from 'react-redux'
import { FaUtensils } from "react-icons/fa6";

const OwnerDashboard = () => {
  const myShopData = useSelector(state=> state.owner)
  return (
    <div>
      <Navbar />
      {/* {!myShopData.shopName &&} */}
      <div className='flex justify-center items-center p-4 sm:p-6'>
        <div className='w-full justify-center max-w-md bg-white shadow-xl rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300'>
          <div className='flex flex-col items-center text-center'>
            <FaUtensils  className='text-[#ff42d] w-16 sm:w-20 sm:h-20 mb-4'/>
            <h2 className='text-xl sm:text-2xl font-bole text-gray-800 mb-2 '>Add Your Restaurant</h2>
            <p className=' text-gray-600 mb-4 text-sm
            sm:text-base'>Join our food delivary platfrom and reach thousands of hungry coutomers every day. </p>
            <button className=' bg-[#ff4d2d] text-white px-5 sm:px-6 py2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200'>
              Get Started
            </button>
          </div>
</div>

      </div>

    </div>
  )
}

export default OwnerDashboard