// ...existing code...
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    city:null
  },
  reducers: {
    // set user payload (canonical)
    // setUser(state, action) {
    //   state.user = action.payload ?? null;
    //   state.status = action.payload ? "succeeded" : "idle";
    //   state.error = null;
    // },

    // legacy alias for compatibility with older imports
    setUserData(state, action) {
      // state.user = action.payload ?? null;
      state.userData = action?.payload
      //   ? "succeeded" : "idle";
      // state.error = null;
    },
    setCity: (state, actions) => {
      state.city=actions?.payload
    },

    // reset to initial state
    clearUser() {
      return { ...initialState };
    },

    setError(state, action) {
      state.error = action?.payload ?? "Unknown error";
      state.status = "failed";
    },
  },
});

// selectors
export const selectCurrentUser = (state) => state.user?.user ?? null;
export const selectUserStatus = (state) => state.user?.status ?? "idle";
export const selectUserError = (state) => state.user?.error ?? null;

export const { setUser, setUserData, clearUser, setError,setCity } = userSlice.actions;
export default userSlice.reducer;
// ...existing code...
