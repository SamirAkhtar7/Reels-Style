import { useSelector } from "react-redux"
import { useEffect } from "react"
import axios from "axios"




const useGetUpdateLocation = () => {
    const { userData } = useSelector((state) => state.user)   
    console.log("userData in useGetUpdateLocation:", userData);

    useEffect(() => {
        const updateLocation = async (latitude,longitude) => {
            const response = await axios.post(`/api/user/update-location`, {
                latitude,
                longitude
            }, { withCredentials: true })
            console.log("Location updated:", response.data);
        }

        navigator.geolocation.watchPosition((position) => {
            updateLocation(position.coords.latitude, position.coords.longitude);
            console.log("Watching position:",);

        })
        
        
    },[userData])

}

export default useGetUpdateLocation;