import mongoose from 'mongoose'

const connectDB= async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/mern-auth`).then(()=>{
            console.log("DB connection successfully !!!!")

        })
    }catch(err){
        console.log(`DB not Connected ${err}`)
    }
}
export default connectDB;