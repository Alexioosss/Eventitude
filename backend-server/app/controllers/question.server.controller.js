const Joi = require('joi');
const questions = require("../models/question.server.model");
const events = require("../models/event.server.models");
var Filter = require('bad-words'), filter = new Filter(); //require the library of bad words, where you can get access to the functions in it

const ask_question = (req, res) => {
    const schema = Joi.object({
        question: Joi.string().min(10).required()
    }).unknown(false);

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    let question = Object.assign({}, req.body);
    question["event_id"] = req.params.event_id;
    let user_id = req.user_id.user_id;
    question["asker_id"] = user_id;

    for(const key of Object.keys(req.body)) {
        if(typeof req.body[key] === "string") {
            question[key] = filter.clean(req.body[key]); //validate each input for bad words, filtering them if any
        }
    };

    events.getEvent(req.params.event_id, (err, event) => {
        if(err) return res.sendStatus(404);
        if(event[0]){
            if(event[0]['creator_id'] != null) {
                if(user_id == event[0]['creator_id']){ //event creator cannot ask questions on their own event
                    return res.status(403).send({error_message: "You cannot ask questions on your own events."});
                } else{
                    events.hasUserRegisteredForEvent([req.params.event_id, user_id], (err, row) => {
                        if(err) return res.status(404).send({error_message: err});
                        if(!row) return res.status(404).send({error_message: err});
                        let registered = row['COUNT(*)'];

                        if(registered > 0) { //if the user is registered to the event, they can ask a question
                            questions.askQuestion(question, (err, questionID) => {
                                if(err) return res.status(400).send({error_message: err});
                                return res.status(201).send({question_id: questionID});
                            });
                        } else return res.status(403).send({error_message: "You cannot ask questions on events you are not registered for."});
                    });
                };
            };
        };
    });
};

const delete_question = (req, res) => {
    const question_ID = parseInt(req.params.question_id);
    let user_id = req.user_id.user_id;
    questions.getQuestion(question_ID, (err, result) => {
        if(err) return res.status(404).send({error_message: err});
        if(!result) return res.status(404).send({error_message: "Question does not exist"});

        if(result){
            events.isUserEventCreator(result.event_id, (err, creator_id) => {
                if(err) return res.status(404).send({error_message: err.message});
                if(!creator_id) return res.status(403).send("No session token was found.");

                questions.getQuestionAuthor(question_ID, (err, asked_by) => {
                    if(err) return res.status(404).send({error_message: err});
                    if(!asked_by) return res.status(401).send({error_message: "No question matches."});

                    if(creator_id.creator_id == user_id || user_id == asked_by.asked_by){
                        questions.deleteQuestion(question_ID, (err) => {
                            if(err) return res.status(400).send({error_message: err});
                            return res.sendStatus(200);
                        });
                    } else return res.status(403).send("You can only delete your own questions, or events that you have created");
                });
            });
        };
    });
};

const upvote_question = (req, res) => {
    const question_ID = parseInt(req.params.question_id);
    let user_id = req.user_id.user_id;

    questions.hasVoted(question_ID, (err, rows) => {
        if(err) return res.status(400).send({error_message: err});

        if(rows['COUNT(*)'] > 0) return res.status(403).send({error_message: "You have already voted on this question."}); //if you voted already, can't vote again
        questions.upvoteQuestion(question_ID, user_id, (err) => {
            if(err) return res.status(400).send({error_message: err});
            return res.sendStatus(200);
        });
    });
};

const downvote_question = (req, res) => {
    const question_ID = parseInt(req.params.question_id);
    let user_id = req.user_id.user_id;

    questions.hasVoted(question_ID, (err, rows) => {
        if(err) return res.status(400).send({error_message: "You cannot downvote this question."});

        if(rows['COUNT(*)'] == 0) return res.status(403).send({error_message: "You have voted on this question."});
        questions.downvoteQuestion(question_ID, user_id, (err) => {
            if(err) return res.status(400).send({error_message: err});
            return res.sendStatus(200);
        })
    });
};

module.exports = {
    ask_question: ask_question,
    delete_question: delete_question,
    upvote_question: upvote_question,
    downvote_question: downvote_question
};