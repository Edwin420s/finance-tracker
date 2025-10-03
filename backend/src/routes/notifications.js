const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Placeholder for future notification routes
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      notifications: []
    }
  });
});

module.exports = router;