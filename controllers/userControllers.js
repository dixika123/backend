const userModel = require('../model/userModel');

const router= require('express').Router();
const bcrypt = require('bcrypt');
const jwt= require('jsonwebtoken');
const nodemailer=require('nodemailer');

//task 1 login
//task 2 register
//task 3 get user profile

router.get('/test',(req,res) =>{
    res.send('Welcome to FlyBuy User API');
});

//register route

router.post('/register',async (req,res) =>{
     //get the data from the request body
    console.log(req.body);

    //destructuring the json data
    const{fname, lname, email, password}=req.body;
    //validations
    if(!fname || !lname || !email || !password){
        return res.status(400).send("Please fill all the fields");
    }
    
    try{
        //step 3- check if user already exists
        const existingUser= await userModel.findOne({email: email});
        if(existingUser){
            return res.status(400).send("User already exists");
        }
        //password hashing
        const salt=await bcrypt.genSalt(10);
        const hashPassword =await bcrypt.hash(password,salt);


        //step 4- save user to database
            const newUser= new userModel({
                fname: fname,
                lname: lname,
                email: email,
                password: hashPassword,
            });
            
            //save user
            await newUser.save();

        //send response
        res.status(400).send({message:"User registered successfully",
        user: newUser}); 
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error");
    }

    // res.send('Register API');

});

//login route
router.post('/login',async(req,res)=>{
    console.log(req.body);
    //destructuring the json data
    const{email,password}=req.body;
    // res.send("Login route");
    //validations
    if(!email || !password){
        return res.status(400).send("Please fill all the fields");
    }

    try {
        //find user
        const user= await userModel.findOne({email});
        if(!user){
            return res.status(400).json("User does not exist");
        }

        //compare password
        const isCorrectPassword = await bcrypt.compare(password,user.password);
        if(!isCorrectPassword){
            return res.status(400).json("Invalid credentials");
        }
        //generate token and send response
        const token =jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.cookie(
            "token",
            token,
            {
                httpOnly:true,
                expires: new Date(Date.now()+ 24*60*60*1000)
            }
        )
        res.status(200).send({
            message:"User logged in successfully",
            token: token,
            user:user
        });

    } catch (error) {
        res.status(500).send("Internal Server Error");
    }

})
//Forgot password
router.post('/forgot_password',async (req,res)=>{
    const {email}=req.body;
    if(!email){
        return res.status(400).send("Please enter email");
    }
   try {
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).send("User doesn't exits");
        }

        //creating a token
        const secret=process.env.JWT_SECRET+user.password;
        const token=jwt.sign({
            id: user._id,
            email:user.email
        },secret,{expiresIn:"1h"});

        const link=`http://localhost:5000/api/users/reset_password/${user._id}/${token}`;
        
        // send email using nodemailer
        const transporter=nodemailer.createTransport({
            service:'gmail',
            auth:{
                user: 'dixika1000@gmail.com',
                pass:'mgacmaxqjfzmrrvy'
            }
        });

        var mailOptions={
            from:'dixika1000@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: link 
        };

        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log('Email sent: ' + info.response);
            }
        });
        res.send("OK");

   } catch (error) {
        res.status(500).send("Internal server error");
   }
   
});
//for validating token and user link
router.get('/reset_password/:id/:token',async(req,res)=> {
    const {id,token}=req.params;
    if(!id || !token){
        return res.status(400).send("Fields cannot be empty");
    }
    const checkUser=await userModel.findOne({_id: id});
    if(!checkUser){
        return res.status(400).send("User does not exits");
    }

    const secret=process.env.JWT_SECRET +checkUser.password;
    try {
        const verifyToken=jwt.verify(token,secret);
        if(verifyToken){
            res.render('index',{email: verifyToken.email});
        }
    } catch (error) {
        res.send("Link expired");
    }

});

router.post('/reset_password/:id/:token',async(req,res)=> {
    const {id,token}=req.params;
    const{password}=req.body;
    if(!id || !token){
        return res.status(400).send("Fields cannot be empty");
    }
    const checkUser=await userModel.findOne({_id: id});
    if(!checkUser){
        return res.status(400).send("User does not exits");
    }

    const secret=process.env.JWT_SECRET +checkUser.password;
    try {
        jwt.verify(token,secret);
        const encryptedPassword= await bcrypt.hash(password,10);
        await userModel.updateOne(
            {_id:id},
            {
                set:{password: encryptedPassword}
            }
        )
       
        res.send("Password changed successfully");
    } catch (error) {
        res.send("Link expired");
    }

});

module.exports=router;