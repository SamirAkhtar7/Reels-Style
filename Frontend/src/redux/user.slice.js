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
    myOrders: [],
    searchItems: null,
    socket:null,
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
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },
    updateQuantity: (state, actions) => {
      const { id, quantity } = actions.payload;
      const item = state.cartItems.find((i) => i.id === id);

      if (item) {
        item.quantity = quantity;
      }

      if (item.quantity == 0) {
        state.cartItems = state.cartItems.filter((i) => i.id !== id);
        return;
      }
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
    },

    setMyOrders: (state, actions) => {
      state.myOrders = actions?.payload;
    },

    setSocket: (state, actions) => {
      state.socket = actions?.payload;
    },

    addMyOrder: (state, actions) => {
      const order = actions?.payload;
      if (!order) return;
      state.myOrders = [order, ...(state.myOrders || [])];
    },
    updateOrderStatus: (state, actions) => {
      const { orderId, shopId, status } = actions?.payload ?? {};
      if (!orderId || !shopId || typeof status === "undefined") return;

      // find the order in myOrders
      const order = (state.myOrders || []).find(
        (o) => String(o._id) === String(orderId)
      );
      if (!order) {
        console.warn("Order not found in state:", orderId);
        return;
      }

      // find the correct shopOrder entry (handle populated Shop object or plain id)
      const shopEntry = (order.shopOrder || []).find((s) => {
        const shopVal = s?.Shop?._id ?? s?.Shop ?? s?.shop ?? s?._id;
        return (
          String(shopVal) === String(shopId) || String(s._id) === String(shopId)
        );
      });

      if (!shopEntry) {
        console.warn("Shop entry not found in order:", { orderId, shopId });
        return;
      }

      // mutate via Immer proxy
      shopEntry.status = status;
      // if order only contains one shop block, reflect top-level status as well
      if (Array.isArray(order.shopOrder) && order.shopOrder.length === 1) {
        order.status = status;
      }
      console.log("Updated shopEntry status in state:", {
        orderId,
        shopId,
        status,
      });
    },
    setSearchItems: (state, actions) => {
      state.searchItems = actions?.payload;
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
  setUserData,
  clearUser,
  setError,
  setCity,
  setState,
  setAddress,
  setShopByCity,
  setItemsByCity,
  setMyOrders,
  updateQuantity,
  updateOrderStatus,
  addMyOrder,
  addToCart,
  setSearchItems,
  setSocket,
} = userSlice.actions;
export default userSlice.reducer;
// ...existing code...
