function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const msalConfig = {
    auth: {
        clientId: "91eaa7a2-f3c1-45e3-9aff-e4bff5b6ac86",  // Sostituisci con l'ID della tua app registrata
        authority: "https://login.microsoftonline.com/11f69417-75e5-4be6-8343-eee7285f51d4", // Per login multi-tenant
        redirectUri: "http://localhost:5500"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
const loginRequest = { scopes: ["User.Read"] };

async function login() {
    try {
        let account = msalInstance.getActiveAccount();
        if (!account) {
            console.log("Nessun account attivo, avvio login...");
            const loginResponse = await msalInstance.loginPopup(loginRequest);
            msalInstance.setActiveAccount(loginResponse.account);
            account = loginResponse.account;
        }
        await wait(1000);        
        let tokenResponse;
        try {
            tokenResponse = await msalInstance.acquireTokenSilent(loginRequest);
        } catch (error) {
            if (error instanceof msal.InteractionRequiredAuthError) {
                console.warn("Interazione richiesta, avvio loginPopup...");
                tokenResponse = await msalInstance.loginPopup(loginRequest);
            } else {
                throw error;
            }
        }
        console.log('Token: ' + tokenResponse.accessToken);
        document.getElementById("loadingSpinner").style.display = "none"; // Nasconde il caricamento
        await startChatbot(tokenResponse.accessToken);
    } catch (error) {
        console.error("Errore di autenticazione:", error);
    }
}

async function startChatbot(token) {
    //document.getElementById("loadingSpinner").style.display = "block";
    var chatbotContainer = document.createElement("div");
    chatbotContainer.className = "chat-container";
    var chatbot = document.createElement("iframe");
    var currentSrc = "https://copilotstudio.microsoft.com/environments/Default-6e2880d1-7e98-4f54-94d2-7799433097ed/bots/cr0b7_agenteTestV1/webchat?__version__=2";
    // Aggiungiamo il parametro 'name' all'URL esistente
    if (currentSrc.indexOf("?") > -1) {
        // Se l'URL ha già dei parametri, aggiungiamo '&token='
        chatbot.src = currentSrc + "&token=" + encodeURIComponent(token);
    } else {
        // Se l'URL non ha parametri, iniziamo con '?' per aggiungere il primo parametro
        chatbot.src = currentSrc + "?token=" + encodeURIComponent(token);
    }
    chatbotContainer.appendChild(chatbot)
    document.body.appendChild(chatbotContainer)
}

window.onload = login;