<template>
    <h1>here you can create your own event!</h1>
    <h2>Just enter the following information</h2>
    <EventInputForm />
</template>

<script>
    import EventInputForm from "../components/EventInputFormComponent.vue";

    export default {
        components: {
            EventInputForm
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    h1, h2{
        font-size: 3vw !important;
    }
}

@media (max-width: 425px){
    h1, h2{
        font-size: 4vw !important;
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
    margin-top: 10vh;
}

</style>