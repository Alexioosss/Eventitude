<template>
    <h1>Something wasn't right for you. Ask it!</h1>

    <div class="reference-box">
        <p>Just to remind you for reference</p>
        <Event id="event" v-for="(item, index) in event" :key="index"
        :event_id="item.event_id"
        :name="item.name"
        :description="item.description"
        :location="item.location"
        :start_date="item.start"
        :close_registration="item.close_registration"
        :max_attendees="item.max_attendees"
        />
    </div>

    <form @submit.prevent="checkInput()">
        <div id="question-box">
            <label for="question">Enter your question for this event: </label>
            <textarea type="text" id="question-input" placeholder="Question" v-model="question"></textarea>
            <button type="submit" class="post-question-button" v-on:click="postQuestion()">Post this question</button>
            <button type="submit" class="post-question-button" id="draft-question-button" v-on:click="draftQuestion()">draft this question</button>
        </div>
    </form>

    <div class="message-box" v-if="error_message">{{ error_message }}</div>
    <div class="message-box" id="success-message-box" v-if="success_message">{{ success_message }}</div>
    <button id="register-for-event-button" v-if="requires_registration" v-on:click="registerForEvent()">Register for this event</button>
</template>

<script>
    import { eventsService } from "../../services/events.service";
    import { questionsService } from "../../services/questions.service";
    import Event from "../components/EventComponent.vue";
    import router from "../../router/index.js";

    export default {
        data() {
            return {
                question: "",
                event: [],
                event_id: router.currentRoute.value.params.event_id,
                error_message: "",
                success_message: "",
                requires_registration: false
            }
        },
        methods: {
            checkInput() {
                if(this.question.length < 10) {
                    this.error_message = "The question must be longer than 10 characters";
                    return;
                }
            },
            postQuestion() {
                this.error_message = "";
                this.success_message = "";

                questionsService.askQuestion(this.event_id, this.question, localStorage.getItem("X-Authorization"))
                .then(response => {
                    this.success_message = "Your question has been asked successfully. Question ID: " + response.question_id
                    setTimeout(() => {this.success_message = ""}, 5000);
                })
                .catch(error => {
                    if(error.response.status === 403) {
                        this.error_message = error.response.data.error_message + " Register with the button below to be able to ask questions";
                        this.requires_registration = true;
                    }
                    else {
                        this.error_message = error.response.data.error_message;
                        setTimeout(() => {this.error_message = ""}, 5000);
                    }
                })
            },
            draftQuestion() {
                //save the draft in the local storage
                let arrayOfDrafts = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedQuestions"));

                if(!this.error_message) {
                    if(arrayOfDrafts) {
                        arrayOfDrafts.push(Object.assign({}, {question: this.question, event_id: this.event_id}));
                        localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedQuestions", JSON.stringify(arrayOfDrafts));
                    }
                    else {
                        let question = [];
                        question.push((Object.assign({}, {question: this.question, event_id: this.event_id})));
                        localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedQuestions", JSON.stringify(question));
                    }
                    this.success_message = "your question has been drafted successfully. It can be viewed in your profile section at any time.";
                    setTimeout(() => {this.success_message = ""}, 5000);
                }
            },
            registerForEvent() {
                router.push("/event/" + this.event_id);
            }
        },
        mounted() {
            eventsService.getSingleEvent(router.currentRoute.value.params.event_id) //cannot refer to the event_id value in data because this loads before data, or by the time this loads there is no event_id value in data yet
            .then(response => this.event.push(response))
            .catch(error => this.error_message = error);

        },
        components: {
            Event
        }
    }
</script>

<style scoped>

@media (max-width: 768px){

    h1{
        font-size: 3vw !important;
    }

    label{
        font-size: 2vw !important;
    }

    p{
        top: 21% !important;
    }

    #event{
        width: 20% !important;
    }

    #question-box{
        margin-left: 30% !important;
        width: 100% !important;
    }

    .post-question-button{
        font-size: 1vw !important;
    }

    .message-box{
        margin-left: 47.5% !important;
    }

    #register-for-event-button{
        margin-left: 32.5% !important;
    }
}

@media (max-width: 700px){
    p{
        top: 21% !important;
        width: 25% !important;
    }

    #event{
        width: 25% !important;
    }
}

h1{
    margin-top: 62.5px;
    text-transform: capitalize;
    color: orange;
    text-align: center;
}

p{
    border: 5px solid red;
    width: 20%;
    text-transform: capitalize;
    position: absolute;
    top: 23%;
    font-size: 1vw;
    text-align: center;
}

#event{
    float: left;
    display: inline;
    width: 20%;
    margin: 10vh auto 5vh auto;
    padding: 0.4vw;
}

form{
    margin: 20vh auto auto;
    padding: 1vw;
    text-align: center;
    width: 45%;
}

#question-box{
    border: 4px solid red;
    width: 75%;
    margin: auto;
    overflow: auto;
    line-height: 5vh;
    padding: 1.5vw;
    box-shadow: 0 1vh 5vh red;
}

label{
    text-transform: capitalize;
    float: left;
    width: 100%;
    font-size: 1.2vw;
}

textarea{
    max-width: 95%;
    width: 95%;
    height: 15vh;
    font-size: 1.2vw;
    resize: vertical; /* You can only resize the textarea vertically, so the question is always visible in fully width */
}

::placeholder{
    text-align: center;
    font-size: 1vw;
}

.post-question-button{
    border-radius: 8px;
    font-size: 1vw;
    background-color: #DDFF44;
    text-transform: capitalize;
}

#draft-question-button{
    margin-left: 2vw;
}

.message-box{
    border: 5px solid red;
    width: 30.4%;
    margin: auto;
    padding: 1vw;
    text-align: center;
    text-transform: capitalize;
    font-size: 1.1vw;
}

#success-message-box{
    border: 5px solid green;
}

#register-for-event-button{
    border-radius: 8px;
    margin: 2vh auto auto 25%;
    font-size: 1vw;
    width: 12%;
    background-color: #DDFF44;
}

</style>