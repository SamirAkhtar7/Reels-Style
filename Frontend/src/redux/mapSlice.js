
import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
  name: "map",
  initialState: {
    location: {
      latitude: null,
      longitude: null,
    },
    deliveryAddress: null,
  },
  reducers: {
    setLocation: (state, actions) => {
      const { latitude = null, longitude = null } = actions?.payload;
      state.location.latitude = latitude;
      state.location.longitude = longitude;
    },
    setDeliveryAddress: (state, actions) => {
      state.deliveryAddress = actions?.payload;
    },
  },
});


export const { setDeliveryAddress, setLocation } = mapSlice.actions;

export default mapSlice.reducer;