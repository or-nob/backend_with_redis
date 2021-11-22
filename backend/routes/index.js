const jwt = require("jsonwebtoken");
// const redis = require("redis");
var express = require('express');
var { rediscl, generate_refresh_token, jwt_secret, jwt_expiration, jwt_refresh_expiration } = require('../authentication/redis');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.json({ message: "hi"});
});

router.post('/register', function(req, res, next) {
    res.json({ message: "hi"});
});

router.post('/login', function(req, res, next) {
    // let user_id = 2212;
    let user_id = req.body.uid;
    let refresh_token = generate_refresh_token(64);
    let refresh_token_maxage = new Date();
    refresh_token_maxage = new Date(refresh_token_maxage.getTime() + jwt_refresh_expiration * 1000);

    let token = jwt.sign({ uid: user_id }, jwt_secret, {
        expiresIn: jwt_expiration
    });

    res.cookie("access_token", token, {
        httpOnly: true
    });

    res.cookie("refresh_token", refresh_token, {
        httpOnly: true
    });

    rediscl.set(user_id, JSON.stringify({
            refresh_token: refresh_token,
            expires: refresh_token_maxage
        }),
        rediscl.print
    );
    res.json({ message: "hi"});
});

router.post('/logout', function(req, res, next) {
    rediscl.del(req.body.uid);

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.redirect("/");
});

router.post('/profile', function(req, res, next) {

});

module.exports = router;
