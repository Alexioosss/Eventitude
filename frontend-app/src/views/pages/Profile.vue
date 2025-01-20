<template>
    <h1>welcome to your profile</h1>

    <h2>You currently have: {{ attendingEvents }} events to attend.</h2>

    <EventDrafts />

    <QuestionDrafts />
</template>

<script>
    import { eventsService } from "../../services/events.service";
    import EventDrafts from "../components/EventDraftsComponent.vue";
    import QuestionDrafts from "../components/QuestionDraftsComponent.vue";

    export default {
        data() {
            return {
                attendingEvents: 0
            }
        },
        mounted() {
            eventsService.searchByStatus("ATTENDING", localStorage.getItem('X-Authorization'))
            .then(response => this.attendingEvents = response.length)
            .catch(error => console.log(error))
        },
        components: {
            EventDrafts,
            QuestionDrafts
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    h1, h2{
        margin-top: 2vh !important;
        font-size: 3vw !important;
    }
}

h1, h2{
    color: orange;
    text-align: center;
    text-transform: capitalize;
    margin-top: 10vh;
}

</style>