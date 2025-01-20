<template>
    <div class="event-box" v-if="event != ''">

        <Event
        :event_id="event.event_id"
        :name="event.name"
        :description="event.description"
        :location="event.location"
        :start_date="event.start"
        :close_registration="event.close_registration"
        :max_attendees="event.max_attendees"
        :number_attending="event.number_attending"
        :attendees="event.attendees"
        />

        <!-- The questions array was originally reversed in the backend, so reversing it again to show them in the order they were originally asked (1 to ...) -->
        <Questions v-for="(item, index) in event.questions.slice().reverse()" :key="index"
        :question_id="item.question_id"
        :question="item.question"
        :asked_by="item.asked_by"
        :votes="item.votes"
        />

        <h2 v-if="event.attendees && user_id">Who's Attending</h2>
        <h2 v-if="!event.attendees && user_id">No one is currently attending this event..</h2>
        <Attendees v-for="(item, index) in event.attendees" :key="index"
        :user_id="item.user_id"
        :first_name="item.first_name"
        />

        <h3 v-if="!noCategory">What categories does this event fall into</h3>
        <Categories v-if="!noCategory" v-for="(item, index) in event.categories" :key="index"
        :category_id="item.category_id"
        :category="item.category"
        :category_description="item.category_description"
        />

        <div id="dividing-line"></div>

        <div id="post-a-question-box" v-if="user_id != creator_id">
            <span>would you like to ask something?</span>
            <br />
            <button type="submit" id="ask-question-button" v-on:click="askQuestion()">ask it!</button>
        </div>

        <div v-if="success_message" class="voting-message-box" id="success-voting-box">{{ success_message }}</div>
        <div v-if="error_message" class="voting-message-box"><u>{{ error_message }}</u></div>
        <div v-if="not_authenticated_message" class="voting-message-box"><u>{{ not_authenticated_message }}</u></div>

        <button class="interactivity-button" id="register-button" v-if="user_id != creator_id"v-on:click="registerUser()">Register on this event!</button>
        <button class="interactivity-button" id="delete-event-button" v-if="user_id == creator_id && !(archived_error_message || success_message)" v-on:click="deleteEvent()">Delete this event</button>
        <button class="interactivity-button" id="update-event-button" v-if="user_id == creator_id && !(archived_error_message || success_message)" v-on:click="updateEvent()">Update this event</button>
    </div>
    <h1 v-else>{{ archived_error_message }}.<br />Redirecting you to the events page now.</h1>
</template>

<script>
    import { eventsService } from "../../services/events.service";
    import Event from "../components/EventComponent.vue";
    import Questions from "../components/QuestionComponent.vue";
    import Attendees from "../components/AttendeesComponent.vue";
    import Categories from "../components/CategoriesComponent.vue";
    import router from "../../router/index";

    export default {
        data() {
            return {
                event: "",
                archived_error_message: "",
                error_message: "",
                not_authenticated_message: "",
                success_message: "",
                event_id: null,
                creator_id: null,
                user_id: null,
                noCategory: ""
            }
        },
        methods: {
            askQuestion() {
                if(!this.event_id) this.error_message = "Unfortunately, you cannot ask a question for this event at the moment.";
                else router.push("/event/" + this.event_id + "/question"); //redirect to the ask question page.
            },
            registerUser() {
                this.error_message = "";
                this.not_authenticated_message = "";
                this.success_message = "";

                eventsService.registerUserToEvent(this.event_id, localStorage.getItem('X-Authorization'))
                .then(response => {
                    this.success_message = "You have been successfully registered to this event!";
                    setTimeout(() => {this.success_message = ""}, 5000);
                })
                .catch(error => {
                    this.not_authenticated_message = error.response.data.error_message;
                    setTimeout(() => {this.not_authenticated_message = ""}, 5000);
                })
            },
            deleteEvent() {
                eventsService.deleteEvent(this.event_id, localStorage.getItem("X-Authorization"))
                .then(response => {
                    this.success_message = "The event has been deleted successfully. Redirecting you now.";
                    setTimeout(() => {router.push("/events")}, 5000);
                })
                .catch(error => this.error_message = error.response.data.error_message)
            },
            updateEvent() {
                router.push("/event/" + this.event_id + "/update");
            }
        },
        mounted() {
            //console.log(router.currentRoute.value.params.event_id); //this looks at the current route, and in the value field there is a params object with the url and its parameters
            this.user_id = localStorage.getItem("user_id");

            eventsService.getSingleEvent(router.currentRoute.value.params.event_id, localStorage.getItem('X-Authorization'))
            .then(response => {
                if(response.close_registration == -1){
                    //archived event
                    this.archived_error_message = "this event has been archived";
                    setTimeout(() => {router.push("/events").then(() => router.go(0))}, 5000);
                    return;
                }
                this.event = response;
                this.event_id = response.event_id;
                this.creator_id = response.creator.creator_id;

                response.categories.forEach(element => element.category_id === null ? this.noCategory = true : this.noCategory = false); //check if the event has a category associated with it, which will be null due to the left join in the backend
            })
            .catch(error => {
                if(error.response.status === 404){ //if the user entered a wrong event id, therefore the server returned a 404 because it can't find this event in the database
                    this.error_message = error.response.data.error_message; //show the resulting error message to the user
                    setTimeout(() => {router.push("/events")}, 6000); //redirect the user to the events page as they couldn't find the event they were looking for
                }
                else { //show any other error that comes back from the server
                    this.error_message = error.response.data.error_message;
                }
            })
        },
        components: {
            Event,
            Questions,
            Attendees,
            Categories
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    h2, h3{
        font-size: 3vw !important;
    }

    #post-a-question-box{
        font-size: 3vw !important;
    }

    #ask-question-button{
        font-size: 2vw !important;
    }
}

.event-box{
    height: auto;
    margin: 15vh auto auto;
    width: 95%;
    box-shadow: 0 2vh 5vh gray;
}

.event-title-box{
    border: 5px solid red;
    width: fit-content;
    margin: auto;
    font-size: 1.5vw;
    padding: 0.6vw;
}

p{
    margin-top: 6vh;
    font-size: 1.3vw;
}

#post-a-question-box{
    border: 5px solid orange;
    width: fit-content;
    font-size: 1.2vw;
    text-transform: capitalize;
    padding: 1vw;
    margin: 15vh auto 3vh 2.5vw;
}

#ask-question-button{
    margin: 2vh auto 0 0;
}

.properties-box{
    border: 5px solid orange;
    margin-top: 2vh;
    max-width: 90%;
    width: fit-content;
    font-size: 1.2vw;
    padding: 0.7vw;
}

.voting-message-box{
    font-size: 1.2vw;
    margin: 5vh 0 0 1vw;
    text-transform: capitalize;
    border: 5px solid red;
    padding: 1vw;
    line-height: 5vh;
    width: fit-content;
}

#success-voting-box{
    border: 5px solid green;
}

h1{
    text-transform: capitalize;
    color: orange;
    text-align: center;
    margin: 5vh auto;
    line-height: 6vh;
}

h2{
    margin-left: 2.5vw;
    margin-top: 5vh;
    position: relative;
    text-transform: capitalize;
    text-decoration: underline;
    font-size: 1.2vw;
    color: #C05780;
}

h3{
    color: darkturquoise;
    margin-top: 10vh;
    margin-left: 2.5vw;
    font-size: 1.2vw;
    text-decoration: underline;
    text-transform: capitalize;
}

#dividing-line{
    border: 2px solid black;
    width: 70%;
    margin: 15vh auto 15vh;
}

button{
    border-radius: 15px;
    padding: 8px;
    font-size: 1vw;
    text-transform: capitalize;
    background-color: #ddff44;
    margin: 5vh auto 5vh 2.5vw;
}

#delete-event-button{
    background-color: #3CDDA7;
    color: black;
}

#update-event-button{
    float: right;
    margin-right: 2vw;
}

</style>