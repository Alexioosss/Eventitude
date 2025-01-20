<template>
    <p><u>Question {{ question_id }}</u></p>
    <div>
        <div class="properties-box" id="questions">
            <i>{{ asked_by.first_name }}</i> (User {{ asked_by.user_id }}) Asks:<br />
            {{ question }} <br />No. Of Votes: {{ votes ? votes : 0 }} <!-- if the votes are null in the database, then set it to 0 for better readability-->
            <br />
            <button type="submit" id="upvote-button" v-on:click="upvote(question_id)">Upvote</button>
            <button type="submit" id="downvote-button" v-on:click="downvote(question_id)">Downvote</button>
            <button type="submit" id="delete-question-button" v-on:click="deleteQuestion(question_id)">Delete this question</button>
        </div>
        <div v-if="success_message" class="voting-message-box" id="success-voting-box">{{ success_message }}</div>
        <div v-if="error_message" class="voting-message-box"><u>{{ error_message }}</u></div>
    </div>
</template>

<script>
    import { questionsService } from "../../services/questions.service";
    import router from "../../router/index";

    export default {
        data() {
            return {
                error_message: "",
                success_message: ""
            }
        },
        props: {
            question_id: Number,
            question: String,
            asked_by: {
                Type: Object
            },
            votes: Number
        },
        methods: {
            upvote(question_id) {
                this.error_message = "";
                this.success_message = "";
                if(localStorage.getItem("user_id")) {
                    questionsService.upvoteQuestion(question_id, localStorage.getItem('X-Authorization'))
                    .then(response => {
                        this.success_message = "You have successfully upvoted.";
                        setTimeout(() => {this.success_message = ""}, 5000);
                        return;
                    })
                    .catch(error => {
                        this.error_message = "you cannot vote as " + error.response.data.error_message;
                        setTimeout(() => {this.error_message = ""}, 5000);
                        return;
                    })
                } else {
                    this.error_message = "you cannot vote as you are not logged in. please log in to vote"
                    setTimeout(() => {this.error_message = ""}, 5000);
                }
            },
            downvote(question_id) {
                this.error_message = "";
                this.success_message = "";
                if(localStorage.getItem("user_id")) {
                    questionsService.downvoteQuestion(question_id, localStorage.getItem('X-Authorization'))
                    .then(response => {
                        this.success_message = "You have successfully downvoted.";
                        setTimeout(() => {this.success_message = ""}, 5000);
                        return;
                    })
                    .catch(error => {
                        this.error_message = "you cannot vote as " + error.response.data.error_message;
                        setTimeout(() => {this.error_message = ""}, 5000);
                    })
                } else {
                    this.error_message = "you cannot vote as you are not logged in. please log in to vote"
                    setTimeout(() => {this.error_message = ""}, 5000);
                }
            },
            deleteQuestion(question_id) {
                questionsService.deleteQuestion(question_id, localStorage.getItem("X-Authorization"))
                .then(response => {
                    this.success_message = "You have deleted this question successfully.";
                    setTimeout(() => {this.success_message = "", router.go(0)}, 5000);
                })
                .catch(error => {
                    this.error_message = error.response.data.error_message;
                    setTimeout(() => {this.error_message = "", router.go()}, 5000);
                })
            }
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    p{
        font-size: 3vw !important;
    }

    #questions{
        max-width: 65% !important;
        font-size: 4vw !important;
    }

    button{
        padding: 0px 3px !important;
    }

    .voting-message-box{
        font-size: 3vw !important;
        max-width: 70% !important;
        width: max-content !important;
    }
}

p{
    margin-top: 6vh;
    font-size: 1.3vw;
    margin: 5vh auto 2vh 2%;
}

#questions{
    border: 5px solid #94B9AF;
    padding: 1vw;
    border-top-left-radius: 20px;
    border-bottom-right-radius: 20px;
    line-height: 5vh;
    max-width: 45%;
    font-size: 1.2vw;
    margin-left: 1vw;
    margin-bottom: 5vh;
}

button{
    border-radius: 15px;
    padding: 8px;
    font-size: 1vw;
    text-transform: capitalize;
    background-color: #ddff44;
}

button:not(:first-of-type){ /* Apply margin left to every button except the first button, it is already close enough to the left edge of the question box */
    margin-left: 1vw;
}

.voting-message-box{
    font-size: 1.2vw;
    margin: 5vh auto 3vh 1vw;
    text-transform: capitalize;
    border: 5px solid red;
    padding: 1vw;
    line-height: 5vh;
    max-width: 45%;
}

#success-voting-box{
    border: 5px solid green;
    margin-bottom: 1vw;
}

</style>