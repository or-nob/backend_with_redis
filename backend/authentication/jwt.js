const jwt = require("jsonwebtoken");
const { rediscl, generate_refresh_token, jwt_secret, jwt_expiration, jwt_refresh_expiration } = require('./redis');

function validate_jwt(req, res, next) {
    if (req._parsedUrl.pathname === "/" || req._parsedUrl.pathname === "/login") {
        return;
    } else {
        return new Promise((resolve, reject) => {
            let accesstoken = req.cookies != null ? req.cookies.access_token : null;
            let refreshtoken = req.cookies != null ? req.cookies.refresh_token : null;
            if (accesstoken && refreshtoken) {
                jwt.verify(accesstoken, jwt_secret, async (err, decoded) => {
                    if (err) {
                        if (err.name === "TokenExpiredError") {
                            rediscl.get(req.body.uid.toString(), (err, val) => {
                                let redis_token = (err ? null : (val ? JSON.parse(val) : null)); 
                                if (!redis_token || redis_token.refresh_token !== refreshtoken) {
                                    reject(new Error("Error"));
                                } else {
                                    if (redis_token.expires > new Date()) {
                                        let refresh_token = generate_refresh_token(64);
                                        res.cookie("refresh_token", refresh_token, {
                                            httpOnly: true
                                        });
                                        let refresh_token_maxage = new Date();
                                        refresh_token_maxage = new Date(refresh_token_maxage.getTime() + jwt_refresh_expiration * 1000);

                                        rediscl.set(
                                            req.body.uid,
                                            JSON.stringify({
                                                refresh_token: refresh_token,
                                                expires: refresh_token_maxage
                                            }),
                                            rediscl.print
                                        );
                                    }

                                    let token = jwt.sign({ uid: req.body.uid }, jwt_secret, {
                                        expiresIn: jwt_expiration
                                    });

                                    res.cookie("access_token", token, {
                                        httpOnly: true
                                    });

                                    resolve({
                                        res: res,
                                        req: req
                                    });
                                }
                            });
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve({
                            res: res,
                            req: req
                        });
                    }
                });
            } else {
                reject(new Error("Token missing"));
            }
        });
    }
}

module.exports = validate_jwt;
