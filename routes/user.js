const express = require('express');
const router = express.Router();

//login
router.get('/login', (req, res) => {
    res.render('user/login');
});


module.exports = router;