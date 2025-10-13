import React from 'react'
import Navbar from './Navbar'
import { useSelector } from 'react-redux' 

const DeliveryBoy = () => {
  const userData = useSelector(state => state?.user?.userData)
  console.log("DeliveryBoy userData:", userData);
  return (
    <div>
      <Navbar />
      <div className="w-screen h-[80vw] flex items-center justify-center bg-gray-50 gap-2 overflow-y-auto">
        <div className="bg-white rounded-2xl text-center shadow-md p-5 flex flex-col  justify-start items-center w-[90%]  border border-orange-100">
          <h1 className="text-xl font-bold text-[#ff4d2d] ">
            Welcome, {userData?.fullName}
          </h1>
          <p className=" text-[#ff4d2d] ">
            <span className="font-semibold"> latitude: </span>
            {userData.location.coordinates[0]},
            <span className="font-semibold"> longitude: </span>
            {userData.location.coordinates[1]}
          </p>
        </div>

        
      </div>
    </div>
  );
}

export default DeliveryBoy