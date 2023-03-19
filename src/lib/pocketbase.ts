import PocketBase from "pocketbase";

export const getPocketbase = async (cookie: string, baseURL = `http://${window.location.hostname}:8090/`): Promise<PocketBase> => {

    const pb = new PocketBase(baseURL);
    pb.authStore.loadFromCookie(cookie);

    pb.autoCancellation(false);

    try {
        // get an up-to-date auth store state by veryfing and refreshing the loaded auth model (if any)
        pb.authStore.isValid && await pb.collection('users').authRefresh();
    } catch (_) {
        // clear the auth store on failed refresh
        console.log("authStore invalid");
        pb.authStore.clear();
    }

    return pb;
}