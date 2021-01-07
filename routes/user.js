const express = require('express');
const router = express.Router();
const notes = require('../models/notes');
const authenticateUser = require('../middlewares/authenticateUser');
const User = require('../models/user');
const bcrypt = require('bcrypt');

//login
router.get('/login', (req, res) => {
    res.render('user/login', { user: null, msg: null });
});

//register
router.get('/register', (req, res) => {
    res.render('user/register', { user: null, msg: null });
});

//delete
router.get('/delete/:id', async (req, res) => {
    var id = req.params.id;
    await notes.findByIdAndDelete({ _id: id });
    res.redirect('back')
});

//note save
router.post('/save', (req, res) => {
    if (req.session.user) {
        const { title, note } = req.body;
        const latestNote = new notes({
            title, note, user: req.session.user
        });
        latestNote.save();
        res.redirect('back');
    } else {
        const { title, note } = req.body;
        if (req.session.note) {
            const item = { title: req.body.title, note: req.body.note }
            req.session.note.push(item);
            res.redirect('back');
        } else {
            req.session.note = [];
            const item = { title: req.body.title, note: req.body.note }
            req.session.note.push(item);
            res.redirect('back');
        }
    }
});

//post for register
router.post("/register", async (req, res) => {
    const { email, password, username } = req.body;
    // check for missing filds
    if (!email || !password || !username) {
        res.render('user/register', { user: req.session.user, msg: "Please enter all the fields" })
        return;
    };
    var user = username.charAt(0).toUpperCase() + username.slice(1);

    const doesUserExitsAlreay = await User.findOne({ email });
    if (doesUserExitsAlreay) {
        res.render('user/register', { user: req.session.user, msg: "Email already exists" });
        return;
    };

    const doesUsernameExitsAlreay = await User.findOne({ username: user });
    if (doesUsernameExitsAlreay) {
        res.render('user/register', { user: req.session.user, msg: "Username already exists" });
        return;
    };

    // lets hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const latestUser = new User({ email, password: hashedPassword, username: user });

    latestUser
        .save()
        .then(() => {
            res.render('user/register', { user: req.session.user, page: "login", msg: "Registered Succesfully! Login." });
            return;
        })
        .catch((err) => console.log(err));
});

//post for login
router
    .post("/login", async (req, res) => {
        var { username, password } = req.body;

        // check for missing filds
        if (!username || !password) {
            res.send("Please enter all the fields");
            return;
        }
        username = username.charAt(0).toUpperCase() + username.slice(1);
        const doesUserExits = await User.findOne({ username });

        if (!doesUserExits) {
            res.render('user/login', { user: req.session.user, page: "login", msg: "Invalid useranme or password" }); return;
        }

        const doesPasswordMatch = await bcrypt.compare(
            password,
            doesUserExits.password
        );

        if (!doesPasswordMatch) {
            res.render('user/login', { user: req.session.user, page: "login", msg: "Invalid useranme or password" });
            return;
        }

        // else he\s logged in
        req.session.user = username;

        const note = await notes.find({})
        res.redirect('/proced');
    })

//logout
router.get("/logout", authenticateUser, (req, res) => {
    req.session.user = null;
    res.redirect("/");
});

module.exports = router;