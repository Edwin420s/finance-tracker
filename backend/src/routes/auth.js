const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', auth, logout);
router.get('/me', auth, getMe);
router.put('/updatedetails', auth, updateDetails);
router.put('/updatepassword', auth, updatePassword);

module.exports = router;