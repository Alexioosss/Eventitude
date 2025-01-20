const db = require("../../database.js");

const addEvent = (event, done) => {
    const SQL = "INSERT INTO events \
    (name, description, location, start_date, close_registration, max_attendees, creator_id) \
    VALUES (?, ?, ?, ?, ?, ?, ?)"; //add creator id to database; the id of the current logged in user
    const values = [event.name, event.description, event.location, event.start, event.close_registration, event.max_attendees, event.user_id];

    db.run(SQL, values, function(err){
        return done(err, this.lastID);
    });
};

const addCategory = (event_id, category, category_description, done) => {
    const createCategory = [category, category_description];
    const SQL = "SELECT category_id FROM categories WHERE category = ? COLLATE NOCASE";

    db.get(SQL, category, (err, id) => { //check if the category entered exists already
        let category_id;
        if(id) category_id = id.category_id;

        if(!id) { //the user did not enter a known category, thus requiring the addition of this category in the categories table
            const SQL = "INSERT INTO categories (category, description) VALUES (?, ?)";
            db.run(SQL, createCategory, function(err) {
                if(err) return done(err);
                category_id = this.lastID;
            })
        }
        
        //after checking the category, check if the category is already assigned to the event in question
        const SQL2 = "SELECT * FROM eventCategories WHERE event_id = ? AND category_id = ?";
        db.get(SQL2, [event_id, category_id], (err, alreadyAdded) => {
            if(err) console.log(err);
            if(alreadyAdded) return done(null, "This category is already linked to this event."); //if so, just return
            else { //otherwise add the category to this event so they link together
                const SQL3 = "INSERT INTO eventCategories (event_id, category_id) VALUES (?, ?)";
                db.run(SQL3, [event_id, category_id], function(err) {
                    return done(err, category_id);
                })
            }
        })
    });
}

const getCategories = (done) => {
    let SQL = "SELECT DISTINCT(category), description FROM categories";
    db.all(SQL, (err, categories) => {
        return done(err, categories);
    })
}

const getEventByID = (ID, done) => {
    const SQL = "SELECT * FROM events WHERE event_id = ?";
    db.get(SQL, [ID], (err, event) => { //last field of the get function is where the result of the sql query is inserted into/stored
        return done(err, event);
    });
};

const updateEvent = (SQL, values, done) => {
    db.run(SQL, values, (err) => {
        return done(err);
    });
};

const getEvent = (event_id, done) => {
    const SQL =
    "SELECT events.*, \
    users.user_id AS creator_id, users.first_name AS creator_first_name, users.last_name AS creator_last_name, users.email AS creator_email, \
    categories.category_id, categories.category, categories.description AS category_description \
    FROM events \
    INNER JOIN (SELECT user_id, first_name, last_name, email FROM users AS users) users \
    ON events.creator_id = users.user_id \
    LEFT JOIN eventCategories \
    ON eventCategories.event_id = events.event_id \
    LEFT JOIN categories \
    ON categories.category_id = eventCategories.category_id \
    WHERE events.event_id = ?";

    db.all(SQL, event_id, (err, event) => {
        return done(err, event);
    });
};

const isUserEventCreator = (event_id, done) => {
    const SQL = "SELECT creator_id FROM events WHERE event_id = ?";
    db.get(SQL, event_id , (err, creator_id) => {
        return done(err, creator_id);
    });
};

const attendEvent = (event_id, user_id, done) => {
    const SQL = "INSERT INTO attendees (event_id, user_id) VALUES (?, ?)";
    const values = [event_id, user_id];
    db.run(SQL, values, (err) => {
        return done(err);
    });
};

const getAttendeesCount = (event_id, done) => {
    const SQL = "SELECT COUNT(*) FROM attendees WHERE event_id = ?";
    db.get(SQL, event_id, (err, row) =>{
        return done(err, row);
    });
};

const getAttendees = (event_id, done) => {
    const SQL = "SELECT creator.* \
    FROM events \
    INNER JOIN (SELECT user_id, first_name, last_name, email FROM users) as creator \
    ON creator.user_id = events.creator_id \
    WHERE events.event_id = ? \
    UNION ALL \
    SELECT attendee.* \
    FROM attendees \
    INNER JOIN (SELECT user_id, first_name, last_name, email FROM users) as attendee \
    ON attendee.user_id = attendees.user_id \
    WHERE attendees.event_id = ?";
    db.all(SQL, [event_id, event_id], (err, attendees) => {
        return done(err, attendees);
    });
};

const getUserInfo = (user_id, done) => {
    const SQL = "SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?";
    db.get(SQL, user_id, (err, attendeesInfo) =>{
        return done(err, attendeesInfo);
    });
};

const getQuestions = (event_id, done) => {
    const SQL = "SELECT questions.question_id AS question_id, questions.question AS question, questions.votes AS votes, \
    users.user_id AS user_id, users.first_name AS first_name FROM questions \
    INNER JOIN (SELECT user_id, first_name FROM users AS users) users \
    ON questions.asked_by = users.user_id \
    WHERE questions.event_id = ?";
    db.all(SQL, [event_id], (err, results) => {
        let questions = [];
        results.forEach(function(question) {
            question = {
                question_id: question.question_id,
                question: question.question,
                votes: question.votes,
                asked_by: {
                    user_id: question.user_id,
                    first_name: question.first_name
                }
            };
            questions.push(question);
        });
        return done(err, questions);
    });
};

const hasUserRegisteredForEvent = (values, done) => {
    const SQL = "SELECT COUNT(*) FROM attendees WHERE event_id = ? AND user_id = ?";
    const parameters = [values[0], values[1]];
    db.get(SQL, parameters, (err, row) => {
        return done(err, row);
    });
};

const getEventCloseRegistration = (event_id, done) => {
    const SQL = "SELECT close_registration FROM events WHERE event_id = ?";
    db.get(SQL, event_id, (err, row) => {
        return done(err, row);
    });
};

const deleteEvent = (event_id, done) => {
    const SQL = "UPDATE events SET close_registration = -1 WHERE event_id = ?";
    db.run(SQL, [event_id], (err) => {
        return done(err);
    });
};

const searchEventsByCategory = (category, done) => {
    const SQL = "SELECT events.*, eventCategories.category_id, categories.category, categories.description \
    FROM events \
    INNER JOIN eventCategories \
    ON eventCategories.event_id = events.event_id \
    INNER JOIN categories \
    ON categories.category_id = eventCategories.category_id \
    WHERE categories.category LIKE ? COLLATE NOCASE";
    category = "%" + category + "%";
    db.all(SQL, [category], (err, categoryEvents) => {
        return done(err, categoryEvents);
    })
}

const searchEvents = (values, done) => {
    let SQL = "SELECT * FROM events";
    if(values.length == 3) { //there is a query string in the values passed from the controller
        values[0] = "%" + values[0] + "%";
        SQL += " WHERE name LIKE ?";
    }
    SQL += " LIMIT ? OFFSET ?";
    db.all(SQL, values, (err, event) => {
        return done(err, event);
    });
};

const searchOpenEvents = (values, done) => {
    let SQL = "SELECT * FROM events WHERE close_registration != -1";
    if(values.length == 3) {
        values[0] = "%" + values[0] + "%";
        SQL += " AND name LIKE ?";
    }
    SQL += " LIMIT ? OFFSET ?";
    db.all(SQL, values, (err, event) => {
        return done(err, event);
    });
};

const searchMyEvents = (user_id, done) => {
    const SQL = "SELECT * FROM events WHERE creator_id = ?";
    db.all(SQL, user_id, (err, events) => {
        return done(err, events);
    });
};

const searchMyAttendingEvents = (user_id, done) => {
    const SQL = "SELECT * FROM events\
    INNER JOIN attendees\
    ON attendees.event_id = events.event_id\
    WHERE attendees.user_id = ?";
    db.all(SQL, user_id, (err, attendingEvents) => {
        return done(err, attendingEvents);
    });
};

const searchArchived = (limit, done) => {
    const SQL = "SELECT * FROM events WHERE close_registration = -1 LIMIT ?";
    db.all(SQL, limit, (err, archived) => {
        return done(err, archived);
    });
};

module.exports = {
    addEvent: addEvent,
    addCategory: addCategory,
    getCategories: getCategories,
    getEvent: getEvent,
    updateEvent: updateEvent,
    getEventByID: getEventByID,
    isUserEventCreator: isUserEventCreator,
    attendEvent: attendEvent,
    getUserInfo: getUserInfo,
    getAttendeesCount: getAttendeesCount,
    getAttendees: getAttendees,
    getQuestions: getQuestions,
    hasUserRegisteredForEvent: hasUserRegisteredForEvent,
    getEventCloseRegistration: getEventCloseRegistration,
    deleteEvent: deleteEvent,
    searchEventsByCategory: searchEventsByCategory,
    searchEvents: searchEvents,
    searchOpenEvents: searchOpenEvents,
    searchMyEvents: searchMyEvents,
    searchMyAttendingEvents: searchMyAttendingEvents,
    searchArchived: searchArchived
};