const express = require('express');
const router = express.Router();
const {register, login, logout, myProfile, updatePassword, updateProfile, forgotPassword, resetPassword, deleteUser}=require('../controllers/user');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/update/password').put(isAuthenticated,updatePassword); 
router.route('/update/profile').put(isAuthenticated,updateProfile);
router.route('/me').get(isAuthenticated,myProfile);
router.route('/forgot/password').post(forgotPassword); 
router.route('/password/reset/:token').put(resetPassword); 
router.delete("/user/:id", deleteUser);
module.exports = router;