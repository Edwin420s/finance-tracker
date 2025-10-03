const express = require('express');
const multer = require('multer');
const {
  getCSVHeaders,
  importTransactions,
  getTemplates,
  downloadTemplate
} = require('../controllers/importController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

router.use(auth);

router.route('/headers')
  .post(upload.single('file'), getCSVHeaders);

router.route('/transactions')
  .post(upload.single('file'), importTransactions);

router.route('/templates')
  .get(getTemplates);

router.route('/template/:type')
  .get(downloadTemplate);

module.exports = router;