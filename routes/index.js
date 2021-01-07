const express = require('express');
const router = express.Router();
const notes = require('../models/notes');


router.use('/user', require('../routes/user'));
// index route
router.get('/', (req, res) => {
    res.render('main/index', { user: null });;
});

//without login
router.get('/proced', async (req, res) => {
    const note = await notes.find({});
    res.render('main/notes', { user: req.session.user, note: note, notes: req.session.note });
});

module.exports = router;

