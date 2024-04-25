const express = require("express");
const router = express.Router();
const { authRequired, adminRequired } = require("../services/auth.js");
const Joi = require("joi");
const { db } = require("../services/db.js");

// GET /forum
router.get("/", authRequired, function (req, res, next) {
    const stmt = db.prepare(`
        SELECT p.id, p.date, p.title, u.name AS author
        FROM posts p, users u
        WHERE p.author_id = u.id
        ORDER BY p.date
    `);

    const result = stmt.all();

    res.render("forum/index", { result: { items: result } });
});

// GET /forum/add
router.get("/add", authRequired, function (req, res, next) {
    res.render("forum/new_post", { result: { display_form: true } });
});

// SCHEMA add
const schema_add = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    text: Joi.string().min(3).max(2000).required()
});

// POST /forum/add
router.post("/add", authRequired, function (req, res, next) {
    // do validation
    const result = schema_add.validate(req.body);
    if (result.error) {
        res.render("forum/new_post", { result: { validation_error: true, display_form: true } });
        return;
    }

    const date = new Date().toString();

    const stmt = db.prepare("INSERT INTO posts (title, text, author_id, date) VALUES (?, ?, ?, ?);");
    const insertResult = stmt.run(req.body.title, req.body.text, req.user.sub, date);

    if (insertResult.changes && insertResult.changes === 1) {
        res.render("forum/new_post", { result: { success: true } });
    } else {
        res.render("forum/new_post", { result: { database_error: true } });
    }
});

//GET /forum/view
router.get("/view/:id", authRequired, function (req, res, next) {
    const stmt = db.prepare(`
        SELECT p.id, p.text, p.date, p.title, u.name AS author
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.id = ?
    `);

    const stmtComments = db.prepare(`
        SELECT c.text, c.date, u.name AS author
        FROM comments c
        INNER JOIN users u ON u.id = c.author_id
        WHERE c.post_id = ?
        ORDER BY c.date
    `);

    const post = stmt.get(req.params.id);

    const comments = stmtComments.all(req.params.id);

    res.render("forum/view_post", { result: { success: true, post: post, comments: comments} });   
});


// GET /forum/add-comment
router.get("/add-comment/:id", authRequired, function (req, res, next) {
    res.render("forum/add_comment", { result: { display_form: true, id: req.params.id} });
});

// SCHEMA add-comment
const schema_addComment = Joi.object({
    text: Joi.string().min(3).max(50).required()
});

// POST /forum/add-comment
router.post("/add-comment/:id", authRequired, function (req, res, next) {
    // do validation
    const result = schema_addComment.validate(req.body);
    if (result.error) {
        res.render("forum/add_comment", { result: { validation_error: true, display_form: true } });
        return;
    }

    const date = new Date().toString();

    const stmt = db.prepare("INSERT INTO comments (text, author_id, post_id, date) VALUES (?, ?, ?, ?);");
    const insertResult = stmt.run(req.body.text, req.user.sub, req.params.id, date);

    if (insertResult.changes && insertResult.changes === 1) {
        res.render("forum/add_comment", { result: { success: true, id: req.params.id } });
    } else {
        res.render("forum/add_comment", { result: { database_error: true } });
    }
});

module.exports = router;