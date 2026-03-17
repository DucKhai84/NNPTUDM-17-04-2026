const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(path.join(__dirname, "../private.pem"), "utf8");
const publicKey = fs.readFileSync(path.join(__dirname, "../public.pem"), "utf8");

module.exports = {
    sign: (payload) => {
        return jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn: "1d" });
    },
    verify: (token) => {
        try {
            return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
        } catch (err) {
            return null;
        }
    },
};
