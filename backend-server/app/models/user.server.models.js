const db = require("../../database.js");
const crypto = require('crypto');

const getHash = function(password, salt){
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};

const addNewUser = (user, done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const SQL = "INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)";
    const values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];

    db.run(SQL, values, function(err){
        if(err) return done(err);
        return done(err, this.lastID);
    });
};

const authenticateUser = (email, password, done) => {
    const SQL = "SELECT user_id, password, salt FROM users WHERE email = ?";
    db.get(SQL, [email], (err, row) => {
        if(err) return done(err); //error in finding a certain field
        if(!row) return done("The email you entered is incorrect."); //wrong email entered as no match was found

        if(row.salt === null) row.salt = '';
        let salt = Buffer.from(row.salt, 'hex');
        if(row.password === getHash(password, salt)) {
            return done(false, row.user_id); //the user was found and the password entered matches
        } else return done("The wrong password has been entered.") //wrong password was entered
    });
};

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString('hex');
    const SQL = "UPDATE users SET session_token = ? WHERE user_id = ?";
    db.run(SQL, [token, id], (err) => {
        return done(err, token);
    })
};

const getToken = (id, done) => {
    const SQL = "SELECT session_token FROM users WHERE user_id = ?";
    db.get(SQL, [id], (err, row) => {
        if(err) return done(err);
        return done(err, row.session_token);
    });
};

const removeToken = (token, done) => {
    const SQL = "UPDATE users SET session_token = NULL WHERE session_token = ?";
    db.run(SQL, [token], (err) => {
        return done(err);
    });
};

const getIDFromToken = (token, done) => {
    const SQL = "SELECT user_id FROM users WHERE session_token = ?";
    const parameters = [token];
    db.get(SQL, parameters, (err, row) => {
        if(err) return done(err);
        if(!row) return done("No matching session token.");
        return done(err, row);
    });
};

const getUserInfo = (user_id, done) => {
    const SQL = "SELECT first_name, last_name, email FROM users WHERE user_id = ?";
    db.get(SQL, [user_id], (err, userInfo) => {
        return done(err, userInfo);
    });
};

module.exports = {
    addNewUser: addNewUser,
    authenticateUser: authenticateUser,
    getToken: getToken,
    setToken: setToken,
    removeToken: removeToken,
    getIDFromToken: getIDFromToken,
    getUserInfo: getUserInfo
};