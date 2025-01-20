const users = require("../models/user.server.models");

function isAuthenticated(req, res, next) {
    let token = req.get("X-Authorization");
    if(!token) return res.status(401).send({error_message: "You are not logged in."});
    users.getIDFromToken(token, (err, id) => {
        if(err || id === null) {
            return res.status(401).send({error_message: "Couldn't authenticate you."});
        }
        req.user_id = id;
        next();
    });
};

module.exports = {
    isAuthenticated: isAuthenticated
};