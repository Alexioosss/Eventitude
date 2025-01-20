<template>
</template>

<script>
import { usersService } from "../../services/users.service";
import router from "../../router/index.js";

export default {
    mounted() {
        usersService.logout(localStorage.getItem('X-Authorization'))
        .then(response => {
            localStorage.removeItem('X-Authorization');
            localStorage.removeItem('user_id');
            router.push("/").then(() => router.go(0));
        })
        .catch(error => "");
    }
}
</script>