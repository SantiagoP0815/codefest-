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

router.post('/chat/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const { c_content } = req.body;
    const newchat = {
        c_content,
        post_id: id_post,
        c_user: req.user.u_id,
    };
    try {
        await pool.query('INSERT INTO comments SET ?', [newchat]);
        res.redirect(`/posts/show/${id_post}`);
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred while saving the chat');
        res.redirect(`/posts/show/${id_post}`);
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
        const posts = await pool.query('SELECT * FROM posts WHERE author = ?', [req.user.u_id]);
        res.render('posts/list', { posts, friendRequest: req.user.hasFriendRequest, friendRequestsLenght: req.user.length});
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en la consulta de solicitudes de amistad o posts.');
    }
});

router.get('/all/:author', async (req, res) => {
    const { author } = req.params;
    const posts = await pool.query('SELECT * FROM posts , users WHERE posts.author = users.u_id and posts.author = ?', [author]);
    res.render('posts/all', { posts });
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
        res.render('posts/all', { posts, friendRequest: req.user.hasFriendRequest, friendRequestsLenght: req.user.length});
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
    const posts = await pool.query('SELECT * FROM posts , users WHERE posts.author = users.u_id and posts.id_post = ?', [id_post]);
    const chat = await pool.query('SELECT * FROM comments, users WHERE comments.c_user = users.u_id and comments.post_id = ?', [id_post]);
    if (posts.length > 0) {
        const post = posts[0];
        res.render('posts/show', { post,chat });
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
