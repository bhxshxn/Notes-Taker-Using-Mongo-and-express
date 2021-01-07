const express = require('express');
const router = express.Router();


router.use('/user', require('../routes/user'));
// index route
router.get('/', (req, res) => {
    res.render('main/index', { user: null });;
});

//without login
router.get('/proced', (req, res) => {
    res.render('main/notes', { user: null });
});

module.exports = router;

