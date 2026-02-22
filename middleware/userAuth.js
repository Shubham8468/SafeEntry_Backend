import jwt from 'jsonwebtoken'
// This is user  for the add userId inside the req body becouse user not add userId ..
// so we use Middelware
const userAuth= async (req,resp,next)=>{
  const {token} = req.cookies;
  
  if(!token){
    return resp.json({Message:"Not Authorized..",Success:false})
  }
  try{
    const tokenDecode=jwt.verify(token,process.env.JWT_SECRET);// here we Decode token and find Id
    if(tokenDecode.id){
        if(!req.body) req.body = {};
        req.body.userId=tokenDecode.id // we add userId from the token inside the user (req)
    }else{
        return resp.json({Message:"Not Authorized Login Again",Success:false})
    }

    next(); // exicute the next  controller ....


  }catch(err){
    resp.json({Message:err.message,Success:false})
  }
}

export default userAuth;