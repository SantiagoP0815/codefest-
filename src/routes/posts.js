const express = require('express');
const router = express.Router();

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', (req, res) => {
    res.render('posts/add');
});

router.post('/add', async (req, res) => {
    const { title, url, description } = req.body;
    const newpost = {
        p_title,
        url,
        description,
        u_id: req.user.u_id
    };
    await pool.query('INSERT INTO posts set ?', [newpost]);
    req.flash('success', 'post Saved Successfully');
    res.redirect('/posts');
});

router.get('/', isLoggedIn, async (req, res) => {
    const posts = await pool.query('SELECT * FROM posts WHERE u_id = ?', [req.user.id]);
    res.render('posts/list', { posts });
});

router.get('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM posts WHERE ID = ?', [id]);
    req.flash('success', 'Post Removed Successfully');
    res.redirect('/posts');
});

router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const posts = await pool.query('SELECT * FROM posts WHERE id = ?', [id]);
    console.log(posts);
    res.render('posts/edit', {post: posts[0]});
});

router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, url} = req.body; 
    const newpost = {
        title,
        description,
        url
    };
    await pool.query('UPDATE posts set ? WHERE id = ?', [newpost, id]);
    req.flash('success', 'Post Updated Successfully');
    res.redirect('/posts');
});

module.exports = router;