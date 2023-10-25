const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('profiles/add');
});

router.post('/add', async (req, res) => {
    const { p_title, p_content } = req.body;
    const newpost = {
        p_title,
        p_content,
        author: req.user.u_id
    };
    await pool.query('INSERT INTO profiles set ?', [newpost]);
    req.flash('success', 'Post Saved Successfully');
    res.redirect('/profiles');
});

router.get('/', isLoggedIn, async (req, res) => {
    const profiles = await pool.query('SELECT * FROM users, posts WHERE users.u_id = posts.authot and author = ?', [req.user.u_id]);
    res.render('profiles/list', { profiles });
});

router.get('/all', isLoggedIn, async (req, res) => {
    const profiles = await pool.query('SELECT * FROM profiles , users WHERE profiles.author = users.u_id');
    res.render('profiles/all', { profiles });
});

router.get('/delete/:id_post', async (req, res) => {
    const { id_post } = req.params;
    await pool.query('DELETE FROM profiles WHERE id_post = ?', [id_post]);
    req.flash('success', 'Post Removed Successfully');
    res.redirect('/profiles');
});


router.get('/edit/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const profiles = await pool.query('SELECT * FROM profiles WHERE id_post = ?', [id_post]);
    if (profiles.length > 0) {
        const post = profiles[0];
        res.render('profiles/edit', { post });
    } else {
        res.status(404).send('Post not found');
    }
});

router.get('/show/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const profiles = await pool.query('SELECT * FROM profiles , users WHERE profiles.author = users.u_id and profiles.id_post = ?', [id_post]);
    if (profiles.length > 0) {
        const post = posts[0];
        res.render('posts/show', { post });
    } else {
        res.status(404).send('Post not found');
    }
});

router.post('/edit/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const { p_title, p_content } = req.body; 
    const newPost = {
        p_title,
        p_content
    };
    await pool.query('UPDATE posts SET ? WHERE id_post = ?', [newPost, id_post]);
    req.flash('success', 'Post Updated Successfully');
    res.redirect('/posts');
});


module.exports = router;
