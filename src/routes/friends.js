const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');
const { use } = require('passport');

router.get('/add', (req, res) => {
    res.render('friends/add');
});

router.post('/add', async (req, res) => {
    const email = req.body.email; 
    const userQuery = await pool.query('SELECT u_id FROM users WHERE email = ?', [email]);
    console.log(userQuery);
    if (userQuery.length === 1) {
        const f_receiver = userQuery[0].u_id; 

        const f_sender = req.user.u_id; 
        const insertQuery = 'INSERT INTO friend_request (f_sender, f_receiver) VALUES (?, ?)';
        await pool.query(insertQuery, [f_sender, f_receiver]);

        res.redirect('/friends'); 
    } else {
        res.redirect('/friends/add');
    }
});

router.get('/', isLoggedIn, async (req, res) => {
    user_name = req.user.fullname;
    const friends = await pool.query('SELECT * FROM friends WHERE f_user_1 or f_user_2 = ?', [req.user.u_id]);
    const valuesArray = friends.map(row => [row.f_user_1, row.f_user_2]);
    const valuesString = valuesArray.join(',');
    const friendNames = await pool.query('SELECT fullname FROM users WHERE u_id IN (' + valuesString + ')');
    const filteredFriendNames = friendNames.filter(row => row.fullname !== user_name);
    const valuesArray2 = filteredFriendNames.map(row => [row.fullname]);
    res.render('friends/list', { friends, valuesArray2 });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM friends WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/friends');
});

router.get('/request', async (req, res) => {
    const { id } = req.params;
    const friends = await pool.query('SELECT * FROM friends WHERE id = ?', [id]);
    console.log(friends);
    res.render('friends/edit', {link: friends[0]});
});

module.exports = router;