const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('friends/add');
});

router.post('/add', async (req, res) => {
    const { title, url, description } = req.body;
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
    const friends = await pool.query('SELECT * FROM friends WHERE user_id = ?', [req.user.id]);
    res.render('friends/list', { friends });
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