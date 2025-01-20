const events = require("../controllers/event.server.controller");
const auth = require("../lib/authentication");

module.exports = function(app){
    app.route("/events")
        .post(auth.isAuthenticated, events.create_event);
    
    app.route("/event/:event_id")
        .get(events.get_event)
        .patch(auth.isAuthenticated, events.update_event)
        .post(auth.isAuthenticated, events.attend_event)
        .delete(auth.isAuthenticated, events.delete_event);
    
    app.route("/events/categories")
        .get(events.get_categories)
        
    app.route("/search")
        .get(events.search_event);
};