<template>
    <form id="createEventForm" @submit.prevent="checkFormInput()">

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Event's Name</span>
            <input type="text" class="form-control" placeholder="what will it be called" aria-label="Username" aria-describedby="basic-addon1" v-model="name">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Description</span>
            <input type="text" class="form-control" placeholder="what is it about" aria-label="Username" aria-describedby="basic-addon1" v-model="description">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Location</span>
            <input type="text" class="form-control" placeholder="where will it take place" aria-label="Username" aria-describedby="basic-addon1" v-model="location">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Start Date</span>
            <input type="date" class="form-control" placeholder="when will it take palce" aria-label="Username" aria-describedby="basic-addon1" v-model="start">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Close Registration</span>
            <input type="date" class="form-control" placeholder="when is the last day to register" aria-label="Username" aria-describedby="basic-addon1" v-model="close_registration">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Max. Attendees</span>
            <input type="number" class="form-control" placeholder="what is the maximum capacity" aria-label="Username" aria-describedby="basic-addon1" v-model="max_attendees">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Category</span>
            <input type="text" class="form-control" placeholder="what is the event's category" aria-label="Username" aria-describedby="basic-addon1" v-model="category">
        </div>

        <div class="input-group mb-3">
            <span class="input-group-text" id="basic-addon1">Category Description</span>
            <input type="text" class="form-control" placeholder="give more details about the category" aria-label="Username" aria-describedby="basic-addon1" v-model="category_description">
        </div>

        <button type="submit" class="submit-new-event-button" v-on:click="createEvent()">create this event</button>
        <button type="submit" class="submit-new-event-button" id="draft-event-button" v-on:click="draftEvent()">draft this event</button>

    </form>

    <div v-if="error_message" class="message-box">{{ error_message }}</div>
    <div v-if="!error_message && success_message" class="message-box" id="success-box">{{ success_message }}</div>
</template>

<script>
    import { eventsService } from '../../services/events.service';
    import router from "../../router/index.js";

    export default {
        data() {
            return {
                name: '',
                description: '',
                location: '',
                start: '',
                close_registration: '',
                max_attendees: '',
                category: "",
                category_description: "",
                error_message: '',
                success_message: ''
            }
        },
        methods: {
            checkFormInput() {
                //check for the form not being empty, sending a message for error, and converting the date input into milliseconds, ready to be sent to the database, which expects an epoch time value
                if(!(this.name && this.description && this.location && this.start && this.close_registration && this.max_attendees && this.category && this.category_description)) {
                    this.error_message = "Please enter all the details about the event in order to create it.";
                    return;
                }
                if(!this.start) {
                    this.error_message = "a start date is required for the event to be created";
                    return;
                }
                if(!this.close_registration) {
                    this.error_message = "a close registration date is required for the event to be created";
                    return;
                }
            },
            createEvent() {
                let event = this.validInput();
                if(event) {
                    delete event.notParsedStart;
                    delete event.notParsedCloseRegistration;
                    eventsService.createEvent(event, localStorage.getItem('X-Authorization'))
                    .then(response => { //if the request was successful
                        this.success_message = "Your event has been created successfully.\nEvent ID: " + response.event_id + ". Redirecting you to its page now.";
                        setTimeout(() => {router.push("/event/" + response.event_id)}, 6000); //redirect the user to their event's page
                    })
                    .catch(error => {
                        if(error.status === 401) { //if the server returns a 401, which is only when the user is not authenticated in order to create an event
                            this.error_message = error.response.data + " Redirecting you to login now..."; //push the error message and display it on the page
                            setTimeout(() => {router.push("/login")}, 6000); //set a timer that waits 6000 milliseconds / 6 seconds, and then redirects the user to the login page through the router
                        } else this.error_message = error.response.data.error_message;
                    })
                }
            },
            draftEvent() {
                let arrayOfDrafts = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedEvents")) //try to get the array of drafted events for this user, if there were made any
                let toSend = this.validInput();

                if(toSend && !this.error_message) { //if the input is valid and there is no input error
                    //save the event as a draft in the local storage

                    toSend.start = toSend.notParsedStart;
                    delete toSend.notParsedStart;
                    toSend.close_registration = toSend.notParsedCloseRegistration;
                    delete toSend.notParsedCloseRegistration;
                    if(arrayOfDrafts) { //if there was an initial array of drafts for this user
                        arrayOfDrafts.push(toSend); //just add the new event to the array
                        localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedEvents", JSON.stringify(arrayOfDrafts)); //and store it, stringifying it
                    }
                    else { //otherwise the user did not make any drafts yet, therefore there is no array of draft objects in the local storage, so make one and inform of success
                        let event = [];
                        event.push(toSend);
                        localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedEvents", JSON.stringify(event)); //store the new array of drafts with the new event draft
                    }
                    //briefly show a message to inform the user of the successful drafting of the event
                    this.success_message = "Your event has been drafted successfully. It can be viewed in your profile section at any time.";
                    setTimeout(() => this.success_message = "", 5000);
                }
            },
            validInput() { //function to validate all data and return the object created with the data if it is all valid, otherwise sends a sensible error message for display
                let { name, description, location, start, close_registration, max_attendees, category, category_description } = this;
                let notParsedStart = start;
                let notParsedCloseRegistration = close_registration;
                start = Date.parse(start);
                close_registration = Date.parse(close_registration);
                this.error_message = "";

                //all checks are chained together so they need to pass one at a time for a user to view the next input's error message, or not, to finally be able to create the event
                if(name && name.length >= 4) {
                    if(description && description.length >= 15) {
                        if(location && location.length >= 4) {
                            if(start && start >= 63072000 && start > Date.now()) {
                                if(close_registration && close_registration < start && close_registration >= 63072000) {
                                    if(max_attendees && max_attendees > 1) {
                                        if(category && category.length >= 6) {
                                            if(category_description && category_description.length >= 15) {

                                                let { name, description, location, start, close_registration, max_attendees, category, category_description } = this;
                                                start = Date.parse(start);
                                                close_registration = Date.parse(close_registration);
                                                return Object.assign({}, {name, description, location, start, close_registration, max_attendees, category, category_description, notParsedStart, notParsedCloseRegistration}); //make all the form data input into an object to send to the database

                                            } else this.error_message = "category description must be at least 15 characters long"
                                        } else this.error_message = "category must be at least 6 characters long"
                                    } else this.error_message = "Max Attendees must be a number greater than 1";
                                } else this.error_message = "close registration must be before the start date";
                            } else this.error_message = "start date must not be today or in the past";
                        } else this.error_message = "Location must be at least 4 characters long";
                    } else this.error_message = "Description must be at least 15 characters long";
                } else this.error_message = "Name must be at least 4 characters long";
            }
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    form{
        width: 75% !important;
    }

    span{
        max-width: 25% !important;
        font-size: 2vw !important;
    }

    .submit-new-event-button{
        font-size: 3vw !important;
    }

    .form-control{
        font-size: 2vw !important;
    }
}

@media (max-width: 425px){
    span{
        max-width: 20% !important;
        font-size: 1.5vw !important;
        padding: 0 !important;
    }

    ::placeholder{
        font-size: 2vw !important;
    }
}

form{
    border: 5px solid black;
    text-align: center;
    width: 55%;
    margin: 5vh auto 5vh auto;
    font-size: 1.1vw;
    padding: 1vw;
    box-shadow: 0 1vh 5vh black;
}

span{
    background-color: turquoise;
    color: black;
}

::placeholder{
    text-transform: capitalize;
}

.submit-new-event-button{
    margin-bottom: 1vh;
    text-transform: capitalize;
    border-radius: 8px;
    font-size: 1vw;
    background-color: #DDFF44;
}

#draft-event-button{
    margin-left: 2vw;
}

.message-box{
    border: 5px solid red;
    margin: 3vh auto;
    width: fit-content;
    padding: 10px;
    font-size: 1vw;
    text-transform: capitalize;
}

#success-box{
    border: 5px solid green;
    margin: 3vh auto;
    width: fit-content;
    padding: 10px;
    font-size: 1vw;
}

</style>