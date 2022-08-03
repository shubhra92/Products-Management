const mongoose = require('mongoose');
const objectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({

    userId: { type: objectId, ref: 'User', required: true },
    items: [{
        _id: false,
        productId: { type: objectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    totalQuantity: { type: Number, required: true },
    cancellable: { type: Boolean, default: true },
    status: { type: String, default: 'pending' },
    deletedAt: Date, 
    isDeleted: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);