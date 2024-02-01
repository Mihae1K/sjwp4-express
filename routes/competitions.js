const express = require("express");
const router = express.Router();
const { authRequired, adminRequired } = require("../services/auth.js");
const Joi = require("joi");
const { db } = require("../services/db.js");

// GET /competitions
router.get("/", authRequired, function (req, res, next) {
    res.render("competitions/index");
});

// GET /competitions/add
router.get("/add", adminRequired, function (req, res, next) {
    res.render("competitions/add", { result: { display_form: true } });
});

// POST /competitions/add
router.post("/add", adminRequired, function (req, res, next) {
    res.render("competitions/add", { result: { display_form: true } });
});

// SCHEMA add
const schema_signin = Joi.object({
    name: Joi.string().max(50).required(),
    description: Joi.string().min(3).max(1000).required(),
    apply_till: Joi.date().iso()
});

// POST /competitions/add
router.post("/add", function (req, res, next) {
    // do validation
    const result = schema_signin.validate(req.body);
    if (result.error) {
      res.render("competitions/add", { result: { validation_error: true, display_form: true } });
      return;
    }

    const stmt = db.prepare("INSERT INTO competitions (name, description, author-id, apply_till) VALUES (?, ?, ?, ?);");
    const insertResult = stmt.run(req.body.name, req.body.description, req.user.sub, req.body.apply_till)
    console.log(insertResult)

    if (insertResult.changes && insertResult.changes === 1) {
        res.render("competitions/add", { result: { success: true } })
    } else {
        res.render("competitions/add", { result: { database_error: true } })
    }
});

module.exports = router;
