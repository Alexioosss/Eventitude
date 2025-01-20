<template>
    <h3 v-if="draftedEvents">Here you can find your saved drafts</h3>

    <p class="d-inline-flex gap-1" v-if="draftedEvents">
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
            show/hide event drafts
        </a>
    </p>
    <h3 v-else>You currently have no drafted events.</h3>
    <div class="collapse" id="collapseExample">
        <div class="card card-body">
            <div class="vstack gap-3" v-for="(item, index) in draftedEvents" :key="index">
                <div class="p-2" v-if="draftedEvents" v-for="(value, key) in item" :key="key">
                    {{ key }} - {{ value }}
                </div>
                <button class="createDraftButton" v-on:click="createDraftedEvent(item)">create this event</button>
                <button class="createDraftButton" v-on:click="updateDraft(item)">update this event</button>
                <button class="createDraftButton" v-on:click="deleteDraft(item)">delete this event</button>
                <div class="message-box" id="error-message-box" v-if="error_message">{{ error_message }}</div>
                <div class="message-box" id="success-message-box" v-if="success_message">{{ success_message }}</div>
            </div>

            <form id="updateDraftForm" @submit.prevent="checkFormInput()">
                <div class="event-info-input-box">
                    <label for="name">event's name:</label>
                    <input type="text" id="name" placeholder="Name" name="name" v-model="inputEvent.name"/>
                </div>
                <div class="event-info-input-box">
                    <label for="description">event's description:</label>
                    <input type="text" id="description" placeholder="Description" name="description" v-model="inputEvent.description"/>
                </div>
                <div class="event-info-input-box">
                    <label for="location">event's location:</label>
                    <input type="text" id="location" placeholder="Location" name="location" v-model="inputEvent.location"/>
                </div>
                <div class="event-info-input-box">
                    <label for="start">event's start date:</label>
                    <input type="date" id="start" placeholder="Start Date" name="start" v-model="inputEvent.start"/>
                </div>
                <div class="event-info-input-box">
                    <label for="close_registration">event's close registration:</label>
                    <input type="date" id="close_registration" placeholder="Close Registration" name="close_registration" v-model="inputEvent.close_registration"/>
                </div>
                <div class="event-info-input-box">
                    <label for="max-attendees">event's maximum attendees:</label>
                    <input type="text" id="max-attendees" placeholder="Maximum Attendees" name="max_attendees" v-model="inputEvent.max_attendees"/>
                </div>
                <div class="event-info-input-box">
                    <label for="category">event's category:</label>
                    <input type="text" id="category" placeholder="Category" name="category" v-model="inputEvent.category"/>
                </div>
                <div class="event-info-input-box">
                    <label for="category_description">category's description:</label>
                    <input type="text" id="category_description" placeholder="Category Description" name="category_description" v-model="inputEvent.category_description"/>
                </div>
                <button type="submit" id="submit-new-event-button" v-on:click="updateDraftInLocalStorage()">update this draft</button>
            </form>
        </div>
    </div>
</template>

<script>
    import { eventsService } from "../../services/events.service";
    import router from "../../router/index";

    export default {
        data() {
            return {
                draftedEvents: [],
                user_id: null,
                success_message: "",
                error_message: "",
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
                currentDraft: null
            }
        },
        methods: {
            createDraftedEvent(item) {
                let toCreate = Object.assign({}, item); //make a copy of the event to create into another object, otherwise the current object, passed by reference, gets updated in the page also, showing different date formats
                toCreate.start = Date.parse(toCreate.start);
                toCreate.close_registration = Date.parse(toCreate.close_registration);

                let fromLocalStorage = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedEvents"));
                for(let i = 0; i < fromLocalStorage.length; i++) {
                    if(JSON.stringify(fromLocalStorage[i]) === JSON.stringify(item)) {
                        let indexToRemoveFromLocalStorage = fromLocalStorage.findIndex(x => x === fromLocalStorage[i]);
                        fromLocalStorage.splice(indexToRemoveFromLocalStorage, 1); //remove the drafted event that has been created
                        if(fromLocalStorage) { //if there is still an event, store it
                            localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedEvents", JSON.stringify(fromLocalStorage)); //and set the new array without the new event into the local storage
                            break; //exit the loop, not needed anymore
                        }
                        //otherwise skip storing the empty array, no need
                    }
                }

                this.success_message = "Event created successfully! removing draft from list";

                setTimeout(() => {
                    this.success_message = "";
                    let indexToRemove = this.draftedEvents.findIndex(event => event === item); //find the index of the item to remove from the drafts array after creating the event
                    this.draftedEvents.splice(indexToRemove, 1); //remove it
                }, 5000);

                eventsService.createEvent(toCreate, localStorage.getItem('X-Authorization'))
                .then(response => {
                    this.success_message = "The event has been created successfully. Event ID: " + response.event_id + ". Redirecting you to its page now";
                    setTimeout(() => {router.push("/event/" + response.event_id)}, 5000);
                })
                .catch(error => this.error_message = error.response.data.error_message)
            },
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
            updateDraft(item){
                let form = document.getElementById("updateDraftForm");
                form.style.display = "block";

                let assignToForm = JSON.parse(JSON.stringify(item));
                for(let i = 0; i < form.length; i++) { //loop through the form inputs
                    Object.keys(assignToForm).forEach(key => { //setting each input value from the event draft
                        if(form[i].name == key) {
                            form[i].value = assignToForm[key];
                        }
                    })
                }
                this.currentDraft = item;
                this.inputEvent = assignToForm; //ensure the form is still showing the data, so set the data to be what the user wants to change, the form autocompletes in the inputs
            },
            updateDraftInLocalStorage() {
                let localStorageDrafts = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedEvents"));
                let form = document.getElementById("updateDraftForm");

                let formData = new FormData(form);
                let toUpdate = {};
                formData.forEach((value, key) => {
                    toUpdate[key] = value;
                })

                for(let i = 0; i < localStorageDrafts.length; i++) {
                    if(JSON.stringify(localStorageDrafts[i]) === JSON.stringify(this.currentDraft)) {
                        let indexToUpdateInLocalStorage = localStorageDrafts.findIndex(x => x === localStorageDrafts[i]); //index of element that matches the initial draft
                        localStorageDrafts[indexToUpdateInLocalStorage] = toUpdate;
                        localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedEvents", JSON.stringify(localStorageDrafts));
                        break;
                    }
                }
                this.success_message = "The draft has been modified successfully.";
                setTimeout(() => {this.success_message = "", router.go(0)}, 5000);
            },
            deleteDraft(item) {

                let fromLocalStorage = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedEvents"));
                for(let i = 0; i < fromLocalStorage.length; i++) {
                    if(JSON.stringify(fromLocalStorage[i]) === JSON.stringify(item)) {
                        let indexToRemoveFromLocalStorage = fromLocalStorage.findIndex(x => x === fromLocalStorage[i]);
                        fromLocalStorage.splice(indexToRemoveFromLocalStorage, 1); //remove the drafted event that has been created
                        if(fromLocalStorage) { //if there is still an event, store it
                            localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedEvents", JSON.stringify(fromLocalStorage)); //and set the new array without the new event into the local storage
                            break; //exit the loop, not needed anymore
                        }
                    }
                }
                this.success_message = "the draft has been deleted successfully";

                setTimeout(() => {
                    this.success_message = "";
                    let indexToRemove = this.draftedEvents.findIndex(event => event === item); //find the index of the item to remove from the drafts array after creating the event
                    this.draftedEvents.splice(indexToRemove, 1); //remove it
                }, 5000);
            }
        },
        mounted() {
            document.getElementById("updateDraftForm").style.display = "none";
            this.draftedEvents = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedEvents")); //get the object of drafts and turn back from string to object
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    h1, h2, h3{
        margin-top: 2vh !important;
        font-size: 3vw !important;
    }

    .message-box{
        font-size: 2vw !important;
    }

    .vstack{
        max-width: 60% !important;
    }

    .vstack .createDraftButton{
        background-color: #DDFF44;
        text-transform: capitalize;
        width: 30%;
        margin: 0 auto;
        border-radius: 10px;
        font-size: 2vw;
    }

    form{
        margin-left: 30% !important;
    }
}

@media (max-width: 500px){
    .vstack .p-2{
        font-size: 2vw !important;
    }
}

h3{
    color: orange;
    text-align: center;
    text-transform: capitalize;
    margin-top: 10vh;
}

h3{
    margin-left: 2vw;
    text-align: start;
}

.message-box{
    border: 5px solid red;
    width: fit-content;
    padding: 0.5vw;
    text-transform: capitalize;
    margin: 0 auto;
    text-align: center;
}

#success-message-box{
    border: 5px solid green;
}

.d-inline-flex{
    margin-top: 3vh;
    margin-left: 2vw;
    text-transform: capitalize;
}

.d-inline-flex .btn-primary{
    font-size: 1vw;
}

.vstack{
    border: 5px solid lawngreen;
    max-width: 30%;
    padding: 1vw;
    margin-top: 3vh;
    margin-bottom: 5vh;
    margin-left: 2vw;
    box-shadow: 0 1vh 3vh lawngreen;
}

.vstack .p-2{
    text-transform: capitalize;
    border-bottom: 1px solid lightblue;
    width: fit-content;
}

.vstack .createDraftButton{
    background-color: #DDFF44;
    text-transform: capitalize;
    width: 40%;
    margin: 0 auto;
    border-radius: 10px;
}

form{
    position: absolute;
    left: 35%;
}

form{
    border: 4px solid darkcyan;
    text-align: center;
    width: 45%;
    height: auto;
    margin: 0 auto;
    font-size: 1vw;
    box-shadow: 0 1vh 5vh darkcyan;
    padding: 1vw;
}

.event-info-input-box{
    width: 100%;
    display: block;
    margin-bottom: 5vh;
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

</style>