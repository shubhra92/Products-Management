const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
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
    const data = req.body;
    // const files = req.files;
    let files = req.files
    if(!files || files.length === 0) return res.status(400).send({ status: false, message: "No cover image found." })
    
    //upload to s3 and get the uploaded link
    data.profileImage = await uploadFile( files[0] )
    const { fname, lname, email, profileImage, phone, password, address } = data;

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    data.password = hashedPass;

    const userCreated = await userModel.create(data);
    return res.status(201).send({ status: true, message: 'User created successfully', data: userCreated });
}

module.exports = { createUser }