<template>
  <nav>
    <RouterLink to="/"><a id="home">Eventitude</a></RouterLink>
    <div id="top-right">
      <form @submit.prevent class="form-inline my-2 my-lg-0">
        <input class="form-control" type="text" placeholder="Search by name" v-on:keyup.enter="searchFiltered()">
        <button class="btn btn-outline-success" type="submit" v-on:click="searchFiltered()">Search</button>
      </form>
      <RouterLink to="/createEvent"><a id="events">Create An Event</a></RouterLink>
      <RouterLink to="/events"><a id="events">Events</a></RouterLink>
      <RouterLink to="/login" v-if="!token"><a class="login">Login</a></RouterLink>
      <RouterLink to="/logout" v-else><a class="login">Logout</a></RouterLink>
      <RouterLink to="/signup" v-if="!token"><a id="signup">Signup</a></RouterLink>
      <RouterLink to="/profile" v-else><a>Profile</a></RouterLink>
    </div>
  </nav>
  <RouterView />
</template>

<script>
  import router from "../router/index.js";

  export default {
    data() {
      return {
        token: false
      }
    },
    methods: {
      searchFiltered() {
        let searchInput = document.getElementsByTagName("input")[0].value;
        router.push("/search?q=" + searchInput).then(() => router.go(0)); //redirect and reload so the url's parameters appear in the route and can be retrieved
      }
    },
    mounted() { //runs as the page's DOM tree is created and the components have been mounted
      if(localStorage.getItem('X-Authorization')) this.token = true; //if the user is logged in, change the token flag to show logout rather than login
    }
  }
</script>

<style scoped>

@media (min-width: 1299px) and (max-width: 1520px){
  #top-right{
    width: 60%;
  }

  nav a{
    font-size: 1.2vw !important;
  }
}

@media (min-width: 1270px) and (max-width: 1299px){
  nav a{
    font-size: 0.9vw !important;
    margin-top: 0.5vh;
  }
}

@media (min-width: 1030px) and (max-width: 1270px){
  nav a{
    font-size: 0.9vw !important;
    margin-top: 0.8vh;
  }

  .form-inline{
    max-height: 3vh !important;
  }

  .btn{
    padding: 0.1vw !important;
  }
}

@media (min-width: 980px) and (max-width: 1030px){
  nav a{
    font-size: 1vw !important;
    margin-top: 0.8vh;
  }

  #top-right{
    width: 50% !important;
  }

  .form-inline{
    max-height: 3vh !important;
  }

  .btn{
    padding: 0.1vw !important;
  }
}

@media (min-width: 980px) and (max-width: 991px){
  .form-inline{
    margin-top: 0vh !important;
  }
}

@media (min-width: 700px) and (max-width: 980px){ /* Tablet view */
  #top-right{
    width: 50% !important;
  }

  nav a{
    font-size: 0.7vw !important;
    margin-top: 0.8vh !important;
  }

  .form-inline{
    max-height: 3vh !important;
    margin-top: 0vh !important;
  }

  .btn{
    padding: 0.1vw !important;
  }
}

@media (min-width: 375px) and (max-width: 700px){
  nav{
    display: inline-block !important;
    height: max-content !important;
    width: 100% !important;
  }

  #top-right{
    width: 97.5% !important;
    display: block !important;
    margin-bottom: 1vh !important;
  }

  nav a{
    display: block !important;
    width: 100% !important;
    float: left !important;
    font-size: 1.5vw !important;
    margin-top: 0.75vh !important;
    text-decoration: underline !important;
  }

  .form-inline{
    max-height: 3vh !important;
    margin-top: 0.5vh !important;
  }

  input{
    font-size: 0.8vw !important;
    height: 0.8vh !important;
  }

  .btn{
    max-height: 3vh !important;
    font-size: 1vw !important;
  }
}

@media (min-width: 200px) and (max-width: 375px){
  nav{
    display: inline-block !important;
    height: max-content !important;
    width: 100% !important;
  }

  #top-right{
    width: 97.5% !important;
    display: block !important;
    margin-bottom: 1vh !important;
  }

  nav a{
    display: block !important;
    width: 100% !important;
    float: left !important;
    font-size: 2vw !important;
    margin-top: 0.75vh !important;
    text-decoration: underline !important;
  }

  .form-inline{
    max-height: 3vh !important;
    margin-top: 0.5vh !important;
  }

  input{
    font-size: 0.8vw !important;
    height: 0.8vh !important;
  }

  .btn{
    max-height: 3vh !important;
    font-size: 1vw !important;
  }
}

nav{
  border: 4px solid blue;
  padding: 0.5%;
}

nav a{
  color: orange;
  font-size: 1.4vw;
  text-decoration: underline;
}

nav a #home{
  margin-left: 10px;
}

#top-right{
  float: right;
  width: 40%;
  display: flex;
  justify-content: space-between;
}

.form-inline{
  display: flex;
}

.btn{
  max-height: 3.5vh;
  padding: 0.2vw;
}

.page-title{
  margin-top: 62.5px;
  text-transform: capitalize;
  text-align: center;
  color: orange;
}

input{
  width: 70%;
  max-height: 3.5vh;
}

input::placeholder{
  text-transform: capitalize;
  font-weight: bold;
  color: black;
}

</style>