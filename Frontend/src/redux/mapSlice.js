
import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name: "map",
    initialState: 
    {
        location:{
            latitude: null,
            longitude: null,
        },
        daddress: null,
    },
    reducers: {
        setLocation: (state, actions) => {
           const { latitude = null, longitude = null } = actions?.payload;
       state.location.latitude = latitude;
    state.location.longitude = longitude;     
           },
    setDAddress: (state, actions) => {
        state.address = actions?.payload;
           }
        
    }
})

export const {setDAddress,setLocation}=mapSlice.actions;

export default mapSlice.reducer;