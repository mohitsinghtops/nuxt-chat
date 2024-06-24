export default defineNuxtRouteMiddleware(() => {
    const userId = useCookie('userId')

    if (!userId.value) {
        return navigateTo("/sign-in");
    }
});
