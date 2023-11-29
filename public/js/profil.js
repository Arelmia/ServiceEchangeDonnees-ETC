let userContainer = document.getElementById("userContainer");
let roleContainer = document.getElementById("roleContainer");
let editorMailLink = document.getElementById("editorMailLink");
let newPassword = document.getElementById("newPassword");
let id;

function setMailTo() {
    editorMailLink.href = `mailto:${adminEmail}?subject=${editorRequestSubject}&body=${editorRequestBody + id}`;
}

async function getConnectedUser() {
    let response = await fetch(requestLogin);
    if(response.ok) {
        let json = await response.json();
        id = json.id;
        let username = json.username;
        let role = json.role;

        userContainer.innerText = username;
        roleContainer.innerText = role;

        if(role === "EDITOR") {
            editorMailLink.classList.add('disappear');
        }
    }
}

async function changePassword() {
    let password = newPassword.value;
    console.log(password);

    let response = await fetch(requestRegister, {
        method: 'PATCH',
        credentials: 'include',
        body: new URLSearchParams([
            ['password', password]
        ])
    }).catch(() => console.log("Un erreur s'est produite"));

    if(await response.status === 200) {
        redirect(loginURL);
    } else {
        alert("Votre mot de passe est invalide !");
    }
}

function redirect(url) {
    window.location.href = url;
}

async function unsubscribe() {
    let response = await fetch(requestRegister, {
        method: 'delete',
        credentials: 'include'
    });
    if(response.ok) {
        window.location.replace(loginURL);
    } else if (response.status === 401) {
        alertThenLogin();
    }
}

(function main() {
    getConnectedUser().then(()=>{
        setMailTo();
    })
})();
