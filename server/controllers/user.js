const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { username, email, password} = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        user = await User.create({username,email,password,});
        const token = await user.getJwtToken();
        const cookieExpireDays = Number(process.env.COOKIE_EXPIRES_TIME) || 7;

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

