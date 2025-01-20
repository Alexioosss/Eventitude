import axios from 'axios';

const createEvent = (event, session_token) => {
    return axios.post("http://localhost:3333/events", event, {
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

const getSingleEvent = (event_id, session_token) => {
    return axios.get("http://localhost:3333/event/" + event_id, {
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

const getCategories = () => {
    return axios.get("http://localhost:3333/events/categories")
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

const updateEvent = (event_id, newObject, session_token) => {
    return axios.patch("http://localhost:3333/event/" + event_id, newObject, {
        headers: {
            'X-Authorization': session_token
        }
    })
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error)
    })
}

const registerUserToEvent = (event_id, session_token) => {
    return axios.post("http://localhost:3333/event/" + event_id, {}, {
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

const deleteEvent = (event_id, session_token) => {
    return axios.delete("http://localhost:3333/event/" + event_id, {
        headers: {
            'X-Authorization': session_token
        }
    })
    .then(function(response) {
        return response.data
    })
    .catch(function(error) {
        return Promise.reject(error)
    })
}

const searchEvent = () => {
    return axios.get("http://localhost:3333/search?limit=20&offset=0") //add all the parameters contactenating them to the url
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

const searchByQueryString = (query) => {
    return axios.get("http://localhost:3333/search?q=" + query)
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

const searchByLimit = (limit) => {
    return axios.get("http://localhost:3333/search?limit=" + limit)
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

const searchByOffset = (offset) => {
    return axios.get("http://localhost:3333/search?offset=" + offset)
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

const searchByLimitAndOffset = (limit, offset) => {
    return axios.get("http://localhost:3333/search?limit=" + limit + "&offset=" + offset)
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

const searchByStatus = (status, session_token) => {
    return axios.get("http://localhost:3333/search?status=" + status, {
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

const searchByCategory = (category) => {
    return axios.get("http://localhost:3333/search?category=" + category)
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

export const eventsService  = {
    createEvent,
    getSingleEvent,
    getCategories,
    updateEvent,
    registerUserToEvent,
    deleteEvent,
    searchEvent,
    searchByQueryString,
    searchByLimit,
    searchByOffset,
    searchByLimitAndOffset,
    searchByStatus,
    searchByCategory
};