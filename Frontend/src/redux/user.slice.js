
import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {
        userDate:null
    },
    reducers: {
        setUserData: (state, action) => {
            state.userDate = action.payload

        }
    }
})

export const { setUserData } = userSlice.actions
export default userSlice.reducer