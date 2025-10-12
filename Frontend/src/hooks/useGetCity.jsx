import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setAddress, setState } from "../redux/user.slice";
import { setLocation , setDeliveryAddress} from "../redux/mapSlice";


function useGetCity() {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.user.userData)
    // console.log("userData in useGetCity:", userData);
    useEffect(() => {


    

        navigator.geolocation.getCurrentPosition(async(position) => {
            // console.log(position);
            const { latitude, longitude } = position.coords;
            dispatch(setLocation({ latitude, longitude }))

            // console.log("Latitude:", latitude, "Longitude:", longitude);
                //    const latitude = 27.0253032;
                //    const longitude = 75.8926484;
            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${import.meta.env.VITE_GEOAPIKEY}`)
            // console.log("City Data:", result?.data);
            const cityName =
              result.data.features[0].properties.city ||
              result.data.features[0].properties.county;       
            const address = `${result?.data?.features[0].properties.address_line1}, ${
              result?.data?.features[0].properties.address_line2}`

            dispatch({ type: "user/setCity", payload: cityName })
            dispatch(setState(result?.data?.features[0].properties.state))
         
            dispatch(setAddress(address))
            dispatch(setDeliveryAddress(address))

        })

    },[userData])
}

export default useGetCity