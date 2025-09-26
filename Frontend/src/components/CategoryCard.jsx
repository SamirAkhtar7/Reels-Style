import React from 'react'

const CategoryCard = ({data}) => {
  return (
    <div className=" relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] sm:w-[150px] sm:h-[150px] rounded-2xl border-2 border-[#ff4d2d] overflow-hidden bg-white flex items-center justify-center box-border shrink md:shrink-0 cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
          <img src={data.image} alt={data.category} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 ease-in-out" />
          
          <div className='absolute bottom-2 left-2 bg-[#ffffff96] bg-opacity-95 px-3 py-1  rounded-t-xl  text-sm  text-center font-medium text-gray-800 backdrop-blur md:text-base'>
              {data.category||data.name}
          </div>

    </div>
  );
}

export default CategoryCard