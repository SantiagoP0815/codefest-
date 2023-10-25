const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
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
    const posts = await pool.query('SELECT * FROM posts WHERE author = ?', [req.user.u_id]);
    res.render('posts/list', { posts });
});

router.get('/delete/:id_post', async (req, res) => {
    const { id_post } = req.params;
    await pool.query('DELETE FROM posts WHERE id_post = ?', [id_post]);
    req.flash('success', 'Post Removed Successfully');
    res.redirect('/posts');
});


router.get('/edit/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const posts = await pool.query('SELECT * FROM posts WHERE author = ?', [id_post]);
    console.log(posts);
    res.render('posts/edit', {post: posts[0]});
});

router.post('/edit/:id_post', async (req, res) => {
    const { id_post } = req.params;
    const { p_title, p_content} = req.body; 
    const newpost = {
        p_title,
        p_content
    };
    await pool.query('UPDATE posts set ? WHERE author = ?', [newpost, id_post]);
    req.flash('success', 'Post Updated Successfully');
    res.redirect('/posts');
});

module.exports = router;