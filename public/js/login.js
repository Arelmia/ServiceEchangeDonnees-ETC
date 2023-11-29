let usernameConnexion   = document.getElementById("usernameConnexion");
let passwordConnexion   = document.getElementById("passwordConnexion");
let newPassword         = document.getElementById("newPassword");
let usernameInscription = document.getElementById("usernameInscription");
let passwordInscription = document.getElementById("passwordInscription");

let infoMessage     = document.getElementById('infoMessage');
let formConnexion   = document.getElementById('formConnexion');
let formInscription = document.getElementById('formInscription');
let formPassword    = document.getElementById('formPassword');

let invalidUserError    = "Votre usager ou votre mot de passe est incorrect.";
let serverError         = "Réessayer plus tard.";
let validInscription    = "Vous pouvez maintenant vous identifier."

async function connexion() {
    let usernameText = usernameConnexion.value;
    let passwordText = passwordConnexion.value;

    await fetchPost(requestLogin, usernameText, passwordText).then((response) => {
        if(response.status === 200) {
            redirect(htmlRedirect);
        } else if(response.status === 401) {
            showErrorMessage(invalidUserError);
        } else {
            showErrorMessage(serverError);
        }
    })
        .catch(() => showErrorMessage(serverError));
}

async function inscription() {
    let usernameText = usernameInscription.value;
    let passwordText = usernameInscription.value;

    await fetchPost(requestRegister, usernameText, passwordText)
        .then((response) => {
            if(response.status === 200) {
                formInscription.reset();
                showConfirmMessage(validInscription);
            } else {
                showErrorMessage(serverError);
            }
        })
        .catch(() => showErrorMessage(serverError));
}

function fetchPost(link, username, password) {
    return fetch(link, {
        method: 'POST',
        credentials: 'include',
        body: new URLSearchParams([
            ['username', username],
            ['password', password]
        ])
    });
}

function redirect(url) {
    window.location.href = url;
}

function showErrorMessage(message) {
    infoMessage.innerText = message;
    infoMessage.className = '';
    infoMessage.classList.add("error");
}

function showConfirmMessage(message) {
    infoMessage.innerText = message;
    infoMessage.className = '';
    infoMessage.classList.add("confirm");
}