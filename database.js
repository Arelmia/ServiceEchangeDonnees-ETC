// region Dépendances
const utils = require("./lib.utils");
const { Pool } = require("pg");
const options = {
    ssl: {
        rejectUnauthorized: false
    }
};
const pool = new Pool(options);
// endregion Dépendances

/**
 * Fonction permettant à un client d'accéder à la base de données.
 * @return {Promise} Retourne une promesse permettant au client d'accéder à la base de données
 */
async function connection() {
    return pool.connect();
}

/**
 * Fonction permettant de relâcher la connection d'un client
 * @param client Représente le client dont la connection est à relâcher.
 */
async function endConnection(client) {
    client.release();
}

/**
 * Fonction permettant la recherche dans la base de données des joueurs selon différents paramètre.
 * @param limit La limite de données dans la requête.
 * @param offset L'offset dans la requête.
 * @param orderBy Permet d'ordonné les données selon les colonnes.
 * @return {Promise} Retourne une promesse représentant les données des différents joueurs.
 */
async function queryAllPlayers(limit, offset, orderBy = utils.DEFAULT_ORDER_BY) {
    const client = await connection(); // Connection du client à la base de données

    return client.query(`SELECT * FROM players ORDER BY ${orderBy} LIMIT $1 OFFSET $2`, [limit, offset])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données
}

/**
 * Fonction permettant la recherche du nombre de joueurs dans la base de données.
 * @return {number} Retourne le nombre de joueurs dans la base de données.
 */
async function queryPlayerCount() {
    const client = await connection(); // Connection du client à la base de données

    let response = await client.query("SELECT COUNT(1) as count FROM players")
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données

    return Number(response.rows[0].count); // Retourne le nombre de lignes affectées.
}

/**
 * Fonction permettant la recherche dans la base de données d'un joueur selon un identifiant unique.
 * @param id L'identifiant unique du joueur à rechercher
 * @return {Promise} Retourne une promesse représentant les données du joueur.
 */
async function queryPlayerWithId(id) {
    const client = await connection(); // Connection du client à la base de données

    let response = await client.query("SELECT * FROM players where id = $1", [id])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données

    if (response.rows[0] && response.rows[0].last_connection) { // Si le champs représentant la dernière connection existe...
        // ...on la modifie afin que ce soit une chaîne de caractère.
        response.rows[0].last_connection = response.rows[0].last_connection.toISOString().slice(0, -1);
    }

    return response; // Retourne la promesse
}

/**
 * Fonction permettant à mettre à jour un joueur.
 * @param id Représente l'identifiant unique du joueur à mettre à jour.
 * @param playerData Représente un objet contenant les différentes informations d'un joueur.
 * @return {number} Retourne le nombre de lignes mise à jour par la requête.
 */
async function updatePlayerWithId(id, playerData) {
    const client = await connection(); // Connection du client à la base de données

    let data = await client.query("UPDATE players SET username = $1, password = $2, email = $3, level = $4, platform = $5, last_connection = $6, profile_pic = $7 WHERE id = $8",
        [playerData.username, playerData.password, playerData.email, playerData.level, playerData.platform, playerData.last_connection, playerData.profile_pic, id])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données

    return data.rowCount; // Retourne le nombre de lignes affectées.
}

/**
 * Fonction permetant la suppression d'un joueur selon son identifiant unique.
 * @param id Représente l'identifiant unique du joueur à supprimer.
 * @return {number} Retourne le nombre de lignes supprimées par la requête.
 */
async function deletePlayerWithId(id) {
    const client = await connection(); // Connection du client à la base de données

    let data = await client.query("DELETE FROM players WHERE id = $1", [id])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données

    return data.rowCount; // Retourne le nombre de lignes affectées.
}

/**
 * Fonction permetant l'insertion d'un joueur
 * @param playerData Représente les différentes données utile à l'insertion d'un nouveau joueur
 * @return {number} Retourne le nombre de lignes insérées par la requête.
 */
async function insertPlayer(playerData) {
    const client = await connection(); // Connection du client à la base de données

    let data = await client.query("INSERT INTO players (username, password, email, level, platform, last_connection, profile_pic) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [playerData.username, playerData.password, playerData.email, playerData.level, playerData.platform, playerData.last_connection, playerData.profile_pic])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données

    return data.rowCount; // Retourne le nombre de lignes affectées.
}

/**
 * Fonction permetant la recherche d'un utilisateur dans la base de données selon son nom d'utilisateur
 * et son mot de passe.
 * @param username Représente le nom d'utilisateur de l'utilisateur.
 * @param password Représente le mot de passe de l'utilisateur.
 * @return {Promise} Retourne une promesse représentant l'utilisateur.
 */
async function queryByUserInfos(username, password) {
    const client = await connection(); // Connection du client à la base de données
    return client.query(`SELECT * FROM users WHERE username = $1 and password = $2 and active = true`, [username, password])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données
}

/**
 * Fonction permetant l'émulation d'une suppression d'un utilisateur en mettant à « faux » sa valeur « active »
 * @param id Représente l'identifiant unique de l'utilisateur à désactiver.
 * @param username Représente le nom d'utilisateur de l'utilisateur à désactiver.
 * @return {Promise} Retourne une promesse représentant l'utilisateur.
 */
async function deleteUser(id, username) {
    const client = await connection(); // Connection du client à la base de données
    return client.query(`UPDATE users set active = false WHERE id = $1 and username = $2`, [id, username])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données
}

/**
 * Fonction permetant l'insertion d'un utilisateur dans la base de données.
 * @param username Représente le nom d'utilisateur du nouvel utilisateur à insérer.
 * @param password Représente le mot de passe du nouvel utilisateur à insérer
 * @return {Promise} Retourne une promesse représentant l'utilisateur.
 */
async function insertUser(username, password) {
    const client = await connection(); // Connection du client à la base de données
    return client.query(`INSERT into users (username, password) VALUES ($1, $2)`, [username, password])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données
}

/**
 * Fonction permetant de modifier le mot de passe d'un utilisateur.
 * @param id Représente l'identifiant unique de l'utilisateur.
 * @param password Représente le nouveau mot de passe de l'utilisateur.
 * @return {Promise} Retourne une promesse représentant l'utilisateur.
 */
async function changePasswordOfUser(id, password) {
    const client = await connection(); // Connection du client à la base de données
    return client.query(`UPDATE users set password = $1 WHERE id = $2`, [password, id])
        .finally(endConnection(client)); // Effectue la requête et déconnecte le client de la base de données
}

module.exports = {
    queryAllPlayers,
    queryPlayerCount,
    queryPlayerWithId,
    updatePlayerWithId,
    deletePlayerWithId,
    insertPlayer,
    queryByUserInfos,
    deleteUser,
    insertUser,
    changePasswordOfUser
}