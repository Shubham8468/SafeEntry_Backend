import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/user.model.js'
import transport from '../config/nodemailer.js'

const isProductionRuntime = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: isProductionRuntime,
    sameSite: isProductionRuntime ? 'none' : 'strict',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
})
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

        resp.cookie('token', token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        // Send welcome email in background — do NOT await so response is immediate
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to SafeEntry!',
            text: `Hi ${name},

Welcome to SafeEntry! 👋
Your account has been successfully created, and you're now logged in.
With SafeEntry, your access is protected through a secure authentication system designed to keep your data safe and reliable.
If you have any questions or face any issues, feel free to reach out. We're glad to have you on board!
Best regards,
SafeEntry Team`
        }
        transport.sendMail(mailOption).catch(err => console.error('Welcome email error:', err.message))

        return resp.status(200).json({ Message: "user Loggin Successfully and Rigister ", Success: true })


    } catch (err) {
        resp.json({ Success: false, Message: err.message })
    }

}


//+++++++++++++++++++++ User Logging +++++++++++++++++++++++++++++++++++

export const login = async (req, resp) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return resp.status(404).json({ Message: "Email and Password are required!!!", Success: false })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return resp.status(404).json({ Success: false, Message: "Invalid Email" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return resp.status(401).json({ Success: false, Message: "Enter password is wrong" })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        resp.cookie('token', token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        return resp.status(200).json({ Message: "user loggin Successfully !!!", Success: true })


    } catch (err) {
        return resp.status(404).json({ Message: err.message, Success: false })
    }
}

export const logout = async (req, resp) => {
    try {
        resp.clearCookie('token', getCookieOptions())
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
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000

        await user.save();// save all proparty

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify Your Email – SafeEntry OTP',
            text: `Hi ${user.name},

Welcome to SafeEntry 👋

To complete your registration, please verify your email address using the One-Time Password (OTP) below: ${otp}
This OTP is valid for the next 24 hours.
For your security, please do not share this code with anyone.

If you did not request this verification, you can safely ignore this email.

Thanks for choosing SafeEntry — we’re excited to have you onboard!

Best regards,
SafeEntry Team`
        }

        await transport.sendMail(mailOption);

        resp.json({ Message: "Verification OPT Sent to Email", Success: true })


    } catch (err) {
        return resp.status(500).json({ Message: err.message, Success: false })

    }
}


export const verifyEmail = async (req, resp) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return resp.status(500).json({ Message: 'Missing Details', Success: false })
    }
    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return resp.json({ Message: "User Not Found ", Success: false })
        }
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return resp.json({ Message: "Invalid OTP", Success: false });
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return resp.json({ Message: "OTP Expired", Success: false })
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return resp.json({ Message: "Email verify Successfully", Success: true })




    } catch (err) {
        return resp.status(500).json({ Message: err.message, Success: false })
    }
}

// check user is Login or not 

export const isAuthenticated = async (req, resp) => {
    try {
        // we check user is login or not with the help of middelware
        return resp.json({ Success: true, Message:"Alrady loggden!!!" })
    } catch (err) {
        return resp.json({ Message: err.message, Success: false })
    }

}

// Send Password Reset OTP to user 

export const sendResetOtp = async (req, resp) => {
    const { email } = req.body;  // here i fatch email from the user req then i verify it 
    if (!email) {
        return resp.json({ Message: "Email id required", Success: false })
    }
    try {
        // here we find the user with the help of userEmail id
        const user = await userModel.findOne({ email })
        if (!user) {
            return resp.json({ Message: "User Not Found in DB", Success: false })
        };
        // NOw user email id in dataBase in case we jenarate otp and save it DB and send to user new Otp
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.respOtpExporeAt = Date.now() + 15 * 60 * 1000; // this only 15 
        await user.save(); // save all changes ..

        // Now send a email to user for the New Opt 
        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Your OTP to Reset Password',
            text: `Hello ${user.name},

We received a request to change the password for your account.

Your One-Time Password (OTP) is:

${otp}

This OTP is valid for 15 minutes only. Please do not share this code with anyone for security reasons.

If you did not request a password change, please ignore this email. Your account will remain safe.

For any help, feel free to contact us.

Best regards,
Team : SafeEntry
SupportEmai :${process.env.SENDER_EMAIL}`
        }
        transport.sendMail(mailOption); // call for the send mail function  nodemailer
        return resp.json({Message:"OTP sent to your email ",Success:true})

    } catch (err) {
        return resp.json({ Message: err.message, Success: false })
    }
}

//Reset user Pass
export const resetPassword = async (req,resp)=>{
    // for the resetPassword we get email , opt, resetPass from the user req
    const {email,otp,newPassword}=req.body;
    if(!email || !otp || !newPassword){
        return resp.json({Message:"All field are required!!!",Success:false});
    }
    try{    
        // Now we first find user with this email that are come from the req body
        const user = await userModel.findOne({email});
        if(!user){
            return resp.json({Message:"User Not Found",Success:false})
        }
        if(user.resetOtp === "" || user.resetOtp != otp){
            return resp.status(501).json({Message:"Invalid Otp",Success:false})
        }
        if(user.respOtpExporeAt < Date.now()){
            return resp.json({Message:"OTP Expired " ,Success:false})
        }
         // jo update password aa rha hai use bcrypt krna pdega
        const hashPassword= await bcrypt.hash(newPassword,10);
        user.password=hashPassword; // yha hm password ko reset kr rhe hai 
        // than i reset all opt 
        user.resetOtp=""
        user.respOtpExporeAt=0;


        await user.save(); // this for save all changes 

        return resp.status(200).json({Message:"Password Reset Successfully !!!!!",Success:true})




    }catch(err){
        return resp.json({Message:err.message,Success:false});
    }
}
