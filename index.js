const express = require("express");
const app = express();

// Port spécifié dans la variable environment ou le port 3000 par défaut.
// Ne fonctionne pas avec le front-end car l' URL et le port sont spécifiés dans le fichier statique "constants.js"
const port = process.env.PORT || 3000;

// On fait confiance au serveur proxy pour qu' on puisse accéder aux headers qu' il nous envoie
app.set('trust_proxy', true);

// Route V1
app.use("/V1", require("./v1"));

// Route V2
app.use("/V2", require('./v2'));

// Documents publics statiques
app.use("/public", express.static("./public"));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});