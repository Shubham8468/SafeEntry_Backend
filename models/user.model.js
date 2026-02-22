import mongoose from 'mongoose'

const userSchema= mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    verifyOtp:{ // for the otp perpose
    type:String,
    default:''
    },
    verifyOtpExpireAt:{ // for the expired otp timer
        type:Number,
        default:0
    },
    isAccountVerified:{
        type:Boolean,
        default:false
    },
    respOtp:{
        type:String, default:''
    },
    respOtpExporeAt:{
        type:Number,
        default:0
    }

})

const userModel=mongoose.models.user || mongoose.model('user',userSchema)
// This line checks if the user model already exists in Mongoose.
// If it exists, it reuses it; otherwise, it creates a new model.
// This prevents the OverwriteModelError in environments like Next.js.
export default userModel;