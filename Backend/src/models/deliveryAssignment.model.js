
const mongoose = require("mongoose");

const deliveryAssignmentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        shop: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shop",
        },
        shopOrder: {
            type: mongoose.Schema.Types.ObjectId,

            required: true,
        },
        bordcastedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        status: {
            type: String,
            enum: ["BRODCASTED", "ASSIGNED", "COMPLETED"],
            default: "BRODCASTED",
        },
        assigendDeliveryBoy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            
        }


    },
        
 { timestamps: true })



const DeliveryAssignment = mongoose.model("DeliveryAssignment", deliveryAssignmentSchema);
module.exports = DeliveryAssignment; 