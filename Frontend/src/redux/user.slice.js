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
    city: null,
    state: null,
    address: null,
    ShopByCity: null,
    itemsByCity: null,
    cartItems: [],
    totalAmount: 0,
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
      state.userData = action?.payload;
      //   ? "succeeded" : "idle";
      // state.error = null;
    },
    setCity: (state, actions) => {
      state.city = actions?.payload;
    },

    setState: (state, actions) => {
      state.state = actions?.payload;
    },
    setAddress: (state, actions) => {
      state.address = actions?.payload;
      // reset to initial state
    },
    setShopByCity: (state, actions) => {
      state.ShopByCity = actions?.payload;
    },
    setItemsByCity: (state, actions) => {
      state.itemsByCity = actions?.payload;
    },
    addToCart: (state, actions) => {
      const cartItem = actions?.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (Number(cartItem.quantity) === 0) {
        state.cartItems = state.cartItems.filter((i) => i.id != cartItem.id);
        return;
      }
      if (existingItem) {
        existingItem.quantity = cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }
      console.log(state.cartItems);
      state.totalAmount = state.cartItems.reduce((sum, i)=> sum + i.price * i.quantity,0) 
    },
   updateQuantity: (state, actions)=>{
     const { id, quantity } = actions.payload;
     const  item = state.cartItems.find((i) => i.id === id);

     if (item) {
       item.quantity = quantity;
     }
   
    if(item.quantity == 0 ){
      state.cartItems = state.cartItems.filter((i) => i.id !== id);
      return;
    }
    state.totalAmount = state.cartItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    ); 
   },
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

export const {
  setUser,
  setUserData,
  clearUser,
  setError,
  setCity,
  setState,
  setAddress,
  setShopByCity,
  setItemsByCity,
  updateQuantity,
  addToCart,
} = userSlice.actions;
export default userSlice.reducer;
// ...existing code...
