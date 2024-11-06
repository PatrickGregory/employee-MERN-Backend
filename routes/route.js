import express from "express";
import bcryptjs from "bcryptjs";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router()


router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
        return res.json('user already exists')
    }
    try {
        const hashpassword = await bcryptjs.hash(password, 10)

        const newUser = new User({
            username: username,
            email: email,
            password: hashpassword
        })
        await newUser.save()
        return res.json({ status: true, newUser, message: "record registered" })
    } catch (error) {
        return res.json({ message: "Registration failed. Try again" })
    }
})

router.post('/login', async (req, res) => {
    const {email, password } = req.body
    const user = await User.findOne({ email })
    if(!user){
        return res.json({ message: "user not registered"})
    }
    try {
        const validPassword = await bcryptjs.compare(password, user.password)
        if (!validPassword) {
            return res.json({ message: "password is invalid"})
        }

        // payload,key,options
        const token = jwt.sign({ username: user.username }, process.env.KEY, { expiresIn: "1h"})
        // store in user cookie
        res.cookie('token', token, { httpOnly: true, maxAge: 360000})
        return res.json({status: true, message: "login successful"})
    } catch (error) {
        return res.json({message:"Login not successful"})
    }
})

router.post('/forgot-password', async (req, res)=>{
    const {email} = req.body;
    try {
        const user = User.findOne({email})
        if (!user) {
            res.json({message:"user not registered"})
        }

        // send email
        const token = jwt.sign({ username: user._id }, process.env.KEY, { expiresIn: "1d"})

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'patrickgregoryekene@gmail.com',
              pass: 'vqfowwbtpnqnojrj'
            }
          });
          
          var mailOptions = {
            from: 'patrickgregoryekene@gmail.com',
            to: email,
            subject: 'Reset Password',
            text: `http://localhost:3000/reset-password/${token}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              return res.json({message: "Error sending email"})
            } else {
              return res.json({status:true, message:'Email Sent'})
            }
          }); 
    } catch (error) {
        console.log(err)
    }
}) 

router.post('/reset-password/:token', async (req,res) => {
    const {token} = req.params;
    const {password} = req.body;

    try {
        // verify token
        const decoded = await jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        // hash password
        const hashpassword = await bcryptjs.hash(password,10)
        await User.findByIdAndUpdate({_id:id}, {password:hashpassword})
        return res.json({status:true, message:"password successfully updated"})
    } catch (err) {
        return res.json({message:'invalid token'})
    }
})
export { router as UserRouter }