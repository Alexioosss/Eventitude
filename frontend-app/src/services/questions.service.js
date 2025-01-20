import axios from "axios";

const askQuestion = (event_id, question, session_token) => {
    return axios.post("http://localhost:3333/event/" + event_id + "/question", {
        question: question
    },
    {
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

const deleteQuestion = (question_id, session_token) => {
    return axios.delete("http://localhost:3333/question/" + question_id, {
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

const upvoteQuestion = (question_id, session_token) => {
    return axios.post("http://localhost:3333/question/" + question_id + "/vote", {}, {
            headers: {
                'X-Authorization': session_token
            }
        }
    )
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

const downvoteQuestion = (question_id, session_token) => {
    return axios.delete("http://localhost:3333/question/" + question_id + "/vote", {
            headers: {
                'X-Authorization': session_token
            }
        }
    )
    .then(function(response) {
        return response.data;
    })
    .catch(function(error) {
        return Promise.reject(error);
    })
}

export const questionsService = {
    askQuestion,
    deleteQuestion,
    upvoteQuestion,
    downvoteQuestion
}