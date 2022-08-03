const { default: mongoose } = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");



const createCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let data = req.body;
        let { cartId, productId, quantity } = data;

        if (cartId && !mongoose.Types.ObjectId.isValid(cartId)) return res.status(400).send({ status: false, message: "Enter a valid cartId." });
        if (!productId || !mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Enter a valid productId." });

        let cart = await cartModel.findOne({ userId }).lean();
        const product = await productModel.findOne({ isDeleted: false, _id: productId }).lean();
        if (!product) return res.status(404).send({ status: false, message: "productId doesn't exist." });

        if (!quantity) quantity = 1;
        else {
            quantity = Number(quantity);
            if (quantity.toString() == 'NaN') return res.status(400).send({ status: false, message: "Enter a numeric value in quantity." });
            if (quantity == 0) return res.status(400).send({ status: false, message: "Minumum value of '1' unit should be provided in quantity." });
            if (quantity % 1 != 0) return res.status(400).send({ status: false, message: "Enter a whole number value in quantity." });
        }

        if (!cart) {
            if (cartId) return res.status(404).send({ status: false, message: "cartId doesn't exist." });

            const prodQuantity = { productId, quantity };
            const cartDoc = { userId: userId, items: prodQuantity, totalPrice: product.price * quantity, totalItems: 1 };

            await cartModel.create(cartDoc);
            const findCart = await cartModel.findOne({ userId }).populate('items.productId', 'title price productImage isFreeShipping');
            return res.status(201).send({ status: true, message: 'Cart created successfully', data: findCart });

        } else {
            if (cartId) {
                if (cart._id !== cartId) return res.status(404).send({ status: false, message: "cartId doesn't exist." });
            }

            let exist = false;
            for (let i = 0; i < cart.items.length; i++) {
                if (cart.items[i].productId == productId) {
                    exist = true;
                    cart.items[i].quantity += quantity;
                    break;
                }
            }
            if (!exist) cart.items.push({ productId, quantity });

            cart.totalPrice += product.price * quantity;
            cart.totalItems = cart.items.length;

            let cartUpdated = await cartModel.findOneAndUpdate(
                { userId },
                cart,
                { new: true }
            ).populate('items.productId', 'title price productImage isFreeShipping');

            return res.status(201).send({ status: true, message: 'Cart created successfully', data: cartUpdated });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        let data = req.body;
        const { cartId, productId, removeProduct } = data;

        if (cartId && !mongoose.Types.ObjectId.isValid(cartId)) return res.status(400).send({ status: false, message: "Enter a valid cartId." });
        if (!productId || !mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Enter a valid productId." });
        if (removeProduct != 0 && removeProduct != 1) return res.status(400).send({ status: false, message: "Enter either '0' or '1' in removeProduct." });

        let product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) return res.status(404).send({ status: false, message: "productId either doesn't exist or is deleted." });

        let cart = await cartModel.findOne({ userId }).lean();
        if (!cart) return res.status(404).send({ status: false, message: "cart doesn't exist for the user." });

        let exist = false;
        for (let i = 0; i < cart.items.length; i++) {
            if (cart.items[i].productId == productId) {
                exist = true;
                if (removeProduct == 1) {
                    if (cart.items[i].quantity == 1) {
                        cart.totalPrice -= product.price;
                        cart.totalItems -= 1;
                        cart.items.splice(i, 1);
                    } else {
                        cart.items[i].quantity -= 1;
                        cart.totalPrice -= product.price;
                    }
                } else {
                    cart.totalPrice -= product.price * cart.items[i].quantity;
                    cart.totalItems -= 1;
                    cart.items.splice(i, 1);
                }
                break;
            }
        }
        if (!exist) return res.status(404).send({ status: false, message: "productId doesn't exist in the cart." });

        let updatedCart = await cartModel.findOneAndUpdate(
            { userId },
            cart,
            { new: true }
        ).populate('items.productId', 'title price productImage isFreeShipping');

        if (!updatedCart.items.length) return res.status(200).send({ status: true, message: "Successfully updated. Your cart is now empty.🛒" });
        return res.status(200).send({ status: true, message: 'Cart successfully updated.', data: updatedCart });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const getCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        const cart = await cartModel.findOne({ userId }).populate('items.productId', 'title price productImage isFreeShipping');
        if (!cart) return res.status(400).send({ status: false, message: "Cart does not exist for this user." });
        if (!cart.items.length) return res.status(200).send({ status: true, message: "Your cart is empty.🛒" });
        return res.status(200).send({ status: true, message: "Success", data: { cart } });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const delCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        const cart = await cartModel.findOne({ userId });
        if (!cart) return res.status(404).send({ status: false, message: "The user's cart has not been created yet." });
        if (!cart.items.length) return res.status(400).send({ status: false, message: "The user's cart is already deleted." });
        await cartModel.findOneAndUpdate({userId}, {items: [], totalPrice: 0, totalItems: 0});
        return res.status(200).send({ status: true, message: "Cart successfully deleted." });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



module.exports = { createCart, updateCart, getCart, delCart };