const mongoose = require('mongoose');
const productModel = require('../models/productModel');
const { isValidBody, validation, numberRegex, isValid } = require('../validations/validator');
const { uploadFile } = require('./userController');



const createProduct = async function (req, res) {
    try {
        let data = req.body;
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "No data provided in the request body." });
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;

        const mandatoryFields = { title, description, price, availableSizes };
        let keys = [...validation(mandatoryFields)];
        if (keys.length > 0) return res.status(400).send({ status: false, message: `Enter the following mandatory fields: [${keys}]` });

        let files = req.files;
        if (!files || files.length === 0) return res.status(400).send({ status: false, message: "No productImage provided." });

        data.title = title.split(' ').map(x => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(' ');
        let titlePresent = await productModel.findOne({ title: data.title });
        if (titlePresent) return res.status(400).send({ status: false, message: "title is not unique." });

        if (!numberRegex.test(price.trim())) return res.status(400).send({ status: false, message: "price should be numeric only." });
        if (isValid(currencyId)) {
            if (currencyId.trim().toUpperCase() !== 'INR') return res.status(400).send({ status: false, message: "currencyId should be 'INR' only." });
        }
        if (isValid(currencyFormat)) {
            if (currencyFormat.trim() !== '₹') return res.status(400).send({ status: false, message: "currencyFormat should be '₹' only." });
        }
        if (Object.keys(data).includes('installments')) {
            if (!isValid(installments)) return res.status(400).send({ status: false, message: "Provide data in installments." });
            if (!numberRegex.test(installments.trim())) return res.status(400).send({ status: false, message: "installments should be numeric only." });

        }
        if (Object.keys(data).includes('style')) {
            if (!isValid(style)) return res.status(400).send({ status: false, message: "Provide data in style." })
        }

        let enumerated = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'];
        let withoutSpaceSizes = [];
        availableSizes.trim().split(',').map(x => x.trim()).forEach(x => { if (isValid(x)) withoutSpaceSizes.push(x) });
        data.availableSizes = [...withoutSpaceSizes].map(x => x.toUpperCase());

        let wrongSizes = [];
        for (let size of data.availableSizes) {
            if (!enumerated.includes(size)) wrongSizes.push(size);
        }
        if (wrongSizes.length > 0) return res.status(400).send({ status: false, message: `${wrongSizes} sizes not included in [${enumerated}].` })

        if (isFreeShipping) data.isFreeShipping = isFreeShipping.trim() === 'true' ? true : false;

        data.productImage = await uploadFile(files[0]);
        data.currencyId = 'INR';
        data.currencyFormat = '₹';
        data.isDeleted = false;
        data.deletedAt = null;

        const productCreated = await productModel.create(data);
        return res.status(201).send({ status: true, message: 'Product created successfully', data: productCreated });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const getByFilters = async function (req, res) {
    try {
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query;

        let filter = {}
        if (name) filter.title = new RegExp(name, 'i');
        if (size) filter.availableSizes = size.toUpperCase();
        if (priceGreaterThan || priceLessThan) filter.price = { $gt: Number(priceGreaterThan) || 0, $lt: Number(priceLessThan) || Infinity };

        let products = await productModel.find({ isDeleted: false, ...filter });
        if (!products.length) return res.status(404).send({ status: false, message: "No product found." });
    
        if (priceSort == -1) products.sort((a, b) => b.price - a.price);
        else if (priceSort == 1) products.sort((a, b) => a.price - b.price);

        return res.status(200).send({ status: true, message: 'Success', data: products });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Enter a valid productId." });
        let product = await productModel.findOne({ isDeleted: false, _id: productId });
        if (!product) return res.status(404).send({ status: false, message: "No product found by this productId." })
        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const updateProductById = async function (req, res) {
    try {
        let productId = req.params.productId;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Enter a valid productId." });
        
        let data = req.body;
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "No data provided in request body to update." });

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;

        
        function validKeysToUpdate (obj) {
            let arr = [];
            let arr2 = ['title', 'description', 'price', 'currencyId', 'currencyFormat', 'isFreeShipping', 'style', 'availableSizes', 'installments'];
            let regex = { price: numberRegex, installments: numberRegex, currencyId: /^([Ii]\1+[Nn]\1+[Rr]\1)+$/, currencyFormat: /^[₹]+$/ };

            let msgs = { price: "price should be numeric only.", installments: "installments should be numeric only.", currencyId: "currencyId should be 'INR' only.", currencyFormat: "currencyFormat should be '₹' only." }
            
            for (let i of arr2) {
                if (Object.keys(obj).includes(i)) {
                    if (!isValid(obj[i])) arr.push(i);
                    else if (regex[i] && !regex[i].test(obj[i].trim())) return { status: false, message: msgs[i]};
                }
            }
            if (arr.length > 0) return { status: false, message: `Provide data in ${arr}` };
        }
        
        let x = validKeysToUpdate(data);
        if (x) return res.status(400).send(x);
        
        if (title) {
            const title = await productModel.findOne({ title: title });
            if (title) return res.status(400).send({ status: false, message: "title is not unique." });
        }
        if (isFreeShipping) {
            if (isFreeShipping.trim().toLowerCase() == 'true') data.isFreeShipping = true;
            else if (isFreeShipping.trim().toLowerCase() == 'false') data.isFreeShipping = false;
            else return res.status(400).send({ status: false, message: "Provide either 'true' or 'false' for isFreeShipping." });
        }
        
        if (availableSizes) {
            let enumerated = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'];
            let withoutSpaceSizes = [];
            availableSizes.trim().split(',').map(x => x.trim()).forEach(x => { if (isValid(x)) withoutSpaceSizes.push(x) });
            data.availableSizes = [...withoutSpaceSizes].map(x => x.toUpperCase());

            let wrongSizes = [];
            for (let size of data.availableSizes) {
                if (!enumerated.includes(size)) wrongSizes.push(size);
            }
            if (wrongSizes.length > 0) return res.status(400).send({ status: false, message: `${wrongSizes} sizes not included in [${enumerated}].` })
        }

        let files = req.files;
        if (files && files.length > 0) data.productImage = await uploadFile(files[0]);
        
        let updatedProduct = await productModel.findOneAndUpdate(
            { isDeleted: false, _id: productId },
            data,
            {new: true}
        )

        if (!updatedProduct) return res.status(404).send({ status: false, message: "No product found by this productId to update." })
        return res.status(200).send({ status: true, message: 'Product updated successfully', data: updatedProduct });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



const delProductById = async function (req, res) {
    try {
        let productId = req.params.productId;
        if (!productId || !mongoose.Types.ObjectId.isValid(productId)) return res.status(400).send({ status: false, message: "Enter a valid productId." });
        
        let product = await productModel.findOneAndUpdate(
            { _id: productId, isDeleted: false },
            { isDeleted: true, deletedAt: Date.now() }
        )

        if (!product) return res.status(404).send({ status: false, message: "No product found by this productId to delete." })
        return res.status(200).send({ status: true, message: 'Product deleted successfully.' });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}



module.exports = { createProduct, getByFilters, getProductById, updateProductById, delProductById };