import axios from 'axios';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const TrackOrderPage = () => {
    const { orderId } = useParams();

    const handleGetOrder = async() => {
        try {
            const response = await axios.get(`/api/order/get-order-by-id/${orderId}`, { withCredentials: true });
            console.log("Order details:", response.data);
         }
        catch (err) {
            return console.error(err);
        }
    }
    useEffect(() => {
        handleGetOrder();
    },[orderId])

  return (
      <div>
          
    </div>
  )
}

export default TrackOrderPage