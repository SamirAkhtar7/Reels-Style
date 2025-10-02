import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setShopByCity } from "../redux/user.slice";



function useGetShopByCity() {
    const dispatch = useDispatch();
    const {city} = useSelector((state) => state.user);
    const getShopByCity = async () => {
        useEffect(() => {
            
            const fetchShopByCity = async () => {
                try {
                    const response = await axios.get(
                      `/api/shop/get-shop-by-city/${city}`,
                      {
                        withCredentials: true,
                      }
                    );
                    dispatch(setShopByCity(response.data))
                      //console.log("Shop by city data:", response.data);  
                } catch (error) {
                    console.error("Error fetching shop by city:", error);
                }
        
            }
            fetchShopByCity();
    
        }, [city])
        

    }
    getShopByCity();
}
export default useGetShopByCity;