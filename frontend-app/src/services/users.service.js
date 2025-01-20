import axios from 'axios';

const create_account = (first_name, last_name, email, password) => {
    return axios.post("http://localhost:3333/users", {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: password
    })
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error.response.data);
    })
}

const login = (email, password) => {
    return axios.post("http://localhost:3333/login", {
        email: email,
        password: password
    })
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error.response.data.error_message);
    })
}

const logout = (session_token) => {
    return axios.post("http://localhost:3333/logout", {}, {
        headers: {
            'X-Authorization': session_token
        }
    })
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

export const usersService = {
    create_account,
    login,
    logout
};