import React,{useState} from 'react'
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';

const Shop = () => {
    const { shopId } = useParams();
    const [items, setItems] = useState([]);
    const [Shop, setShop] = useState([]);
    const handleShop = async () => {
        try { 
            const response = await axios.get(`/api/item/get-item-by-shop/${shopId}`, { withCredentials: true });
            console.log("Shop items:", response.data);
            setItems(response.data.items);
            setShop(response.data.shop);
        }
        catch (err) {
            console.error("Shop page error:", err); 
        }
    }

    useEffect(() => {
        handleShop();
    },[shopId]);

  return (
      <div className='min-h-screen bg-gray-100'>
         {} 
    </div>
  )
}

export default Shop