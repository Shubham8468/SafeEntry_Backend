import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/user.model.js'
import transport from '../config/nodemailer.js'
//++++++++++++++++ For the User Rigistration +++++++++++++++++
export const register = async (req, resp) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return resp.status(404).json({ Success: false, Message: 'Missing data ' })
    }
    try {
        const existingUser = await userModel.findOne({ email });// check user are existing or not in MONGODB 
        if (existingUser) {
            return resp.json({ Success: false, Message: "User all Right Exists " })
        }
        const hashedPassword = await bcrypt.hash(password, 10);// these are bcrypt the user password
        // in case we do not do this password are save as its so security issus are cursornt 

        const user = new userModel({ name, email, password: hashedPassword });

        await user.save(); // here save user in DB 

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });//jwt.sign(payload, secretKey, options)
        //This line creates a JWT token that contains the user’s ID,
        //  is secured using a secret key, and is valid for 7 days.

        //++++++++++++++++ About Cookies ++++++++++++++++++++++++++
        //     What are Cookies? 🍪 (Plain English)

        // A cookie is a small piece of data that:
        // Server sends to the browser
        // Browser stores it
        // Browser sends it back to the server with every request
        // 👉 Think of cookies as a memory card for the website.
        // Example:
        // Login info
        // User preferences
        // JWT token
        // Session ID

        resp.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 1000
        });
        // sending Welcome message to User 
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to SafeEntry!',
            text: `Hi ${name},

Welcome to SafeEntry! 👋
Your account has been successfully created, and you’re now logged in.
With SafeEntry, your access is protected through a secure authentication system designed to keep your data safe and reliable.
If you have any questions or face any issues, feel free to reach out. We’re glad to have you on board!
Best regards,
SafeEntry Team`
        }
        await transport.sendMail(mailOption)

        return resp.status(200).json({ Message: "user Loggin Successfully and Rigister ", Success: true })


    } catch (err) {
        resp.json({ Success: false, Message: err.message })
    }

}


//+++++++++++++++++++++ User Logging +++++++++++++++++++++++++++++++++++

export const login = async (req, resp) => {
    const { email, password } = req.body;
    if (!email || !password) {
        resp.status(404).json({ Message: "Email and Password are required!!!", Success: false })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return resp.status(404).json({ Success: false, Message: "Invalid Email" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return resp.status(401).json({ Message: "Enter password is wrong " })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        resp.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: process.env.NODE_ENV ?
                'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return resp.status(200).json({ Message: "user loggin Successfully !!!", Success: true })


    } catch (err) {
        return resp.status(404).json({ Message: err.message, Success: false })
    }
}

export const logout = async (req, resp) => {
    try {
        resp.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV,
            'none': 'strict'
        })
        return resp.json({ Success: true, Message: 'Logged Out' })
    } catch (err) {
        return resp.status(500).json({ Message: err.message, Success: false })
    }

}


//Send verification OTP to the User's Email

export const sendVerificationOtp = async (req, resp) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return resp.status(200).json({ Message: "Account allready Verified ", Success: false })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Data.now() + 24 * 60 * 60 * 1000

        await user.save();// save all proparty

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify Your Email – SafeEntry OTP',
            text: `Hi ${user.name},

Welcome to SafeEntry 👋

To complete your registration, please verify your email address using the One-Time Password (OTP) below: ${otp}
This OTP is valid for the next ${verifyOtpExpireAt} minutes.
For your security, please do not share this code with anyone.

If you did not request this verification, you can safely ignore this email.

Thanks for choosing SafeEntry — we’re excited to have you onboard!

Best regards,
SafeEntry Team`
        }

        transport.sendMail(mailOption);

        resp.json({ Message: "Verification OPT Sent to Email", Success: true })


    } catch (err) {
        return resp.status(500).json({ Message: "Invalid OTP", Success: false })

    }
}


export const verifyEmail = async (req, resp) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return resp.status(500).json({ Message: 'Missing Details', Success: false })
    }
    try {
        const user= await userModel.findById(userId);

        if(!user){
            resp.json({Message:"User Not Found ", Success:false})
        }
        if(user.verifyOtp === '' || user.verifyOtp!==otp){
            return resp.json({Message:"Invalid OTP",Success:false});
        }
        if(user.verifyOtpExpireAt < Data.nom()){
            return resp.json({Message:"OTP Expired",Success:false})
        }

        user.isAccountVerified= true;
        user.verifyOtp ='';
        user.verifyOtpExpireAt=0;

        await user.save();

        return resp.json({Messag:"Email verify Successfully", Success:true})



        
    }catch(err){
        return resp.status(500).json({ Message: err.message, Success: false })
    }
}