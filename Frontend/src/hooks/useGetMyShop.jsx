import axios from "../config/axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setMyShopData } from "../redux/ownerSlice";

const useGetMyShop = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchShop = async () => {
      try {
        // use relative path so Vite proxy (or same-origin) is used in dev and avoids CORS
           const result = await axios.get(`/api/shop/get-shop`);
       // console.log("Fetched shop data:", result?.data);
        dispatch(setMyShopData(result?.data));

        
       // console.log("Fetched shop data:", result?.data);
        dispatch(setMyShopData(result?.data));

      } catch (err) {
        console.log(`Get shop error ${err}`);
      }
    };
    fetchShop();
  }, [dispatch]);
};
export default useGetMyShop;
