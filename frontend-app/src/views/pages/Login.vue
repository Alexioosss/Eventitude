<template>
    <h1>welcome back!<br />login with your user credentials</h1>
    <form @submit.prevent="handleInput"  v-on:keyup.enter="checkCredentials()">
        <div class="login-box">
            <div class="email-input">
                <label for="exampleFormControlInput1" class="form-label">Email address</label>
                <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com" v-model="email">
            </div>
            <div class="password-input">
                <label for="inputPassword5" class="form-label">Password</label>
                <input type="password" id="inputPassword5" class="form-control" aria-describedby="passwordHelpBlock" v-model="password">
                <div id="passwordHelpBlock" class="form-text">
                    Your password must be 8-25 characters long, contain uppercase and lowercase letters, numbers and a special character, and must not contain spaces, or emojis.
                </div>
            </div>
            <button v-on:click="checkCredentials()" type="button" id="login-button">Login</button>
        </div>
        <div v-if="error_message" id="error-message-box">{{ error_message }}</div>
        <div v-if="success_message" id="success-box">{{ success_message }}</div>
    </form>
</template>

<script>
    import Email_Validator from 'email-validator';
    import { usersService } from "../../services/users.service";
    import router from "../../router/index.js";

    export default {
        data() {
            return {
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
                const {email, password} = this;
                if(!(email && password)){
                    return;
                }
            },
            checkCredentials() {
                this.error_message = "";
                const {email, password} = this;
                if(!(email && password)) {
                    this.error_message = "please enter both of your login credentials.";
                    return;
                }

                if(!Email_Validator.validate(email)) {
                    this.error_message = "The email is not valid.";
                    return;
                }

                const password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"£$%^&*()_+=:;'~#,.\?><{}|\-"])(?:[a-zA-Z0-9!"£$%^&*()_+=:;'~#,.\?><{}|\-"]){8,25}$/
                if(!(password_regex.test(password))) {
                    this.error_message = "The password is not strong enough. Please ensure it contains at least 1 lowercase and uppercase letter, a digit and a special character.";
                    return;
                }
                else {
                    if(localStorage.getItem("X-Authorization")) { //prevent the user from logging in again as they are already logged in
                        this.success_message = "You are already logged in. Redirecting you now.";
                        setTimeout(() => {router.push("/")}, 5000);
                    }
                    else { //log the user in
                        usersService.login(email, password)
                        .then(response => {
                            localStorage.setItem("X-Authorization", response.session_token);
                            localStorage.setItem("user_id", response.user_id);
                            this.success_message = "You have successfully logged in. Redirecting you now.";
                            setTimeout(() => {router.push("/").then(() => router.go(0));}, 5000); //redirect the user to the home page
                        })
                        .catch(error => this.error_message = error + " If you are not registered with us, click on signup at the top right to register.")
                    }
                }
            }
        }
    }
</script>

<style scoped>

@media (max-width: 870px){
    ::placeholder{
        font-size: 1.1vw !important;
        text-align: center;
        margin: 0 auto;
    }

    .form-text{
        font-size: 0.7vw !important;
    }
}

@media (max-width: 700px){
    .login-box{
        width: 65% !important;
    }

    #error-message-box, #success-box{
        font-size: 2vw !important;
        width: 50% !important;
    }

    .form-text{
        font-size: 1.8vw !important;
    }
}

@media (max-width: 375px){
    h1{
        font-size: 5vw !important;
    }

    .login-box{
        width: 80% !important;
        height: 25vh !important;
    }

    #exampleFormControlInput1{
        padding: 0 !important;
    }

    .form-text{
        width: 40% !important;
        font-size: 1.8vw !important;
    }
}

h1{
    margin-top: 7vh;
    text-transform: capitalize;
    color: orange;
    text-align: center;
    line-height: 6vh;
}

.login-box{
    border: 5px solid #be6748;
    width: 30%;
    margin: 15vh auto auto auto;
    border-radius: 15px;
    text-align: center;
    height: 35vh;
    font-size: 1.1vw;
    padding: 0.5vw;
    box-shadow: 0 1vh 5vh #BE6748;
}

label{
    margin-right: 0.8vw;
}

.email-input{
    height: 40%;
}

#exampleFormControlInput1{
    margin: 2vh auto 2vh auto;
    width: 60%;
}

.password-input{
    height: 40%;
    margin-bottom: 3vh;
}

#inputPassword5{
    margin: 0 auto 0.4vw auto;
    width: 60%;
}

.form-text{
    font-size: 0.6vw;
    width: 65%;
    margin: 0 auto;
}

#login-button{
    border-radius: 8px;
    background-color: #ddff44;
    border-color: grey;
    color: black;
    font-size: 0.9vw;
}

#error-message-box{
    border: 5px solid red;
    display: block;
    width: 25%;
    margin: 7vh auto;
    padding: 5px;
    text-align: center;
    text-transform: capitalize;
    font-size: 1vw;
}

#success-box{
    border: 5px solid green;
    margin: 5vh auto auto;
    width: 19%;
    padding: 10px;
    text-transform: capitalize;
    text-align: center;
    font-size: 1vw;
}

</style>