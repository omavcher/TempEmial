const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/generate-templates', aiController.GenerateTemplates);
router.post('/send-emails', aiController.SendEmails);


module.exports = router;