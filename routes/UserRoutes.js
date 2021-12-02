const express = require('express');
const usersController = require("../controller/UsersController");
const router = express.Router()
module.exports = router

/**
 * CREATE USER
 */
router.post("/signup", usersController.signUp);


/**
 * LOGIN USER
 */
router.post("/login", usersController.login);
