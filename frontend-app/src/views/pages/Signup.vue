<template>
    <h1 class="page-title">ready to join us?<br />create an account in just a minute</h1>
    <form @submit.prevent="handleInput" v-on:keyup.enter="checkInputData()">
        <div class="signup-box">
            <div class="row">
                <div class="col col1">
                    <label for="firstNameInput">First Name</label>
                    <input type="text" id="firstNameInput" class="form-control" placeholder="First name" v-model="first_name" />
                </div>
                <div class="col col2">
                    <label for="lastNameInput">Last Name</label>
                    <input type="text" id="lastNameInput" class="form-control" placeholder="Last name" v-model="last_name" />
                </div>
            </div>
            <div class="form-group">
                <label for="formGroupExampleInput">Email</label>
                <input type="text" class="form-control" id="formGroupExampleInput" placeholder="username@mailserver.domain" v-model="email" />
            </div>
            <div class="form-group">
                <label for="formGroupExampleInput2">Password</label>
                <input type="text" class="form-control" id="formGroupExampleInput2" placeholder="Your Password" v-model="password" />
            </div>
            <input class="btn btn-primary" type="submit" value="Signup" v-on:click="checkInputData()" />
        </div>
        <div v-if="error_message" class="error-message-box">{{ error_message }}</div>
        <div v-if="success_message" class="error-message-box" id="success-message-box">{{ success_message }}</div>
    </form>
</template>

<script>
    import Email_Validator from 'email-validator';
    import { usersService } from "../../services/users.service";
    import router from "../../router/index.js";

    export default {
        data() {
            return {
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                error_message: "",
                success_message: "",
                submitted: false
            }
        },
        methods: {
            handleInput(e) {
                this.submitted = true;
                const {first_name, last_name, email, password} = this;
                if(!(first_name && last_name && email && password)){
                    return;
                }
            },
            checkInputData() {
                this.error_message = "";
                const {first_name, last_name, email, password} = this;
                if(!(first_name && last_name)) {
                    this.error_message = "please enter your full name to be able to register with us.";
                    return;
                }

                if(!(Email_Validator.validate(email))) {
                    this.error_message = "The email you entered is not valid.";
                    return;
                }

                const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"£$%^&*()_+=:;'~#,.\?><{}|\-"])(?:[a-zA-Z0-9!"£$%^&*()_+=:;'~#,.\?><{}|\-"]){8,25}$/
                if(!(password_regex.test(password))) {
                    this.error_message = "The password you entered is not strong enough.";
                    return;
                }
                else {
                    usersService.create_account(first_name, last_name, email, password)
                    .then(response => {
                            this.success_message = "Your account has been created, redirecting you to login soon..",
                            setTimeout(() => {
                                router.push('/login')
                            }, 5000)
                        }
                    )
                    .catch(error => this.error_message = error.error_message);
                }
            }
        }
    }
</script>

<style scoped>

@media (max-width: 768px){
    .row{
        display: block !important;
    }

    .col2{
        margin-top: 5vh !important;
    }

    .form-group{
        margin-left: 5vw !important;
        width: 80% !important;
    }

    ::placeholder{
        font-size: 2vw !important;
    }

    .btn{
        font-size: 3vw;
        width: 30% !important;
        padding: 1vw !important;
    }

    .signup-box{
        width: 80% !important;
    }
}

@media (max-width: 530px){
    .page-title{
        font-size: 2vh;
    }
}

label{
    text-transform: capitalize;
}

.page-title{
    margin-top: 62.5px;
    text-transform: capitalize;
    color: orange;
    text-align: center;
}

.signup-box{
    border: 5px solid #BE6748;
    width: 50%;
    margin: 10vh auto auto;
    display: grid;
    height: auto;
    border-radius: 15px;
    box-shadow: 0 1vh 5vh #BE6748;
}

.row{
    width: 90%;
    margin: 3vh auto auto;
}

.form-group{
    width: 60%;
    margin: 5vh auto 0;
}

.btn{
    background-color: #DDFF44;
    color: black;
    border-color: grey;
    margin: 7vh auto 2vh auto;
    width: 20%;
    border-radius: 8px;
    padding: 1vw;
}

.btn:hover{
    background-color: green;
}

.error-message-box{
    text-transform: capitalize;
    border: 5px solid red;
    margin: 5vh auto auto;
    width: 35%;
    padding: 1vw;
    text-align: center;
    font-size: 1vw;
}

#success-message-box{
    border: 5px solid green;
}

#api-response-box{
    border: 4px solid black;
    margin: 5vh auto auto;
    width: 10%;
    padding: 10px;
    text-transform: capitalize;
    text-align: center;
}

</style>