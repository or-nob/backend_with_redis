const redis = require("redis");

var rediscl = redis.createClient();

rediscl.on("connect", function () {
    console.log("Redis plugged in");
});

function generate_refresh_token(len) {
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
}

const jwt_secret = "jwtsecret";
const jwt_expiration = 60 * 1;
const jwt_refresh_expiration = 60 * 60 * 24 * 30;

module.exports = {
    generate_refresh_token,
    rediscl,
    jwt_secret,
    jwt_expiration,
    jwt_refresh_expiration,
};
