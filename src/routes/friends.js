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
    const userId = req.user.u_id; 
    try {
        const friendRequests = await pool.query('SELECT * FROM friend_request WHERE f_receiver = ?', [userId]);
        if (friendRequests.length > 0) {
            req.user.length = friendRequests.length;
            req.user.hasFriendRequest = true;
        }
        user_name = req.user.fullname;
        const friends = await pool.query('SELECT * FROM friends WHERE f_user_1 or f_user_2 = ?', [req.user.u_id]);
        const valuesArray = friends.map(row => [row.f_user_1, row.f_user_2]);
        const valuesString = valuesArray.join(',');
        const friendNames = await pool.query('SELECT fullname, u_id FROM users WHERE u_id IN (' + valuesString + ')');
        const filteredFriendNames = friendNames.filter(row => row.fullname !== user_name);
        const valuesArray2 = filteredFriendNames.map(row => ({ fullname: row.fullname, u_id: row.u_id }));
        console.log(valuesArray2);
        if (friends.length === 0) {
            const noUsers = [];
            res.render('friends/list', { friendRequest: req.user.hasFriendRequest, friendRequestsLenght: req.user.length, noUsers });
        } else {
            res.render('friends/list', { friends, valuesArray2, friendRequest: req.user.hasFriendRequest, friendRequestsLenght: req.user.length });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en la consulta de solicitudes de amistad o posts.');
    }
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM friends_request WHERE ID = ?', [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect('/friends/request');
});

router.get('/request', async (req, res) => {
    const userId = req.user.u_id; 
    const user_name = req.user.fullname;
    try {
        const friendRequests = await pool.query('SELECT * FROM friend_request WHERE f_receiver = ?', [userId]);
        console.log(friendRequests);
        if (friendRequests.length > 0) {
            req.user.length = friendRequests.length;
            req.user.hasFriendRequest = true;
        }
        const valuesArray = friendRequests.map(row => [row.f_sender, row.f_receiver]);
        const valuesString = valuesArray.join(',');
        const friendNames = await pool.query('SELECT fullname FROM users WHERE u_id IN (' + valuesString + ')');
        const filteredFriendNames = friendNames.filter(row => row.fullname !== user_name);
        const valuesArray2 = filteredFriendNames.map(row => [row.fullname]);
        console.log(valuesArray2);
        res.render('friends/req', { valuesArray2, friendRequest: req.user.hasFriendRequest, friendRequestsLenght: req.user.length});
    } catch (error) {
        console.error(error);
        res.render('friends/req');
    }
});

module.exports = router;