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

// edit
router.get('/edit/:id', async (req, res) => {
    var id = req.params.id;
    const note = await notes.find({});
    const result = await notes.findById({ _id: id });
    res.render('main/notes', { user: req.session.user, note: note, notes: req.session.note, each: result });
});
//note save
router.post('/save', async (req, res) => {
    const { title, note } = req.body;
    let count = 0;
    var id = " ";
    const result = await notes.find({});
    result.forEach(element => {
        if (element.title === req.body.title) {
            count++
            id = element._id;
        }
    });
    if (count > 0) {
        await notes.findByIdAndUpdate(id, { title: req.body.title, note: req.body.note });
        res.redirect('/proced');
    } else {
        if (req.session.user) {
            const latestNote = new notes({
                title, note, user: req.session.user
            });
            latestNote.save();
            res.redirect('/proced');
        } else {
            if (req.session.note) {
                const item = { title: req.body.title, note: req.body.note }
                req.session.note.push(item);
                res.redirect('/proced');
            } else {
                req.session.note = [];
                const item = { title: req.body.title, note: req.body.note }
                req.session.note.push(item);
                res.redirect('/proced');
            }
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