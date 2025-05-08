const User = require('../models/User');
const {sendEmail} = require('../middleware/sendEmail');
const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
        const { username, email, password,role} = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        user = await User.create({username,email,password,role});
        const token = await user.getJwtToken();
        const cookieExpireDays = Number(process.env.COOKIE_EXPIRES_TIME);

        const options = {
            expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };
        res.cookie("token", token, options);
        res.status(201).json({ success: true, user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please enter email and password" });
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const token = await user.getJwtToken();
        const cookieExpireDays = Number(process.env.COOKIE_EXPIRES_TIME);

        const options = {
            expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.cookie("token", token, options);
        res.status(201).json({ success: true, user, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        res.cookie("token", null, {expires: new Date(Date.now()), httpOnly: true,});
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Please enter old and new password" });
        }
        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid old password" });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Admin view user details
exports.getAllUsers = async (req, res) => {
    try {
        const adminId = req.user.id;

        // Verify admin
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const users = await User.find({}, "-password"); // Exclude password for security
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const {username, email} = req.body;
        if (!username || !email) {
            return res.status(400).json({ success: false, message: "Please enter username and email" });
        }
        user.username = username;
        user.email = email;
        await user.save();
        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const user=await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({success:false,message:"User not found"});
        }
        const resetToken=await user.getResetPasswordToken();
        await user.save();
        const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
        const message=`Your password reset token is as follows:\n\n ${resetPasswordUrl}\n\nIf you have not requested this email, then ignore it.`;
        try {
            await sendEmail({
                email:user.email,
                subject:`Reset password`,
                message,
            });
            res.status(200).json({success:true,message:`Email sent to ${user.email} successfully`});
        } catch (error) {
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;
            await user.save();
            return res.status(500).json({success:false,message:error.message});
        }
    }catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({resetPasswordToken,  resetPasswordExpire: { $gt: Date.now()},});
        if (!user) {
            return res.status(401).json({success: false,message: "Token is invalid or has expired",});
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(200).json({success: true, message: "Password updated successfully", });
    } catch (error) {
        res.status(500).json({success: false, message: error.message,});
    }
};

// Verify admin
exports.deleteUser = async (req, res) => {
    try {
        const adminId = req.user.id;
        
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }

        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await user.deleteOne();

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
