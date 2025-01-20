<template>
    <h1>updating this event</h1>
    <h3 v-if="eventOnLoad">just For reference</h3>
    <div class="event-box" v-if="eventOnLoad" v-for="(item, index) in eventOnLoad" :key="index">
        <Event id="event"
        :name="item.name"
        :description="item.description"
        :location="item.location"
        :start_date="item.start"
        :close_registration="item.close_registration"
        :max_attendees="item.max_attendees"
        />
    </div>

    <h2>Just enter any new information</h2>
    <form @submit.prevent="checkFormInput()">
        <div class="event-info-input-box">
            <label for="name">event's name:</label>
            <input type="text" id="name" placeholder="Name" v-model="inputEvent.name"/>
        </div>
        <div class="event-info-input-box">
            <label for="description">event's description:</label>
            <input type="text" id="description" placeholder="Description" v-model="inputEvent.description"/>
        </div>
        <div class="event-info-input-box">
            <label for="location">event's location:</label>
            <input type="text" id="location" placeholder="Location" v-model="inputEvent.location"/>
        </div>
        <div class="event-info-input-box">
            <label for="start">event's start date:</label>
            <input type="date" id="start" placeholder="Start Date" v-model="inputEvent.start"/>
        </div>
        <div class="event-info-input-box">
            <label for="close_registration">event's close registration:</label>
            <input type="date" id="close_registration" placeholder="Close Registration" v-model="inputEvent.close_registration"/>
        </div>
        <div class="event-info-input-box">
            <label for="max-attendees">event's maximum attendees:</label>
            <input type="text" id="max-attendees" placeholder="Maximum Attendees" v-model="inputEvent.max_attendees"/>
        </div>
        <div class="event-info-input-box">
            <label for="category">event's category:</label>
            <input type="text" id="category" placeholder="Category" v-model="inputEvent.category"/>
        </div>
        <div class="event-info-input-box">
            <label for="category_description">category's description:</label>
            <input type="text" id="category_description" placeholder="Category Description" v-model="inputEvent.category_description"/>
        </div>
        <button type="submit" id="submit-new-event-button" v-on:click="updateEvent()">update this event</button>
    </form>
    <div v-if="error_message" class="message-box">{{ error_message }}</div>
    <div v-if="!error_message && success_message" class="message-box" id="success-box">{{ success_message }}</div>
</template>

<script>

    import { eventsService } from "../../services/events.service";
    import Event from "../components/EventComponent.vue";
    import router from "../../router/index.js";

    export default {
        data() {
            return {
                eventOnLoad: [],
                inputEvent: {
                    name: '',
                    description: '',
                    location: '',
                    start: '',
                    close_registration: '',
                    max_attendees: '',
                    category: "",
                    category_description: ""
                },
                error_message: "",
                success_message: ""
            }
        },
        methods: {
            checkFormInput() {
                //check for the form not being empty, sending a message for error, and converting the date input into milliseconds, ready to be sent to the database, which expects an epoch time value
                if(!(this.inputEvent.name || this.inputEvent.description || this.inputEvent.location || this.inputEvent.start || this.inputEvent.close_registration || this.inputEvent.max_attendees || this.inputEvent.category || this.inputEvent.category_description)) {
                    this.error_message = "Please enter any detail about the event in order to update it.";
                    return;
                }
                if(this.close_registration && !this.start) {
                    this.error_message = "a start date is required for the event to be updated";
                    return;
                }
            },
            updateEvent() {
                this.error_message = "";
                this.success_message = "";

                let newEvent = {}; //object to contain all the data that was input by the user

                //iterate through the object of expected values, if they exist - not null, undefined, '' etc., add them to the new object ready to be sent for event update
                for(const key in this.inputEvent) {
                    if(this.inputEvent[key]) {
                        if(key === "start" || key === "close_registration") {
                            this.inputEvent[key] = Date.parse(this.inputEvent[key]);
                        }
                        newEvent[key] = this.inputEvent[key];
                    }
                }

                if(Object.keys(newEvent).length != 0) {

                    eventsService.updateEvent(this.event_id, newEvent, localStorage.getItem("X-Authorization"))
                    .then(response => {
                        this.success_message = "Your event has been updated successfully. redirecting you soon."
                        setTimeout(() => {
                            this.success_message = "";
                            router.push("/event/" + this.event_id);
                        }, 6000);
                    })
                    .catch(error => this.error_message = error.response.data)
                }

            }
        },
        mounted() {
            eventsService.getSingleEvent(router.currentRoute.value.params.event_id)
            .then(response => {
                this.eventOnLoad.push(response);
                this.event_id = response.event_id;
            })
            .catch(error => this.error_message = error.response.data.error_message)
        },
        components: {
            Event
        }
    }
</script>

<style scoped>

@media (max-width: 768px){
    h1{
        margin-top: 3vh !important;
        font-size: 2vh !important;
    }

    h2{
        margin-left: 35% !important;
        font-size: 3vw !important;
    }

    h3{
        font-size: 2vw !important;
        max-width: 16% !important;
    }

    form{
        margin-left: 30% !important;
    }

    .event-box{
        width: 40% !important;
    }

    .event-info-input-box{
        width: 90% !important;
        font-size: 1.5vw !important;
    }

    #submit-new-event-button{
        font-size: 1.5vw !important;
    }
}

@media (max-width: 530px){
    h1{
        font-size: 1.3vh !important;
    }

    h3{
        font-size: 3vw !important;
        max-width: 23% !important;
    }

    .event-box{
        width: 47.5% !important;
    }

    .event-info-input-box{
        width: 90% !important;
        font-size: 1.2vw !important;
    }
}

h1{
    margin-top: 7vh;
    text-transform: capitalize;
    color: orange;
    text-align: center;
    line-height: 6vh;
    font-size: 1.5vw;
}

h3{
    color: orange;
    font-size: 1.5vw;
    text-transform: capitalize;
    position: absolute;
    border: 5px solid red;
    position: relative;
    top: 3vh;
    width: fit-content;
    padding: 0.6vw;
    margin-left: 1vw;
}

h2{
    color: orange;
    text-transform: capitalize;
    font-size: 1.5vw;
    margin-left: 40vw;
}

#event{
    float: left;
    width: 14%;
    margin: 3vh auto 2vh 1vw;
}

form{
    border: 4px solid darkcyan;
    text-align: center;
    width: 55%;
    margin: 3vh auto auto 23%;
    font-size: 1.1vw;
    box-shadow: 0 1vh 5vh darkcyan;
} 

.event-info-input-box{
    width: 45%;
    display: block;
    margin: 3vh auto 5vh;
    border: 5px solid blue;
    text-transform: capitalize;
    overflow: auto;
    padding: 8px;
}

.event-info-input-box label{
    float: left;
}

input{
    float: right;
}

#submit-new-event-button{
    margin-bottom: 3vh;
    text-transform: capitalize;
    border-radius: 8px;
    font-size: 1vw;
    background-color: #DDFF44;
}

::placeholder{
    text-transform: capitalize;
}

.message-box{
    border: 5px solid red;
    margin: 3vh auto auto 45%;
    max-width: 25%;
    padding: 10px;
    font-size: 1vw;
    text-transform: capitalize;
    text-align: center;
}

#success-box{
    border: 5px solid green;
    margin: 3vh auto auto 45%;
    max-width: 25%;
    padding: 10px;
    font-size: 1vw;
    text-align: center;
}

#categories{
    display: flex;
    position: relative;
    margin-top: 40vh;
    margin-bottom: 5vh;
}

</style>