<template>
    <h1 v-if="!(events == '') && !error_message">{{ headTitle }}</h1>

    <ul class="nav flex-column">
        <span class="header">use one of the options below to filter through the different events</span>
        <li class="nav-item">
            <a class="nav-link" href="#">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" v-on:click="searchByStatus('MY_EVENTS'), headTitle = 'here are all your events, created by none other than yourself!'" />
                <label class="form-check-label" for="flexRadioDefault1">
                    My Events
                </label>
            </a>
            <a class="nav-link" href="#">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" v-on:click="searchByStatus('ATTENDING'), headTitle = 'here are all events you are attending, including the ones you are hosting'" />
                <label class="form-check-label" for="flexRadioDefault2">
                    Attending
                </label>
            </a>
            <a class="nav-link" href="#">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault3" v-on:click="searchByStatus('OPEN'), headTitle = 'here are all open events'" />
                <label class="form-check-label" for="flexRadioDefault3">
                    Open
                </label>
            </a>
            <a class="nav-link" href="#">
                <input class="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault4" v-on:click="searchByStatus('ARCHIVE'), headTitle = 'here are all archived events'" />
                <label class="form-check-label" for="flexRadioDefault4">
                    Archived
                </label>
            </a>
        </li>

        <button type="button" class="btn btn-success" v-on:click="resetEvents()">Reset Filters</button>
        <h3 v-if="error_message">{{ error_message }}</h3>
    </ul>

    <div v-if="!(events == '')" class="container"> <!-- If the events loaded on DOM Tree load, but the array of events searched by status is empty, then load all events without search parameters -->
        <Event class="grid-item" v-for="item in displayedEvents"
        :event_id="item.event_id"
        :name="item.name"
        :description="item.description"
        :location="item.location"
        :start_date="item.start_date"
        />
    </div>

    <nav aria-label="Page navigation example" v-if="events.length > 0">
        <ul class="pagination pagination-lg">
            <li class="page-item"><a class="page-link" href="#" v-if="currentPage!= 1" v-on:click="currentPage--">Previous</a></li>
            <li class="page-item"><a class="page-link" href="#" v-for="pageNumber in pages.slice(Math.max(currentPage - 1, 1), currentPage + 5)" v-on:click="currentPage = pageNumber">{{ pageNumber }}</a></li>
            <li class="page-item"><a class="page-link" href="#" v-if="currentPage < pages.length - 1" v-on:click="currentPage++">Next</a></li> <!-- Show the next button up until the last page number, after which do not show, there is no next page after the last page -->
        </ul>
    </nav>
    <h2 v-if="events == '' && !error_message">Sorry, couldn't load any events. Why not take this opportunity to create one? It will appear in this page once created!<br />Click 'create an event' at the top to get started</h2>
</template>

<script>
    import { eventsService } from "../../services/events.service";
    import Event from "../components/EventComponent.vue";

    export default {
        data() {
            return {
                headTitle: "Here are some events for you to explore",
                events: "",
                error_message: "",
                currentPage: 1,
                eventsPerPage: 9,
                pages: []
            }
        },
        methods: {
            getAllEvents() {
                eventsService.searchEvent() //load some events on DOM tree load for this page, only non-archived events to be shown
                .then(response => this.events = response)
                .catch(error => this.error = "");
            },
            searchByStatus(status) { //when clicking any radio button that searches by status
                this.error_message = "";
                eventsService.searchByStatus(status, localStorage.getItem("X-Authorization")) //load some events according to the status inputted by the user
                .then(response => this.events = response)
                .catch(error => this.error_message = error.response.data.error_message + " Please log in")
            },
            resetEvents() {
                this.error_message = "";
                this.events = ""; //set the list of results from either radio button to empty
                let radioButtons = document.querySelectorAll("input"); //find all input fields
                for(let i = 0; i < radioButtons.length; i++) {
                    if(radioButtons[i].type.toLowerCase() == "radio") { //if they are a radio button
                        if(radioButtons[i].checked == true) radioButtons[i].checked = false; //if they are also active, or checked, uncheck or disable them
                    }
                }
                this.headTitle = "here are some events for you to explore";

                //repopulate the list with all events
                this.getAllEvents();
            },
            setPagination() {
                let numberOfPages = Math.ceil(this.events.length / this.eventsPerPage);
                this.pages = [];
                for(let i = 0; i <= numberOfPages; i++) {
                    this.pages.push(i);
                }
            },
            paginate(events) {
                let from = (this.currentPage * this.eventsPerPage) - this.eventsPerPage;
                let to = this.currentPage * this.eventsPerPage;
                return events.slice(from, to);
            }
        },
        mounted() { //once the elements have been added to the DOM for the first time - there is content in the page
            this.getAllEvents();
        },
        computed: {
            displayedEvents() {
                return this.paginate(this.events);
            }
        },
        watch: {
            events() {
                this.setPagination();
            }
        },
        components: {
            Event
        }
    }
</script>

<style scoped>

@media (max-width: 768px){
    .container{
        grid-template-columns: repeat(2, 1fr) !important;
    }

    .header{
        line-height: 1.2vh !important;
    }

    .nav #reset-button{
        padding: 1vw !important;
    }

    .nav{
        width: 17.5% !important;
        font-size: 1vw !important;
    }

    .nav a{
        font-size: 1.7vw !important;
    }
}

@media (max-width: 530px){
    h1{
        font-size: 3vw !important;
    }

    h2{
        margin-top: 20% !important;
        font-size: 3vw !important;
    }

    .container{
        grid-template-columns: repeat(1, 1fr) !important;
        margin-right: 1vw !important;
    }

    .nav-link{
        padding: 1vw !important;
    }

    .nav a{
        font-size: 1.3vw !important;
    }
}

h1, h2{
    text-align: center;
    text-transform: capitalize;
    font-size: 1.5vw;
    margin: 5vh auto auto;
    color: orange;
}

h2{
    margin: 25vh auto auto;
    max-width: 50%;
    line-height: 8vh;
}

span{
    line-height: 4.5vh;
    text-decoration: underline;
}

.nav{
    border: 5px solid midnightblue;
    margin-top: 10vh;
    width: 13%; /* Take up a 6th of the entire page witdh's space for the side bar */
    height: 100%;
    position: fixed;
    padding: 0.5vw;
    font-size: 1vw;
}

.header{
    border-bottom: 3px solid darkgreen;
    margin-bottom: 3vh;
    text-transform: capitalize;
}

.radio-input{
    display: block;
    margin-top: 3vh;
}

#reset-button{
    margin: 3vh auto auto;
    background-color: #3CDDA7;
    font-size: 0.9vw;
}

.dropdown{
    margin-top: 5vh;
}

.btn{
    font-size: 0.9vw;
}

.btn-success{
    width: 60%;
    margin: 3vh auto auto 1vw;
}

.dropdown-menu{
    font-size: 1vw;
    width: 67.5%;
}

h3{
    border: 5px solid red;
    color: red;
    text-transform: capitalize;
    text-decoration: underline;
    padding: 0.7vw;
    margin-bottom: 30vh;
}

.container{
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 3px solid darkmagenta;
    width: 77.5%;
    padding: 1vw;
    text-align: center;
    margin: 10vh auto 0 20vw;
    box-shadow: 0 1vh 5vh darkmagenta;
}

.grid-item{
    width: 90%;
    margin-top: 0;
    margin-bottom: 5vh;
}

.pagination{
    text-align: center;
    margin: auto auto 3vh auto;
    width: max-content;
}

.page-item{
    display: flex;
}

</style>