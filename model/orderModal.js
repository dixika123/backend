const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    orderNumber:{
        type: String,
        default: Math.floor(Math.random()*1000000)
    },

    cart: [
        {
            productName: {
                type: String,
            },
            productPrice: {
                tyoe: Number,
            },
            productCategory: {
                type: String,
            },
            productImage: {
                type: String,
            },
            productQuantity: {
                type: Number,
            },
        }
    ],
    totalAmount:{
        type: Number,
    },

    shippingAddress:{
        type: String,
    },

    status:{
        type: String,
        default: "Pending"
    },

    orderedDate:{
        type: Date,
        default: Date.now
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }

})
module.exports = mongoose.model("OrderModal",orderSchema)