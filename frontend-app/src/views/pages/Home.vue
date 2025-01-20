<template>
    <h1 class="page-title">welcome to eventbrite!</h1>
    <div class="main-cards">
        <div class="card cards" style="width: 18rem;">
            <div class="card-body">
                <p class="card-text">find events you could be interested in.<br />Look for the different categories,<br />search by name, find the one most suited to you!</p>
            </div>
        </div>

        <div class="card cards" style="width: 18rem;">
            <div class="card-body">
                <p class="card-text">have a question about an event? want to publish a question directly to the event's author?<br />You can do so easily! post a question from<br />the event's own page</p>
            </div>
        </div>

        <div class="card cards" style="width: 18rem;">
            <div class="card-body">
                <p class="card-text">did you find a comment relevant or interesting?<br />want to share your view on it? upvote it! or don't..</p>
            </div>
        </div>
    </div>

    <h2 v-if="categories.length > 0">Choose By Category</h2>
    <h2 v-else>There are no event categories, why not create one? click 'create an event'</h2>
    <div class="categories-container">
        <div class="card categories-card" style="width: 18rem;" v-for="item in categories">
            <div class="card-body">
                <h5 class="card-title"><i>{{ item.category }}</i></h5>
                <p class="card-text">{{ item.description }}</p>
                <a href="#" class="btn btn-primary" v-on:click="searchByCategory(item.category)">Find '{{ item.category }}' events</a>
            </div>
        </div>
    </div>

    <h2 id="no-random-events-title">If you create an event, it might show underneath me!</h2>
    <div class="container" v-if="events != ''">
        <Event class="grid-item" v-for="(item, index) in events" :key="index"
        :event_id="item.event_id"
        :name="item.name"
        :description="item.description"
        :location="item.location"
        />
    </div>
</template>

<script>
    import { eventsService } from "../../services/events.service";
    import Event from "../components/EventComponent.vue";
    import router from "../../router/index";

    export default {
        data() {
            return {
                events: "",
                categories: []
            }
        },
        methods: {
            searchByCategory(category) { //if the user searches by category
                router.push("/search?category=" + category); //the search will happen once in the search page, the page will check if there is a category in the URL, if so show all results
            }
        },
        mounted() {
            //get events with limit 3
            eventsService.searchByLimitAndOffset(3, Math.random() * 48) //select 3 events after an offset by a random number between 0 and 47, start is inclusive but not end, to get a different random event every time the page's DOM Tree is loaded
            .then(response => this.events = response)
            .catch(error => "")

            eventsService.getCategories()
            .then(response => this.categories = response.categories)
            .catch(error => console.log(error))
        },
        components: {
            Event
        }
    }
</script>

<style scoped>

@media (max-width: 1100px) {
    .main-cards{
        width: 75% !important;
    }

    .categories-container{
        grid-template-columns: repeat(2, 1fr) !important;
        width: 70% !important;
        margin-right: auto !important;
        margin-left: auto !important;
    }
}

@media (max-width: 768px) {
    .page-title{
        font-size: 4vw !important;
    }

    .container{
        grid-template-columns: repeat(1, 1fr) !important;
        row-gap: 2vh;
    }

    .main-cards{
        width: 80% !important;
    }

    .categories-container{
        grid-template-columns: repeat(2, 1fr) !important;
        width: 80%;
        margin: 15vh auto !important;
        align-items: center;
        justify-items: center;
    }

    .categories-card{
        width: 100% !important;
        font-size: 1.3vw !important;
    }

    .categories-card .card-title{
        font-size: 3vw !important;
    }

    .categories-card .card-body{
        font-size: 2vw !important;
    }
    
    h2{
        font-size: 3vw !important;
    }
}

@media (max-width: 500px) {
    .main-cards{
        width: 85% !important;
        font-size: 1.5vw !important;
    }

    .categories-container{
        grid-template-columns: repeat(1, 1fr) !important;
    }
}

.main-cards{
    text-transform: capitalize;
    width: 50%;
    height: auto;
    overflow: hidden;
    margin: 15vh auto auto;
    display: flex;
    justify-content: space-between;
}

.main-cards .cards{
    border: 2px solid #ADD8E6;
    height: auto;
    text-align: center;
    line-height: 4vh;
    margin-left: 1.5vw;
    color: #485696;
    background-color: #D3F8E2;
}

.page-title, h2{
    margin-top: 7vh;
    text-transform: capitalize;
    text-align: center;
    color: orange;
}

h2{
    margin-top: 15vh;
}

#no-random-events-title{
    margin-top: 10vh;
    margin-bottom: 10vh;
}

.categories-container{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 70%;
    margin: 12.5vh auto auto;
    column-gap: 4vw;
    row-gap: 5vh;
}

.card-body{
    text-transform: capitalize;
}

.categories-card{
    border: 5px solid brown;
    font-size: 1vw;
    text-align: center;
    box-shadow: 0 3vh 0vh brown;
    height: 100%;
}

.categories-card .btn-primary{
    font-size: 0.8vw;
}

.container{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 2px solid darkmagenta;
    width: 70%;
    padding: 1vw;
    text-align: center;
    margin: 20vh auto;
    box-shadow: 0 1vh 5vh darkmagenta;
}

.grid-item{
    width: 85%;
    margin: 0 auto;
}

</style>