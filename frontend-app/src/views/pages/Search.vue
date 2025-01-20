<template>
    <h1 v-if="searchQuery">{{ results.length }} Results for '{{ searchQuery }}'</h1>
    <h1 v-if="!searchQuery && results != ''">{{ results.length }} Results for Events In The Category Of '{{ searchCategory }}'</h1>
    <h1 v-if="results != ''">Here are all events</h1>
    <div id="events-grid" v-if="results != ''"> <!-- If the events loaded on DOM Tree load, but the array of events searched by status is empty, then load all events without search parameters -->
        <Event class="grid-item" v-for="(item, index) in results" :key="index"
        :event_id="item.event_id"
        :name="item.name"
        :description="item.description"
        :location="item.location"
        :start_date="item.start_date"
        />
    </div>
</template>

<script>
    import { eventsService } from "../../services/events.service";
    import Event from "../components/EventComponent.vue";
    import router from "../../router/index.js";

    export default {
        data() {
            return {
                results: "",
                error_message: "",
                searchQuery: "",
                searchCategory: ""
            }
        },
        mounted() {
            let query  = router.currentRoute.value.query.q;
            this.searchQuery = query;
            let category = router.currentRoute.value.query.category;
            this.searchCategory = category;

            if(!query) {
                if(category) {
                    eventsService.searchByCategory(category)
                    .then(response => this.results = response.eventsByCategory)
                    .catch(error => this.error_message = error)
                }
                else {
                    eventsService.searchEvent()
                    .then(response => this.results = response.data)
                    .catch(error => this.error_message = error.response.data)
                }
            }
            else {
                eventsService.searchByQueryString(query)
                .then(response => this.results = response)
                .catch(error => this.error_message = error.response.data)
            }
        },
        components: {
            Event
        }
    }
</script>

<style scoped>

@media (max-width: 768px){
    h1{
        font-size: 4vw !important;
    }

    #events-grid{
        grid-template-columns: repeat(2, 1fr) !important;
    }
}

@media (max-width: 530px){
    h1{
        font-size: 4vw !important;
    }

    #events-grid{
        grid-template-columns: repeat(1, 1fr) !important;
    }
}

h1{
    color: orange;
    text-align: center;
    font-size: 1.8vw;
    margin-top: 5vh;
    text-transform: capitalize;
}

#events-grid{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    margin: 10vh auto auto auto;
    width: 80%;
    padding: 1vw;
    height: auto;
    text-align: center;
    row-gap: 10vh;
    box-shadow: 0 1vh 10vh black;
}

#events-grid .grid-item{
    width: 85%;
    margin-top: 0;
    padding: 1vw;
}

</style>