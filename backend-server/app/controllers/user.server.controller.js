const Joi = require('joi');
const users = require('../models/user.server.models');

const create_account = (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().min(3).required(),
        last_name: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?:[a-zA-Z0-9!"£$%^&*()_+=:;'~#,./?><{}|\-"]){8,25}$/).required() //password must contain at least an upper and lower case letter, a digit and a special character
    }).unknown(false);

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    let user = Object.assign({}, req.body);
    users.addNewUser(user, (err, user_id) => {
        if(err) return res.status(400).send({error_message: err.message});
        return res.status(201).send({user_id: user_id});
    });
};

const login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().min(5).required(),
        password: Joi.string().required()
    }).unknown(false);

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});
    
    users.authenticateUser(req.body.email, req.body.password, (err, id) => {
        if(err) return res.status(400).send({error_message: err});

        users.getToken(id, (err, token) => {
            if(err) return res.status(500).send({error_message: err});
            if(token) { //there is a token in the database for this user
                return res.status(200).send({user_id: id, session_token: token}); //if the user is already logged in, return its same token
            }
            if(!token) { //the user does not have a token, and is logging in for the first time; creates a token for the user
                users.setToken(id, (err, token) => {
                    if(err) return res.sendStatus(500);
                    return res.status(200).send({user_id: id, session_token: token});
                });
            }
        });
    });
};

const logout = (req, res) => {
    let token = req.get("X-Authorization"); //get the token header from the request
    if(!token) return res.status(404).send("Couldn't retrieve current session token."); //if the token doesn't exist, there is no token; the user is not logged in, send 404 no token found
    users.removeToken(token, (err) => {
        if(err) return res.sendStatus(500);
        return res.sendStatus(200);
    });
};

module.exports = {
    create_account: create_account,
    login: login,
    logout: logout
};