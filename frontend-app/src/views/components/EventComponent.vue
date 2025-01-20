<template>
    <div v-on:click="redirect()" class="event-box shadow-lg p-3 mb-5 bg-body-tertiary rounded">
        <div class="event-title-box"> <!-- Loop through the array of results from the get request -->
            {{ name }}
        </div>

        <div v-if="description">
            <p><u>Description</u></p>
            <div class="properties-box" id="description">{{ description }}</div>
        </div>

        <div v-if="location">
            <p><u>Location</u></p>
            <div class="properties-box" id="location">{{ location }}</div>
        </div>

        <div v-if="start_date">
            <p><u>Start Date</u></p>
            <div class="properties-box" id="start-date">{{ new Date(start_date).toDateString() }}</div>
        </div>

        <div v-if="start_date">
            <p><u>Start Time</u></p>
            <div class="properties-box" id="start-time">{{ new Date(start_date).toLocaleTimeString() }}</div>
        </div>

        <div v-if="close_registration"> <!-- Only show the close registration value in certain pages where it is passed as a parameter to the component -->
            <p><u>Close Registration</u></p>
            <div class="properties-box" id="close-registration">{{ new Date(close_registration).toDateString() }}</div>
        </div>

        <div v-if="max_attendees"> <!-- Only show the close registration value in certain pages where it is passed as a parameter to the component -->
            <p><u>Maximum Attendees</u></p>
            <div class="properties-box" id="max-attendees">{{ max_attendees }}</div>
        </div>

        <div v-if="number_attending">
            <p><u>Number Of People Attending</u></p>
            <div class="properties-box" id="number_attending">
                {{ number_attending }}
            </div>
        </div>

    </div>
</template>

<script>
    import router from "../../router/index.js";

    export default {
        props: {
            event_id: Number,
            name: String,
            description: String,
            location: String,
            start_date: Number,
            close_registration: Number,
            max_attendees: Number,
            number_attending: Number
        },
        methods: {
            redirect() { //this function checks if the user is already in a single event's own page and tries to click on the event, which does not redirect them anywhere.
                if(router.currentRoute.value.fullPath !== "/event/" + this.event_id) { //to prevent this, the program will check if the user is in a single event's own page or not, and redirect if not
                //this is because this component is used in the events page, where the user can click on any event component displayed and enter the event's own page - this page, but shouldn't happen when they are already in one
                    router.push("/event/" + this.event_id);
                }
            }
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    .event-title-box{
        font-size: 2vw !important;
    }

    p{
        font-size: 3vw !important;
    }

    .properties-box{
        font-size: 2.5vw !important;
    }
}

.event-box{
    border: 5px solid black;
    height: auto;
    margin: 15vh auto auto;
    width: 45%;
    padding: 1.2vw;
    text-transform: capitalize;
}

.event-title-box{
    border: 5px solid red;
    width: fit-content;
    margin: auto;
    font-size: 1.5vw;
    padding: 0.3vw;
}

p{
    margin-top: 6vh;
    font-size: 1.3vw;
}

.properties-box{
    border: 5px solid orange;
    margin: 2vh 0;
    width: fit-content;
    font-size: 1.2vw;
    padding: 0.7vw;
}

</style>