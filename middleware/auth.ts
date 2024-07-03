export default defineNuxtRouteMiddleware((to, from) => {
    const accessToken = useCookie('accessToken')

    if (!accessToken.value) {
        return navigateTo({
            path: "/sign-in",
            query: to.query
        });
    }
});
