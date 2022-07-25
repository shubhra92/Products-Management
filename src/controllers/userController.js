const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { isValid, isValidBody, validation, nameRegex, emailRegex, phoneRegex, passRegex } = require('../validations/validator')
const aws= require("aws-sdk")


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})


let uploadFile = async (file) => {
   return new Promise( function (resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }

    s3.upload( uploadParams, function (err, data) {
        if (err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

   })
}



const createUser = async function (req, res) {
    try {
        let data = req.body;
        if (!isValidBody(data)) return res.status(400).send({ status: false, message: "No data provided in the request body." })
        const { fname, lname, email, phone, password, address } = data;

        let arr = { fname, lname, email, phone, password, address };
        let keys = [...validation(arr)]
        if (keys.length > 0) return res.status(400).send({ status: false, message: `Enter the following mandatory fields: [${keys}]`});

        // console.log(data.address);
        data.address = JSON.parse(address);
        // console.log(data.address);
        if (!isValidBody(data.address)) return res.status(400).send({ status: false, message: "No data provided in address." })

        let { shipping, billing } = data.address;
        let addressArr = { shipping, billing };
        keys = [...validation(addressArr)]
        if (keys.length > 0) return res.status(400).send({ status: false, message: `Enter the following mandatory fields: [${keys}]`});

        {
            let { street, city, pincode } = shipping
            let shippingArr = { street, city, pincode };
            keys = [...validation(shippingArr)];
            if (keys.length > 0) return res.status(400).send({ status: false, message: `Enter the following mandatory fields: [${keys}] in shipping address.`});
        }

        {
            let { street, city, pincode } = billing
            let billingArr = { street, city, pincode };
            keys = [...validation(billingArr)];
            if (keys.length > 0) return res.status(400).send({ status: false, message: `Enter the following mandatory fields: [${keys}] in billing address.`});
        }

        let files = req.files
        if(!files || files.length === 0) return res.status(400).send({ status: false, message: "No profileImage found." })
        
        //upload to s3 and get the uploaded link
        data.profileImage = await uploadFile( files[0] )
        
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        data.password = hashedPass;

        const userCreated = await userModel.create(data);
        // console.log(userCreated);
        return res.status(201).send({ status: true, message: 'User created successfully', data: userCreated });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createUser }