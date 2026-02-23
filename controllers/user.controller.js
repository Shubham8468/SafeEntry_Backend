import userModel from '../models/user.model.js'
export const getUserData = async (req,resp)=>{
    try{
        // get user from the Middelware
         const {userId} = req.body;
         const user = await userModel.findById(userId);
         if(!user){
            return resp.status(501).json({Message:"User Not Found",Success:false})
         }
         resp.json({Message:"User Fatch Successfully !!",Success:true,userData:{
            name:user.name,
            isAccountVerified:user.isAccountVerified
         }})

    }catch(err){
        resp.json({Message:err.message,Success:false})
    }
}