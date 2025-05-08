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

exports.authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }
        req.user = user; // Attach user info to request object
        next(); // Continue to route
    } catch (error) {
        res.status(401).json({ error: "Invalid token." });
    }
};