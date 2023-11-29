// region Containers
const playersContainer = document.getElementById("playersContainer");
const detailsContainer = document.getElementById("detailsContainer");
// endregion

let select = document.getElementById("selectNumberPerPage");

let currentPage = startingURL;
let orderBy = "id";
let selectedPlayerURL;
let selectedPlayerId;
let isEditor = false;

async function fetchPage(page_URL) {
    let response = await fetch(page_URL);
    if(response.status === 401)
        alertThenLogin();
    else
        return response.json();
}

async function fetchPlayer(player_URL) {
    let response = await fetch(player_URL);
    return response.json();
}

async function updatePage(page_URL) {
    let page = await fetchPage(page_URL);

    currentPage = page.cur_page;
    document.getElementById("currentPage").innerText = page.page;
    document.getElementById("lastPage").innerText = page.page_count;

    updateNavigationButton(page);
    updatePdfDownloadLink(page);

    updatePlayerList(page.players);
}

function updateNavigationButton(page_data) {
    let firstPageNav = document.getElementById("firstPageNav");
    let previousPageNav = document.getElementById("previousPageNav");
    let nextPageNav = document.getElementById("nextPageNav");
    let lastPageNav = document.getElementById("lastPageNav");

    firstPageNav.onclick = () => navigationButtonAction(page_data.first_page);
    previousPageNav.onclick = () => navigationButtonAction(page_data.previous_page);
    nextPageNav.onclick = () => navigationButtonAction(page_data.next_page);
    lastPageNav.onclick = () => navigationButtonAction(page_data.last_page);
}

async function updateDetailsView(player_URL) {
    if(await areTheClientLogged()) {
        let player = await fetchPlayer(player_URL);

        let deleteButton = document.getElementById("deleteButton");

        detailsContainer.action = player_URL;

        let username = document.getElementById("username");
        let password = document.getElementById("password");
        let email = document.getElementById("email");
        let level = document.getElementById("level");
        let platform = document.getElementById("platform");
        let last_connection = document.getElementById("last_connection");
        let profile_pic_view = document.getElementById("profile_pic_view");

        document.getElementById("submit").value = "Sauvegarder";

        deleteButton.classList.remove("hiddenButton");

        deleteButton.onclick = () => deletePlayer(player_URL);

        username.value = player.username;
        password.value = player.password;
        email.value = player.email;
        level.value = player.level;
        platform.value = player.platform;
        last_connection.value = player.last_connection;
        profile_pic_view.src = player.profile_pic || defaultUserAvatar;

        if (player.profile_pic) {
            profile_pic_view.alt = `${player.username}'s Avatar`;
        }
        else {
            profile_pic_view.alt = `Default Avatar`
        }
    } else {
        alertThenLogin();
    }
}

function clearDetailsView() {
    detailsContainer.action = postURL;
    let profile_pic_view = document.getElementById("profile_pic_view");
    profile_pic_view.src = defaultUserAvatar;
    profile_pic_view.alt = "Default Avatar";
    detailsContainer.reset();

    document.getElementById("submit").value = "Ajouter";
    document.getElementById("deleteButton").classList.add("hiddenButton");
}

function navigationButtonAction(page_URL) {
    if (page_URL) {
        updatePage(page_URL);
    }
}

function deletePlayer(player_URL) {
    fetch(player_URL, {
        method: 'DELETE'
    }).then(response => {
        if(response.ok) {
            if (selectedPlayerURL === player_URL) {
                clearDetailsView();
            }
            updatePage(currentPage);
        }
    });
}

function updatePlayerList(players) {
    playersContainer.innerHTML = "";

    players.forEach((player) => {
        let row = generatePlayerRow(player);
        if (selectedPlayerId && selectedPlayerId === player.id) {
            row.classList.add("selectedPlayer");
        }
        playersContainer.appendChild(row);
    });
}

function generatePlayerRow(player_data) {
    let row = document.createElement("tr");
    let player_id = document.createElement("td");
    let player_username = document.createElement("td");
    let player_level = document.createElement("td");
    let player_last_connection = document.createElement("td");

    player_id.innerText = player_data.id;
    player_username.innerText = player_data.username;
    player_level.innerText = player_data.level;
    player_last_connection.innerText = new Date(player_data.last_connection).toLocaleString();

    row.appendChild(player_id);
    row.appendChild(player_username);
    row.appendChild(player_level);
    row.appendChild(player_last_connection);

    if (isEditor) {
        let player_delete = document.createElement("td");
        let player_delete_button = document.createElement("input");
        player_delete_button.type = "button";
        player_delete_button.value = "Delete"
        player_delete_button.onclick = async (event) => {
            event.stopPropagation();
            deletePlayer(player_data.details);
        }
        player_delete.appendChild(player_delete_button);

        row.appendChild(player_delete);
    }

    row.onclick = () => {
        updateDetailsView(player_data.details);
        selectedPlayerURL = player_data.details;
        selectedPlayerId = player_data.id;
        for (let i = 0; i < playersContainer.children.length; i++) {
            playersContainer.children[i].classList.remove("selectedPlayer");
        }
        row.classList.add("selectedPlayer");
    }

    row.classList.add("playerRow");

    row.id = "player-" + player_data.id;

    return row;
}

function updatePdfDownloadLink(page) {
    let linkElement = document.getElementById("pdfDownloadLink");
    linkElement.href = page.pdf_page;
}

async function loadEditorStatus() {
    let response = await fetch(editorCheckStatus);

    if (response.ok) {
        if ((await response.json()).role !== "EDITOR") {
            isEditor = false;
            let inputs = document.getElementsByTagName("input")
            for (let i = 0; i < inputs.length; i++) {
                if (!inputs[i].classList.contains("navigation")){
                    inputs[i].disabled = true;
                }
            }

            let editorFields = document.getElementsByClassName("editorField")
            for (let i = 0; i < editorFields.length; i++) {
                editorFields[i].classList.add("disabledEditorElement");
            }
        }
        else {
            isEditor = true;
        }
        return response.status;
    }
    else if (response.status === 401) {
        alertThenLogin();
        return response.status;
    }
    else {
        alert("Le système d'échange de données est inacessible pour le moment... Veuillez réessayer plus tard...");
        return response.status;
    }
}

async function updatePageDetails() {
    let selectedPageCount = document.getElementById("pageCount").value;

    let url = new URL(startingURL);
    url.searchParams.set("per_page", selectedPageCount);
    url.searchParams.set("order_by", orderBy);

    await updatePage(url.toString());
}

async function onSubmit() {
    // Très mal fait...
    setTimeout(() => {updatePage(currentPage); updateDetailsView(selectedPlayerURL)}, 100)
}

async function changeOrderBy(element, newOrderBy) {
    let headers = document.getElementsByClassName("orderByHeader");
    for (let i = 0; i < headers.length; i++) {
        headers[i].classList.remove("selectedOrderByHeader");
    }
    element.classList.add("selectedOrderByHeader");

    orderBy = newOrderBy;
    await updatePageDetails();
}

async function logout() {
    let response = await fetch(requestLogin, {
        method: 'delete',
        credentials: 'include'
    });
    if(response.ok) {
        window.location.replace(loginURL);
    } else if (response.status === 401) {
        window.location.replace(loginURL);
    }
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

function alertThenLogin() {
    alert("Veuillez vous connecter pour accéder au sîte");
    window.location.replace(loginURL);
}

async function areTheClientLogged() {
    let response = await fetch(requestLogin);
    return response.ok;
}

function redirect(url) {
    window.location.href = url;
}

(async ()=> {

    clearDetailsView();
    let status = await loadEditorStatus();
    if(status === 200)
        await updatePage(startingURL);
})();