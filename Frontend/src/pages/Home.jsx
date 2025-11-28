import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "../components/DeliveryBoy";

const Home = () => {
  const slice = useSelector((state) => state.user);

  const user = slice?.user ?? slice?.userData ?? slice?.userDate ?? null;

  return (
    <div className="w-screen h-screen flex  justify-center  bg-[#fff9f6]">
      {
        user?.role === "user" && <UserDashboard />
        //       : (
        // <h1 className="text-2xl font-medium">Welcome</h1>
        //   )
      }

      {user?.role === "owner" && <OwnerDashboard />}
      {user?.role === "foodDelivery" && <DeliveryBoy />}
    </div>
  );
};

export default Home;
