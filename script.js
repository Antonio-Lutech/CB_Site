const msalConfig = {
    auth: {
        clientId: "91eaa7a2-f3c1-45e3-9aff-e4bff5b6ac86",  // Sostituisci con l'ID della tua app registrata
        authority: "https://login.microsoftonline.com/11f69417-75e5-4be6-8343-eee7285f51d4", // Per login multi-tenant
        redirectUri: "http://localhost:8000"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
const loginRequest = { scopes: ["User.Read"] };

async function getUserProfile(token) {
    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const user = await response.json();
    console.log(user); // Controlla che questo non sia vuoto
    //document.getElementById("user-info").innerText = `Ciao, ${user.displayName} (${user.mail || user.userPrincipalName})`;
    var iframe = document.getElementById("chatbot");
    if(iframe){
        var currentSrc = "https://copilotstudio.microsoft.com/environments/Default-6e2880d1-7e98-4f54-94d2-7799433097ed/bots/cr0b7_lutechChatbot/webchat?__version__=2";
        // Aggiungiamo il parametro 'name' all'URL esistente
        if (currentSrc.indexOf("?") > -1) {
            // Se l'URL ha già dei parametri, aggiungiamo '&name='
            iframe.src = currentSrc + "&name=" + encodeURIComponent(user.givenName);
        } else {
            // Se l'URL non ha parametri, iniziamo con '?' per aggiungere il primo parametro
            iframe.src = currentSrc + "?name=" + encodeURIComponent(user.givenName);
        }
    } else {
        console.error("Iframe non trovato o src non valido");
    }
}

async function login() {
    try {
        let account = msalInstance.getActiveAccount();
        if (!account) {
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            msalInstance.setActiveAccount(loginResponse.account);
            account = loginResponse.account;
        }
        
        const tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
        await getUserProfile(tokenResponse.accessToken);
    } catch (error) {
        console.error("Errore di autenticazione:", error);
    }
}

// Richiedi il login automaticamente all'apertura della pagina
window.onload = login;
