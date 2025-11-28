import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import axios from "../config/axios";
import { setItemsByCity } from "../redux/user.slice";



function useGetItemsByCity() { 
    const dispatch = useDispatch();
     const { city } = useSelector((state) => state.user);
   

    const getItemsByCity = async () => { 
        useEffect(() => {
            
            const fetchItemsByCity = async () => {
                try {
                    const response = await axios.get(
                        `/api/item/get-item-by-city/${city}`, {
                            withCredentails: true,
                            
                    }
                    
                );
                    // console.log("Items by city data:", response.data)
                    dispatch(setItemsByCity(response.data))
                    
                }catch (error) {
                    console.error("Error fetching items by city:", error);
                }
            }
            fetchItemsByCity();

        },[city])
    }
    getItemsByCity();
}
export default useGetItemsByCity;


