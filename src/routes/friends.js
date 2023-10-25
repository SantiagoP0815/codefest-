const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('friends/add');
});

router.post('/add', async (req, res) => {
    const { name } = req.body;
    const newLink = {
        title,
        url,
        description,
        user_id: req.user.id
    };
    await pool.query('INSERT INTO friends set ?', [newLink]);
    req.flash('success', 'Link Saved Successfully');
    res.redirect('/friends');
});

router.get('/', isLoggedIn, async (req, res) => {
    const user = req.user.u_id;
    const user_name = req.user.fullname;
    console.log(user_name);
    const friends = await pool.query('SELECT * FROM friends WHERE f_user_1 = ? OR f_user_2 = ?', [user, user]);
    console.log(friends);
    const valuesArray = friends.map(row => [row.f_user_1, row.f_user_2]);
    console.log(valuesArray);
    const valuesString = valuesArray.join(',');
    const friendNames = await pool.query('SELECT fullname FROM users WHERE u_id IN (' + valuesString + ')');
    console.log(friendNames);
    const filteredFriendNames = friendNames.filter(row => row.fullname !== user_name);
    console.log(filteredFriendNames);
    const valuesArray2 = filteredFriendNames.map(row => [row.fullname]);
    console.log(valuesArray2);
    res.render('friends/list', { friends, valuesArray2 });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM friends WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/friends');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const friends = await pool.query('SELECT * FROM friends WHERE id = ?', [id]);
    console.log(friends);
    res.render('friends/edit', {link: friends[0]});
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, url} = req.body; 
    const newLink = {
        title,
        description,
        url
    };
    await pool.query('UPDATE friends set ? WHERE id = ?', [newLink, id]);
    req.flash('success', 'Link Updated Successfully');
    res.redirect('/friends');
});

module.exports = router;