import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/user.slice";

const useGetCurrentUser = () => {
    const dispatch = useDispatch();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await axios.get(`/api/user/get-user`, {
          withCredentials: true,
          timeout: 5000,
        });
          // console.log(result);
          const payload =
            result.data.user ?? result.data.userData ?? result.data;
          dispatch(setUserData(payload));
          
      } catch (err) {if (!err.response) {
        console.error("Cannot reach backend:", err.message || err);
      } else {
        console.error("Backend error:", err.response.status, err.response.data);
      }
      }
    };
    fetchUser();
  }, [dispatch]);
};

export default useGetCurrentUser;
