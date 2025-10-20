import React, { useEffect ,useState} from "react";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DeliveryBoy = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);
  const [availableAssignments, setAvailableAssignments] = useState(null);
   

  const getAssignments = async () => {
    if (!userData) return; // wait until auth is ready
    try {
      const response = await axios.get("/api/order/get-assigned-orders", {
        withCredentials: true,
      });
      setAvailableAssignments(response.data);
      console.log("DeliveryBoy assignments:", response.data);
    } catch (err) {
      console.error(
        "Error in fetching assignments:",
        err?.response?.data ?? err.message
      );
      if (err?.response?.status === 401) navigate("/login");
    }
  };

  const acceptOrder = async (assignmentId) => { 
    try { 
      const response = await axios.get(`/api/order/accept-order/${assignmentId}`, {
        withCredentials: true,
      });
      console.log("Order accepted:", response.data);
      await getCurrentOrder();
    }
    catch (err) {
      console.error("Error in accepting order:", err);
    }
  }

  const getCurrentOrder = async () => {
    try { 
      const response = await axios.get(`/api/order/get-current-orders`, { withCredentials: true })
      console.log("Current Orders:", response.data);
      
    }
    catch (err) {
      console.error("Error in fetching current orders:", err);
    }
}



  useEffect(() => {
    getAssignments();
   getCurrentOrder(); 
     
  }, [userData]);

  return (
    <div>
      <Navbar />
      <div className="w-full flex items-center justify-center flex-col bg-gray-50 gap-2 overflow-y-auto mt-5">
        <div className="bg-white rounded-2xl text-center shadow-md p-5 flex flex-col justify-start items-center w-[80%] border border-orange-100">
          <h1 className="text-xl font-bold text-[#ff4d2d] ">
            Welcome, {userData?.fullName}
          </h1>
          <p className="text-[#ff4d2d] ">
            <span className="font-semibold"> latitude: </span>
            {userData?.location?.coordinates?.[1] ?? "N/A"},
            <span className="font-semibold"> longitude: </span>
            {userData?.location?.coordinates?.[0] ?? "N/A"}
          </p>
        </div>

        {/*  AvailableAssignments */}

        <div className="bg-white rounded-2xl p-5 shadow-md w-[80%] border border-orange-100 ">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            {" "}
            Availble Orders{" "}
          </h1>
          <div className="space-y-4">
            {availableAssignments && availableAssignments.length > 0 ? (
              availableAssignments.map((assignment, index) => (
                <div
                  className="border rounded-lg p-4 flex justify-between items-center "
                  key={index}
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {assignment?.shopName}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Delivery Address :</span>
                      {assignment?.deliveryAddress.text}
                    </p>
                    <p className="text-xs text-gray-400">
                      {assignment.items.length}
                      items | ₹{assignment?.subtotal}
                    </p>
                  </div>

                  <button
                    onClick={() => acceptOrder(assignment.assignmentId)}
                    className="bg-orange-500 text-white px-4 py-1 rounded-lg text-sm hover:bg-orange-600 "
                  >
                    Accept
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 ">
                No available orders at the moment.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryBoy;
