const User=require('../models/User');
const jwt=require('jsonwebtoken');
exports.isAuthenticated=async (req,res,next)=>{
    try{
        const token=req.cookies.token;
        //console.log(token);
        if(!token){
            return res.status(401).json({success:false,message:"Login first to access this resource"});
        }
        const decodedData=jwt.verify(token,process.env.JWT_SECRET);
        req.user=await User.findById(decodedData.id);
        next();
    }catch(error){
        return res.status(500).json({success:false,message:error.message});
    }
}
