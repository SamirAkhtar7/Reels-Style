// ...existing code...
import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FaPen } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const OwnerItemCard = ({ data, ...rest }) => {
  const navigator = useNavigate();
  // support either <OwnerItemCard data={item} /> or <OwnerItemCard {...item} />
  const item = data ?? rest;
  const {
    _id,
    name = "",
    image = "",
    category = "",
    foodType = "",
    price = 0,
  } = item || {};

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] hover:shadow-xl transition-shadow duration-300 w-full max-w-2xl">
      <div className="w-36 h-full flex flex-shrink-0 bg-gray-50">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between p-4 flex-1">
        <div>
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-gray-600">Category: {category}</p>
          <p className="text-gray-600">Food Type: {foodType}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-lg font-medium">Price: ₹{price}</div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={()=>navigator(`/edit-item/${_id}`)}
              aria-label="edit item"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaPen className="text-[#ff4d2d]" />
            </button>

            <button
              type="button"
              onClick={() => onDelete && onDelete(item)}
              aria-label="delete item"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <FaTrashAlt className="text-[#ff4d2d]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerItemCard;
// ...existing code...
