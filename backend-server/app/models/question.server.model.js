const db = require("../../database");

const askQuestion = (question, done) => {
    const SQL = "INSERT INTO questions (question, asked_by, event_id, votes) VALUES (?, ?, ?, 0)";
    let parameters = [question.question, question.asker_id, question.event_id];
    db.run(SQL, parameters, function(err) {
        return done(err, this.lastID);
    });
};

const deleteQuestion = (question_id, done) => {
    const SQL = "DELETE FROM questions WHERE question_id = ?";
    db.run(SQL, [question_id], (err) => {
        return done(err);
    });
};

const getQuestion = (question_id, done) => {
    const SQL = "SELECT * FROM questions WHERE question_id = ?";
    db.get(SQL, [question_id], (err, question) => {
        return done(err, question);
    });
};

const getQuestionAuthor = (question_id, done) => {
    const SQL = "SELECT asked_by FROM questions WHERE question_id = ?";
    db.get(SQL, [question_id], (err, asked_by) => {
        return done(err, asked_by);
    });
};

const upvoteQuestion = (question_id, user_id, done) => {
    const SQL = "INSERT INTO votes (question_id, voter_id) VALUES (?, ?)";
    let parameters = [question_id, user_id];
    db.run(SQL, parameters, (err) => {
        if(err) return done(err);
        const SQL = "UPDATE questions SET votes = COALESCE(votes, 0) + 1 WHERE question_id = ?";
        db.run(SQL, [question_id], (err) => {
            return done(err);
        });
    });
};

const hasVoted = (question_id, done) => {
    const SQL = "SELECT COUNT(*) FROM votes WHERE question_id = ?";
    db.get(SQL, [question_id], (err, rows) => {
        if(err) return done(err);
        return done(err, rows);
    });
};

const downvoteQuestion = (question_id, user_id, done) => {
    const SQL = "DELETE FROM votes WHERE question_id = ? AND voter_id = ?";
    let parameters = [question_id, user_id];
    db.run(SQL, parameters, (err) => {
        if(err) return done(err);
        const SQL = "UPDATE questions SET votes = COALESCE(votes, 0) - 1 WHERE question_id = ?"; //if there are no votes; null in the database, set the value to 0, then -1
        db.run(SQL, question_id, (err) => {
            return done(err);
        });
    });
};

//if ash says that the program allows only for an upvote OR a downvote ONLY - then change the functions PLEASE. You can only vote once.
//Upvote and downvote add a row to the votes table to represent a vote of any form. If there is a row, you can't upvote or downvote, or change anything.

module.exports = {
    askQuestion: askQuestion,
    deleteQuestion: deleteQuestion,
    getQuestion: getQuestion,
    getQuestionAuthor: getQuestionAuthor,
    upvoteQuestion: upvoteQuestion,
    hasVoted: hasVoted,
    downvoteQuestion: downvoteQuestion
};