import axios from "axios"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { setMyShopData } from "../redux/ownerSlice"


const useGetMyShop = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchShop = async () => {
            try {
               const result = await axios.get(`/api/user/get-user`, {
                 withCredentials: true,
                 timeout: 5000,
               });
                dispatch(setMyShopData(result?.data))

            }
            catch (err) {
                console.log(`Get shop error ${err}`)
            }
            
        }
        fetchShop()
    },[])
}
export default useGetMyShop;