import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { setMyOrders } from "../redux/user.slice";

const useGetMyOrder = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (!userData) return; // don't fetch before user is available

    const controller = new AbortController();

    const fetchMyOrders = async () => {
      try {
        const response = await axios.get(`/api/order/get-my-orders`, {
          withCredentials: true,
          signal: controller.signal,
        });

        // backend returns { orders: [...] }
        const orders = response?.data?.orders ?? [];
        console.log("My orders data:", orders);
        dispatch(setMyOrders(orders));
      } catch (error) {
        if (axios.isCancel?.(error) || error.name === "CanceledError") return;
        console.error("Error fetching my orders:", error);
        // clear orders on auth error so UI can react
        if (error?.response?.status === 401) {
          dispatch(setMyOrders([]));
        }
      }
    };

    fetchMyOrders();
    return () => controller.abort();
  }, [dispatch, userData]);
};

export default useGetMyOrder;
