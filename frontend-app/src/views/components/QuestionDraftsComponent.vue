<template>
    <p class="d-inline-flex gap-1">
        <a class="btn btn-primary" data-bs-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
            show/hide question drafts
        </a>
    </p>
    <div class="collapse" id="collapseExample">
        <div class="card card-body">
            <div class="vstack gap-3" v-for="(item, index) in draftedQuestions" :key="index">
                <div class="p-2" v-if="draftedQuestions" v-for="(value, key) in item" :key="key">
                    {{ value }}
                </div>
                <button class="createDraftButton" v-on:click="postDraftedQuestion(item)">post this question</button>
                <button class="createDraftButton" v-on:click="updateDraftedQuestion(item)">update this question</button>
                <button class="createDraftButton" v-on:click="deleteDraftedQueston(item)">delete this question</button>
                <div class="message-box" id="error-message-box" v-if="error_message">{{ error_message }}</div>
                <div class="message-box" id="success-message-box" v-if="success_message">{{ success_message }}</div>
            </div>
            <form id="ask-question-form" @submit.prevent="checkInput()">
                <div id="question-box">
                    <label for="question">Enter your question for event {{ event_id }}: </label>
                    <textarea type="text" id="question-input" placeholder="Question" name="question" v-model="question"></textarea>
                    <button type="submit" class="post-question-button" v-on:click="updateDraftedQuestionInLocalStorage()">update this draft</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    import { questionsService } from '@/services/questions.service';
    import router from "../../router/index";

    export default {
        data() {
            return {
                draftedQuestions: [],
                success_message: "",
                error_message: "",
                question: "",
                event_id: "",
                currentQuestionDraft: null
            }
        },
        methods: {
            checkInput() {
                if(this.question.length < 10) {
                    this.error_message = "The question must be longer than 10 characters";
                    return;
                }
            },
            postDraftedQuestion(item) {
                let toCreate = Object.assign({}, item);
                console.log(toCreate);
                
                questionsService.askQuestion(toCreate.event_id, toCreate.question, localStorage.getItem("X-Authorization"))
                .then(response => {
                    this.error_message = "";
                    this.success_message = "Your question has been asked successfully. Question ID: " + response.question_id
                    setTimeout(() => {
                        this.success_message = "";
                    }, 5000);
                    this.postQuestionToDatabase(item);
                })
                .catch(error => {
                    this.success_message = "";
                    this.error_message = error.response.data.error_message;
                    return;
                })
            },
            postQuestionToDatabase(item) {
                if(!this.error_message) {
                    let fromLocalStorage = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedQuestions"))
                    for(let i = 0; i < fromLocalStorage.length; i++) {
                        if(JSON.stringify(fromLocalStorage[i]) === JSON.stringify(item)) {
                            let indexToRemoveFromLocalStorage = fromLocalStorage.findIndex(x => x === fromLocalStorage[i]);
                            fromLocalStorage.splice(indexToRemoveFromLocalStorage, 1);
                            if(fromLocalStorage) {
                                localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedQuestions", JSON.stringify(fromLocalStorage));
                                break;
                            }
                        }
                    }
                    this.success_message = "question posted successfully! removing from the drafts list";
                    setTimeout(() => {
                        this.success_message = "";
                        let indexToRemove = this.draftedQuestions.findIndex(question => question === item);
                        this.draftedQuestions.splice(indexToRemove, 1);
                    }, 5000);
                }
            },
            updateDraftedQuestion(item) {
                let form = document.getElementById("ask-question-form");
                form.style.display = "flex";
                
                let assignToForm = JSON.parse(JSON.stringify(item));
                form[0].value = assignToForm["question"];

                this.currentQuestionDraft = item;
                this.question = assignToForm.question;
            },
            updateDraftedQuestionInLocalStorage() {
                let localStorageDrafts = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedQuestions"));
                let form = document.getElementById("ask-question-form");
                let formData = new FormData(form);
                let toUpdate = {};
                formData.forEach((value, key) => {
                    toUpdate[key] = value;
                })

                for(let i = 0; i < localStorageDrafts.length; i++) {
                    if(JSON.stringify(localStorageDrafts[i]) === JSON.stringify(this.currentQuestionDraft)) {
                        let indexToUpdateInLocalStorage = localStorageDrafts.findIndex(x => x === localStorageDrafts[i]);
                        localStorageDrafts[indexToUpdateInLocalStorage] = toUpdate;
                        localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedQuestions", JSON.stringify(localStorageDrafts));
                        break;
                    }
                }
                this.success_message = "The draft has been modified successfully.";
                setTimeout(() => {this.success_message = "", router.go(0)}, 5000);
            },
            deleteDraftedQueston(item) {
                let fromLocalStorage = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedQuestions"));
                for(let i = 0; i < fromLocalStorage.length; i++) {
                    if(JSON.stringify(fromLocalStorage[i]) === JSON.stringify(item)) {
                        let indexToRemoveFromLocalStorage = fromLocalStorage.findIndex(x => x === fromLocalStorage[i]);
                        fromLocalStorage.splice(indexToRemoveFromLocalStorage, 1);
                        if(fromLocalStorage) {
                            localStorage.setItem("user" + localStorage.getItem("user_id") + "DraftedQuestions", JSON.stringify(fromLocalStorage));
                        }
                    }
                }

                this.success_message = "the draft has been deleted successfully";
                setTimeout(() => {
                    this.success_message = "";
                    let indexToRemove = this.draftedQuestions.findIndex(question => question === item);
                    this.draftedQuestions.splice(indexToRemove, 1);
                }, 5000);
            }
        },
        mounted() {
            document.getElementById("ask-question-form").style.display = "none";
            this.draftedQuestions = JSON.parse(localStorage.getItem("user" + localStorage.getItem("user_id") + "DraftedQuestions"));
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
        max-width: 30% !important;
        font-size: 1vw !important;
    }

    .vstack .createDraftButton{
        background-color: #DDFF44;
        text-transform: capitalize;
        width: 45% !important;
        margin: 0 auto;
        border-radius: 10px;
        font-size: 1vw !important;
    }

    form{
        margin-left: 30% !important;
    }

    .message-box{
        font-size: 1vw !important;
    }

    #question-box{
        margin-left: 10% !important;
    }
}

@media (max-width: 500px){
    .vstack .p-2{
        font-size: 2vw !important;
    }
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
    width: 45%;
    margin: 0 auto;
    border-radius: 10px;
}

#question-box{
    border: 4px solid red;
    width: 55%;
    margin-left: 37%;
    position: fixed;
    bottom: 2.5%;
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
    margin-left: 45%;
}

.message-box{
    border: 5px solid red;
    width: 70%;
    margin: auto;
    padding: 1vw;
    text-align: center;
    text-transform: capitalize;
    font-size: 1.1vw;
}

#success-message-box{
    border: 5px solid green;
}

</style>