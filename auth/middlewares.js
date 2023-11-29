const crypto = require("crypto");
const database = require("../database");

const login = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        res.status(401).redirect("/login");
        return;
    }

    const hashedPw = crypto.createHmac("sha256", 'Wow, what a marvelous key here')
        .update(password)
        .digest("base64");

    let user = await database.queryByUserInfos(username, hashedPw);

    if (user.rowCount > 0) {
        user = user.rows[0];
        req.session.id = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        next();
    } else {
        res.status(401).end();
        return;
    }
    next();
}

const authenticate = (req, res, next) => {
    if(req.session.id && req.session.username && req.session.role) {
        next();
    } else {
        res.status(401).end();
    }
}

/**
 *
 * @param req
 * @param res
 * @param next
 */
const editorAuthenticate = (req, res, next) => {
    if(req.session.id && req.session.username && req.session.role === "EDITOR") {
        next();
    } else {
        res.status(401).end();
    }
}

module.exports = {
    login,
    authenticate,
    editorAuthenticate
}