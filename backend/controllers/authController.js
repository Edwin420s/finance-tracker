const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, currency, timezone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      currency,
      timezone,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // 3) Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({ message: 'Account locked. Try again later.' });
    }

    // 4) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  // Since we are using JWT in memory (client side), we don't have a server-side session to destroy.
  // We can blacklist the token if needed, but for now, we just send a success response.
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

exports.refreshToken = (req, res) => {
  // This would involve checking a refresh token and issuing a new access token.
  // For now, we'll just return an error because we haven't implemented refresh tokens.
  res.status(501).json({ message: 'Refresh token not implemented' });
};

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: 'There is no user with that email address.' });
  }

  // 2) Generate the random reset token (we are not using crypto for now, but we should)
  // 3) Send it to user's email (we are not actually sending email for now)
  res.status(501).json({ message: 'Forgot password not implemented' });
};

exports.resetPassword = (req, res, next) => {
  res.status(501).json({ message: 'Reset password not implemented' });
};