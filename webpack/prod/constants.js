// region Default Values
const minPerPage = 10;
const maxPerPage = 100;
const defaultPerPage = 50;
const startingURL = "https://player-sim-test.herokuapp.com/v2/players?per_page=50&page=1&order_by=id";
const postURL = "https://player-sim-test.herokuapp.com/v2/players";
const loginURL = "https://player-sim-test.herokuapp.com/public/login.html";
const profilURL = "https://player-sim-test.herokuapp.com/public/profil.html";
const adminEmail = "201831113@collegealma.ca";
const editorRequestSubject = "Demande de changement de rôle";
const editorRequestBody = "L'utilisateur ayant l'ID suivant souhaite effectuer un changement de rôle pour EDITOR: ";
const editorCheckStatus = "https://player-sim-test.herokuapp.com/v2/login"
const defaultUserAvatar = "./defaultUserAvatar.png";
const defaultUserAvatarDescription = "Default Avatar";

const requestLogin    = 'https://player-sim-test.herokuapp.com/V2/login';
const requestRegister = 'https://player-sim-test.herokuapp.com/V2/register';
const htmlRedirect    = "index.html";

const environment = "production";
// endregion