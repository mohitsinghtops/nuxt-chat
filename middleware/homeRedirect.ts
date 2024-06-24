export default defineNuxtRouteMiddleware((to, from) => {
    const userId = localStorage.getItem('userId');

    if (to.path == '/' && !userId) {
        return navigateTo("/sign-in");
    } else {
        return navigateTo("/");
    }
});
