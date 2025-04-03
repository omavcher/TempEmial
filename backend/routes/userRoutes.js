const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/google', userController.GoogleAuth);



module.exports = router;