<template>
    <div id="attendees-box" v-if="user_id == this.user_id">
        {{ first_name }} <i>(that's you)</i>
    </div>
    <div id="attendees-box" v-else>
        {{ first_name }}
    </div>
</template>

<script>
    export default {
        data() {
            return {
                user_id: ""
            }
        },
        props: {
            user_id: Number,
            first_name: String
        },
        mounted() {
            this.user_id = localStorage.getItem("user_id");
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    #attendees-box{
        font-size: 4vw !important;
    }
}

#attendees-box{
    border: 5px solid #C05780;
    width: fit-content;
    font-size: 1.2vw;
    padding: 1vw;
    text-transform: capitalize;
    border-top-right-radius: 15px;
    border-bottom-left-radius: 15px;
    margin-bottom: 3vh;
    margin-top: 2vh;
    margin-left: 2.5vw;
}

</style>