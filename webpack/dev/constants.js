// region Default Values
const minPerPage = 10;
const maxPerPage = 100;
const defaultPerPage = 50;
const startingURL = "http://localhost:3000/v2/players?per_page=50&page=1&order_by=id";
const postURL = "http://localhost:3000/v2/players";
const loginURL = "http://localhost:3000/public/login.html";
const profilURL = "http://localhost:3000/public/profil.html";
const adminEmail = "201831113@collegealma.ca";
const editorRequestSubject = "Demande de changement de rôle";
const editorRequestBody = "L'utilisateur ayant l'ID suivant souhaite effectuer un changement de rôle pour EDITOR: ";
const editorCheckStatus = "http://localhost:3000/v2/login"
const defaultUserAvatar = "./defaultUserAvatar.png";
const defaultUserAvatarDescription = "Default Avatar";

const requestLogin    = 'http://localhost:3000/V2/login';
const requestRegister = 'http://localhost:3000/V2/register';
const htmlRedirect    = "index.html";

const environment = "development";
// endregion