<template>
    <div class="category">
        {{ category }} - {{ category_description }}
    </div>
</template>

<script>
    export default {
        props: {
            category_id: Number,
            category: String,
            category_description: String
        }
    }
</script>

<style scoped>

@media (max-width: 700px){
    .category{
        font-size: 3vw !important;
    }
}

.category{
    width: max-content;
    max-width: 80%;
    border: 5px solid darkturquoise;
    font-size: 1.5vw;
    margin-top: 2vh;
    margin-left: 2.5vw;
    padding: 0.5vw;
    padding-left: 1vw;
    border-radius: 5vw;
    text-transform: capitalize;
}

</style>