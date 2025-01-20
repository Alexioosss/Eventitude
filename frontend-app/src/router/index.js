import { createRouter, createWebHistory } from 'vue-router';

import Home from "../views/pages/Home.vue"
import Login from "../views/pages/Login.vue"
import Logout from "../views/pages/Logout.vue"
import SingleEvent from "../views/pages/SingleEvent.vue"
import Events from "../views/pages/Events.vue"
import CreateEvent from "../views/pages/CreateEvent.vue"
import UpdateEvent from "../views/pages/UpdateEvent.vue"
import AskQuestion from "../views/pages/AskQuestion.vue"
import Signup from "../views/pages/Signup.vue"
import Profile from "../views/pages/Profile.vue"
import Search from "../views/pages/Search.vue";
import NotFound from "../views/pages/NotFound.vue"
import auth from "../services/auth.js"

const routes = [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/logout", component: Logout, beforeEnter: auth.isAuthenticated }, //before logging out, call the function checking for presence of session token in the local storage, redirecting to login if not
    { path: "/event/:event_id", component: SingleEvent },
    { path: "/events", component: Events },
    { path: "/event/:event_id/update", component: UpdateEvent },
    { path: "/createEvent", component: CreateEvent, beforeEnter: auth.isAuthenticated },
    { path: "/event/:event_id/question", component: AskQuestion, beforeEnter: auth.isAuthenticated },
    { path: "/signup", component: Signup },
    { path: "/profile", component: Profile },
    { path: "/search", component: Search },
    { path: "/:pathMatch(.*)*", component: NotFound } //match any other routing search that is not caught above, and show the NotFound page
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;