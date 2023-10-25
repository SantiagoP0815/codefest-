const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', async (req, res) => {
    res.render('posts/add');
});

router.post('/add', async (req, res) => {
    const { p_title, p_content } = req.body;
    const newpost = {
        p_title,
        p_content,
        author: req.user.u_id
    };
    await pool.query('INSERT INTO posts set ?', [newpost]);
    req.flash('success', 'Post Saved Successfully');
    res.redirect('/posts');
});

router.get('/', isLoggedIn, async (req, res) => {
    const userId = req.user.u_id; 
    try {
        const friendRequests = await pool.query('SELECT * FROM friend_request WHERE f_receiver = ?', [userId]);
        if (friendRequests.length > 0) {
            req.user.length = friendRequests.length;
            req.user.hasFriendRequest = true;
        }

        const posts = await pool.query('SELECT * FROM posts WHERE author = ?', [req.user.u_id]);

        res.render('posts/list', { posts, friendRequest: req.user.hasFriendRequest, friendRequestsLenght: req.user.length});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en la consulta de solicitudes de amistad o posts.');
    }
});

router.get('/all', isLoggedIn, async (req, res) => {
    const userId = req.user.u_id; 
    try {
        const friendRequests = await pool.query('SELECT * FROM friend_request WHERE f_receiver = ?', [userId]);
        if (friendRequests.length > 0) {
            req.user.length = friendRequests.length;
            req.user.hasFriendRequest = true;
        }

        const posts = await pool.query('SELECT * FROM posts , users WHERE posts.author = users.u_id');

        res.render('posts/list', { posts, friendRequest: req.user.hasFriendRequest, friendRequestsLenght: req.user.length});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en la consulta de solicitudes de amistad o posts.');
    }
    const posts = await pool.query('SELECT * FROM posts , users WHERE posts.author = users.u_id');
});

router.get('/delete/:id_post', async (req, res) => {
    const { id_post } = req.params;
    await pool.query('DELETE FROM posts WHERE id_post = ?', [id_post]);
    req.flash('success', 'Post Removed Successfully');
    res.redirect('/posts');
});


router.get('/edit/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const posts = await pool.query('SELECT * FROM posts WHERE id_post = ?', [id_post]);
    if (posts.length > 0) {
        const post = posts[0];
        res.render('posts/edit', { post });
    } else {
        res.status(404).send('Post not found');
    }
});

router.get('/show/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const posts = await pool.query('SELECT * FROM posts WHERE id_post = ?', [id_post]);
    if (posts.length > 0) {
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
