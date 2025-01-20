const isAuthenticated = (to, from, next) => {
    if(localStorage.getItem('X-Authorization')){
        next();
        return;
    }
    next("/login");
    return;
}

export default {
    isAuthenticated
}