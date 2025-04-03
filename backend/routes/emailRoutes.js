const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/generate', emailController.generateEmail);
router.post("/get-unused-email", emailController.getUnusedEmail);
router.post("/fetch-messages", emailController.fetchMessages);

router.post("/put", emailController.adminEmailPut);


module.exports = router;
