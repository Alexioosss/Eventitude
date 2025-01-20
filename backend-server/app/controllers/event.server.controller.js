const Joi = require('joi');
const events = require("../models/event.server.models");
const users = require("../models/user.server.models");
var Filter = require('bad-words'), filter = new Filter();

const create_event = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(4).required(),
        description: Joi.string().min(15).required(),
        location: Joi.string().min(4).required(),
        start: Joi.number().integer().min(63072000).greater(Date.now()).required(), //in the future
        close_registration: Joi.number().integer().min(63072000).max(Joi.ref('start')).allow(-1).required(), //before start
        max_attendees: Joi.number().integer().min(2).required(),
        category: Joi.string().min(6), //not required to create an event, an event can be unbound from any category
        category_description: Joi.string().min(15)
    }).unknown(false);

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    let event = Object.assign({}, req.body);
    event["event_id"] = parseInt(req.params.event_id);
    event["user_id"] = req.user_id.user_id;
    
    for(const key of Object.keys(req.body)) {
        if(typeof req.body[key] === "string") {
            event[key] = filter.clean(req.body[key]);
        };
    };

    let category, category_description;
    if(event.category) { //if the user entered a category for this event
        category = event.category; //save it
        delete event.category; //delete it from the object before creating a new event, as there is no category name in the events table
    }

    if(event.category_description) {
        category_description = event.category_description;
        delete event.category_description;
    }

    events.addEvent(event, (err, event_id) => {
        if(err) return res.status(500).send("Couldn't add the event.");

        if(category && category_description != null) {
            events.addCategory(event_id, category, category_description, (err, category_id) => {
                if(err) return res.status(500).send("Could not save this category at this time.");
                return res.status(201).send({event_id: event_id, category_id: category_id});
            });
        }
        else return res.status(201).send({event_id: event_id});
    });
};

const get_categories = (req, res) => { //returns the list of categories
    events.getCategories((err, categories) => {
        if(categories) {
            return res.status(200).send({categories: categories});
        }
    })
}

const get_event = (req, res) => {
    const event_ID = parseInt(req.params.event_id);
    let user_ID;
    events.getEventByID(event_ID, (err, eventById) => { //check if the event exists in the first place, otherwise just send 404 and don't do anything else
        if(err) return res.status(404).send({error_message: err});
        if(eventById) { //if the event exists
            users.getIDFromToken(req.get('X-Authorization'), (err, row) => {
                if(row) user_ID = row.user_id; //save the id for this user if they are logged in at the time of the request

                events.getEvent(event_ID, (err, event) => { //get all the data needed from the tables joined together
                    if(err) return res.status(404).send({error_message: err.message});
                    if(event[0]){
                        if(event[0]['close_registration'] == -1) return res.status(200).send({close_registration: event[0]['close_registration']});
    
                        events.getAttendees(event_ID, (err, attendeesInfo) => {
                            if(err) return res.status(404).send({error_message: err.message});
                            if(!attendeesInfo) attendeesInfo = [];
    
                            events.getQuestions(event_ID, (err, questionsInfo) => {
                                if(err) return res.status(404).send({error_message: err.message});
                                if(!questionsInfo) questionsInfo = [];

                                let questions = questionsInfo.reverse();
                                let number_attending = Object.keys(attendeesInfo).length;

                                //find all categories that are linked to this event
                                let categories = [];
                                for(let i = 0; i < event.length; i++) {
                                    let category = Object.assign({}, {category_id: event[i].category_id, category: event[i].category, category_description: event[i].category_description});
                                    categories.push(category);
                                }

                                if(!user_ID || user_ID != event[0]['creator_id']){ //if the user is not the event creator, they cannot see the list of attendees
                                    return res.status(200).send({
                                        event_id: event[0].event_id,
                                        creator: {
                                            creator_id: event[0].creator_id,
                                            first_name: event[0].creator_first_name,
                                            last_name: event[0].creator_last_name,
                                            email: event[0].creator_email
                                        },
                                        name: event[0].name,
                                        description: event[0].description,
                                        location: event[0].location,
                                        start: event[0].start_date,
                                        close_registration: event[0].close_registration,
                                        max_attendees: event[0].max_attendees,
                                        number_attending: number_attending,
                                        questions,
                                        categories
                                    });
                                }
                                else {
                                    return res.status(200).send({ //otherwise show everything
                                        event_id: event[0].event_id,
                                        creator: {
                                            creator_id: event[0].creator_id,
                                            first_name: event[0].creator_first_name,
                                            last_name: event[0].creator_last_name,
                                            email: event[0].creator_email
                                        },
                                        name: event[0].name,
                                        description: event[0].description,
                                        location: event[0].location,
                                        start: event[0].start_date,
                                        close_registration: event[0].close_registration,
                                        max_attendees: event[0].max_attendees,
                                        number_attending: number_attending,
                                        attendees: attendeesInfo,
                                        questions,
                                        categories
                                    });
                                }
                            });
                        });
                    };
                });
            });
        } else return res.status(404).send({error_message: "Event does not exist"});
    });
};

const update_event = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(4),
        description: Joi.string().min(15),
        location: Joi.string().min(4),
        start: Joi.number().integer().min(63072000).greater(Date.now()).allow(null),
        //when updating an event, any value can be entered, without order, but when there is a start_date input, the close registration has to be compared to the start_date so it is less than it, otherwise it can be dealt with on its own
        close_registration: Joi.number().integer().min(63072000).when('start', {is: Joi.exist(), then: Joi.number().integer().min(63072000).less(Joi.ref('start')), otherwise: Joi.number().integer().min(63072000)}),
        max_attendees: Joi.number().integer().min(1),
        category: Joi.string().min(6),
        category_description: Joi.string().min(15)
    }).unknown(false);

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    let event = Object.assign({}, req.body);
    let event_id = parseInt(req.params.event_id);
    let user_id = req.user_id.user_id;

    let category, category_description;
    if(event["category"]) { //if the user entered a category for this event
        category = event["category"]; //save it
        delete event["category"]; //delete it from the object before creating a new event, as there is no category name in the events table
    }

    if(event["category_description"]) {
        category_description = event["category_description"];
        delete event["category_description"];
    }

    let SQL = "UPDATE events SET";
    let values = [];
    let isCommaNeeded = false;

    //check the event exists before everything else
    events.getEventByID(event_id, (err, exists) => {
        if(err) return res.sendStatus(404);

        if(exists){
            events.isUserEventCreator(event_id, (err, creator_id) => {
                if(err) return res.status(404).send({error_message: err.message});
                if(!creator_id) return res.status(403).send({error_message: "No session token was found."});

                if(creator_id.creator_id != user_id) return res.status(403).send("You can only update your own events");
                else{ //the user is the creator id; the only user that is able to update an event is the event's creator
                    if(event) {
                        //dynamically prepare the SQL statement, also storing the values needed to be passed over
                        if(event.name != null){
                            if(isCommaNeeded == true) SQL += ", ";
                            SQL += " name = ?";
                            values.push(event.name);
                            isCommaNeeded = true;
                        };
                        if(event.description != null){
                            if(isCommaNeeded == true) SQL += ", ";
                            SQL += " description = ?";
                            values.push(event.description);
                            isCommaNeeded = true;
                        };
                        if(event.location != null){
                            if(isCommaNeeded == true) SQL += ", ";
                            SQL += " location = ?";
                            values.push(event.location);
                            isCommaNeeded = true;
                        };
                        if(event.start !== null && event.start !== undefined){
                            if(isCommaNeeded == true) SQL += ", ";
                            SQL += " start_date = ?";
                            values.push(event.start);
                            isCommaNeeded = true;
                        };
                        if(event.close_registration != null){
                            if(isCommaNeeded == true) SQL += ", ";
                            SQL += " close_registration = ?";
                            values.push(event.close_registration);
                            isCommaNeeded = true;
                        };
                        if(event.max_attendees != null){
                            if(isCommaNeeded == true) SQL += ", ";
                            SQL += " max_attendees = ?";
                            values.push(event.max_attendees);
                            isCommaNeeded = true;
                        };

                        SQL += " WHERE event_id = ?";
                        values.push(event_id);
                        
                        if(values.length > 1) { //check if the user entered something that can be updated, which as above, is anything from name up to and not the event category and category description
                            for(let i = 0; i < values.length; i++) { //read through the user inputs
                                if(typeof values[i] === "string") {
                                    values[i] = filter.clean(values[i]); //clean them from bad words
                                };
                            };
    
                            events.updateEvent(SQL, values, (err) => { //update the event with whatever values the user entered that formed the SQL statement into actually updating at least 1 value
                                if(err) return res.sendStatus(404);
                                else return res.sendStatus(200); //or just return and the event was updated just fine
                            });
                        }
                        else { //the category and category_description are not added to the values, so it never reads them if they are not entered in combination with something else that gets added to the values array
                            if(category || category_description != null) {
                                events.addCategory(event_id, category, category_description, (err, category_id) => {
                                    if(err) return res.status(500).send(err);
                                    return res.status(201).send({category_id: category_id});
                                });
                            }
                        }
                    };
                }
            });
        } else return res.sendStatus(404);
    });
};

const attend_event = (req, res) => {
    const event_ID = parseInt(req.params.event_id);
    let user_id = req.user_id.user_id;

    events.getEventByID(event_ID, (err, event) => { //find the event
        if(err) return res.sendStatus(404);
        if(event){
            if(event['creator_id'] != null) { //see if the user is the creator
                creator_id = event['creator_id'];
                event_capacity = event['max_attendees'];
                close_registration = event['close_registration'];
                if(creator_id == user_id) { //if so, forbiden
                    return res.status(403).send({error_message: "You are already registered"}); //the user is already registered to the event as they are the event creator
                }

                let event_attendees = 0;
                events.getAttendeesCount(event_ID, (err, row) =>{
                    if(err) return res.status(404).send({error_message: err.message});
                    //if(!row) return res.status(404).send({error_message: "No event was found."});
                    if(row) event_attendees = row['COUNT(*)']; //this is the number of attendees that are registered for the event in the database

                    if(event_attendees < event_capacity - 1) { //check if the capacity has been reached for this event
                        
                        if(close_registration != -1 && close_registration / 1000 > Math.round(Date.now() / 1000)){
                            
                            let values = [event_ID, user_id];
                            events.hasUserRegisteredForEvent(values, (err, row) => {
                                if(err) return res.status(404).send({error_message: err.message});
                                if(!row) return res.status(404).send({error_message: "No event was found."});
                                let registered = row['COUNT(*)'];

                                //if the user appears as registered to this event more than 0 times; it would only be 1 for this system, the user cannot register again.
                                if(registered > 0) return res.status(403).send({error_message: "You are already registered"});
                                else {
                                    events.attendEvent(event_ID, user_id, (err) => {
                                        if(err) return res.status(404).send({error_message: err.message});
                                        return res.sendStatus(200);
                                    });
                                };
                            });
                        } else return res.status(403).send({error_message: "Registration is closed"});
                    } else return res.status(403).send({error_message: "Event is at capacity"});
                }
            )};
        } else return res.status(404).send({error_message: "Not Found"});
    });
};

const delete_event = (req, res) => {
    const event_ID = parseInt(req.params.event_id);

    events.getEventByID(event_ID, (err, event) => { //find the event
        if(err) return res.status(404).send({error_message: err.message});
        if(event){ //if the event exists, you can move on
            if(event['creator_id'] != req.user_id.user_id) return res.status(403).send({error_message: "You can only delete your own events"}); //if you are not the creator, you can't delete an event
            else {
                events.deleteEvent(event_ID, (err) => {
                    if(err) return res.status(404).send({error_message: err.message});
                    return res.status(200).send({close_registration: -1});
                });
            };
        } else return res.status(404).send({error_message: "Event does not exist"}); //otherwise, you cannot delete an event if it does not exist
    });
};

const search_event = (req, res) => {
    //search accepts a query, followed by a status, and limit and offset, in any order, it can also run each separately

    let schema = Joi.object({
        q: Joi.string().uppercase().min(4),
        status: Joi.string().valid('MY_EVENTS', 'ATTENDING', 'OPEN', 'ARCHIVE'),
        limit: Joi.number().min(0),
        offset: Joi.number().min(0),
        category: Joi.string().min(6)
    });

    let q = req.query.q;
    let status = req.query.status;
    let limit = isNaN(req.query.limit) ? 20 : parseInt(req.query.limit); //ternary operators to ensure if there is an actual number input value, then it can be used
    let offset = isNaN(req.query.offset) ? 0 : parseInt(req.query.offset); //otherwise assign the default value manually, as the joi schema validation would require a number input at all times, even if not required
    let category = req.query.category;

    let request = {
        q: q,
        status: status,
        limit: limit,
        offset: offset,
        category: category
    };

    let user_id;
    const { error } = schema.validate(request);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    let values = [];

    if(category) { //search events by category name, matching similar names without case sensitivity
        events.searchEventsByCategory(category, (err, eventsByCategory) => {
            if(err) return res.status(404).send({error_message: err});
            else return res.status(200).send({eventsByCategory: eventsByCategory});
        })
    }
    else { //needs to be inside the else block otherwise it tries to run the below code even if it sets any status from above and throws error for trying to set a new header after it was already set
        if(!status) {
            q ? values.push(q, limit, offset) : values.push(limit, offset);
            events.searchEvents(values, (err, eventResult) => {
                if(err) return res.status(404).send({error_message: err});
                if(eventResult) return res.status(200).send(eventResult);
                else {
                    eventResult = [];
                    return res.status(200).send(eventResult);
                }
            });
        };
        if(status == "OPEN") {
            q ? values.push(q, limit, offset) : values.push(limit, offset);
            events.searchOpenEvents(values, (err, eventResult) => {
                if(err) return res.status(404).send({error_message: err});
                if(eventResult) return res.status(200).send(eventResult);
                else {
                    eventResult = [];
                    return res.status(200).send(eventResult);
                }
            });
        };
        if(status == "ARCHIVE") {
            events.searchArchived(limit, (err, archivedEvents) => {
                if(err) return res.status(404).send({error_message: err});
                return res.status(200).send(archivedEvents);
            });
        };
        users.getIDFromToken(req.get('X-Authorization'), (err, row) => {
            if(row) user_id = row.user_id;
    
            if(!user_id && (status == "MY_EVENTS" || status == "ATTENDING")) {
                return res.status(400).send({error_message: "You are not authenticated."});
            }
            if(user_id) {
                if(status == "MY_EVENTS") {
                    events.searchMyEvents(user_id, (err, myEvents) => {
                        if(err) return res.sendStatus(404);
                        if(!myEvents) return res.status(404).send({error_message: "You currently have no events"});
                        return res.status(200).send(myEvents);
                    });
                }
                if(status == "ATTENDING") {
                    events.searchMyAttendingEvents(user_id, (err, myAttendingEvents) => {
                        if(err) return res.status(404).send({error_message: err});
                        return res.status(200).send(myAttendingEvents);
                    });
                };
            };
        });
    }
};

module.exports = {
    create_event: create_event,
    get_categories: get_categories,
    get_event: get_event,
    update_event: update_event,
    attend_event: attend_event,
    delete_event: delete_event,
    search_event: search_event
};