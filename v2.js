// region dependencies
const {Router} = require("express");
const bodyParser = require("body-parser");
const {
    logger,
    default_cors,
    acceptsMime,
    parse_page,
    build_URLs,
    parse_id,
    isMime,
    parse_player,
    parse_user,
    get_proxy_protocol,
    parse_update_user, parse_image_format,
} = require("./validation/middlewares");

const {
    authenticate,
    login,
    editorAuthenticate
} =  require("./auth/middlewares");

const bd = require("./database");
const session = require('cookie-session');
const utils = require("./lib.utils");
const createPdf = require("./pdf/create-pdf");
const multer = require("multer");
// endregion dependencies

// On crée notre routeur
const router = Router();

/**
 * Le filtre multer permettant de laisser seulement uploader des fichiers s' ils sont des images faisant moins de
 * 10 MB
 * @param req - L' objet représentant la requête du client
 * @param file - Les informations sur le fichier que le client essaie de upload
 * @param cb - Le callback appelé après la verification
 */
const filter = (req, file, cb) => {
    if (file.size < 10000000 && ( file.mimetype === "image/jpeg" ||file.mimetype === "image/png")) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

// On crée notre objet multer
const playerUpload = multer({dest: "./uploads", filter});

// region Middlewares globaux
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(default_cors);
router.use(get_proxy_protocol)
router.use(logger);

router.use((req, res, next) => {
   req.version = "v2";
   next();
});

router.use(session(
    {
        name: 'session',
        keys: ['Wow, what a marvelous key here']
    }
));
// endregion

// Route permettant de se connecter, se déconnecter et d' obtenir de l' information sur l' utilisateur connecté
router.route("/login")
    .post(login, (req, res) => {
        res.status(200).end();
    })
    .delete(authenticate, (req, res) => {
        req.session = null;
        res.status(200).end();
    })
    .get(authenticate, (req, res) => {
        res.json(req.session);
    });

// Route permettant de s' enregistrer, de supprimer son compte et de modifier le mot de passe de compte
router.route("/register")
    .post(parse_user, async (req, res) => {
        // On essaie de sauvegarder le joueur dans la base de données...
        let answer = await bd.insertUser(req.user_info.username, req.user_info.password);

        if(answer.rowCount === 0) {
            // Si on a aucune ligne d' affectée, on a un problème et on retourne le status 500 pour l' indiquer
            res.status(500).end();
        } else {
            // Sinon, on indique que ça a été un succès en retournant 200
            // (pas 204 car on "retourne" un cookie de session)
            res.status(200).end();
        }
    })
    .delete(authenticate, async (req, res) => {
        // On obtiens l' id et le nom d' utilisateur à partir de la session...
        const {id, username} = req.session;
        // On détruit la session
        req.session = null;

        // On essaie de supprimer l' utilisateur de la base de données
        const response = await bd.deleteUser(id,username);

        if (response.rowCount === 0) {
            // Si on a aucune ligne d' affectée, on a un problème et on retourne le status 500 pour l' indiquer
            res.status(500).end();
        }
        else {
            // Sinon, on indique que ça a été un succès en retournant 200
            // (pas 204 car on "retourne" une instruction de supprimer les cookies de session)
            res.status(200).end();
        }
    })
    .patch(authenticate, parse_update_user, async (req, res) => {
        // On essaie de modifier le mot de passe de l' utilisateur dans la base de données
        let answer = await bd.changePasswordOfUser(req.session.id, req.user_info.password);

        if(answer.rowCount === 0) {
            // Si on a aucune ligne d' affectée, on a un problème et on retourne le status 500 pour l' indiquer
            res.status(500).end();
        } else {
            req.session = null;
            // Sinon, on indique que ça a été un succès en retournant 200
            // (pas 204 car on "retourne" une instruction de supprimer les cookies de session)
            res.status(200).end();
        }
    });

// Route permettant d' obtenir une liste de joueurs et de rajouter un joueur
router.route("/players")
    .get(authenticate, acceptsMime(utils.MIME_JSON), parse_page, build_URLs, async (req, res) => {
        // On obtiens les joueurs selon les informations de page de la requête
        let players = (await bd.queryAllPlayers(req.pageInfo.per_page, req.pageInfo.offset, req.pageInfo.order_by)).rows;

        // On map les joueurs...
        players = players.map(player => {
            // On obtiens les champs requis...
            let {
                id,
                username,
                level,
                last_connection
            } = player;
            // On retourne l' information requise ainsi qu' un lien vers la ressource
            return {
                id,
                username,
                level,
                // Car ça rajoute un 'Z' à la suite de la date
                last_connection: last_connection ? last_connection.toISOString().slice(0, -1) : null,
                details: `${req.proxy_protocol}://${req.get('host')}/${req.version}/players/${player.id}`
            }
        });

        // On réponds avec les informations de la page, les liens et les joueurs
        res.json({
            players,
            ...req.pageInfo,
            ...req.urlInfo
        });
    })
    .post(editorAuthenticate, isMime(utils.MIME_JSON, utils.MIME_FORM_URL_ENCODED, utils.MIME_URL_ENCODED, utils.MIME_MULTIPART_FORM_DATA), playerUpload.single("profile_pic"), parse_player, async (req, res) => {
        // On essaie d' insérer le nouveau joueur
        let success = (await bd.insertPlayer(req.player)) === 1;

        if (success) {
            // Si on a réussi on l' indique avec le code de status 204
            // (et non pas 200 car on ne retourne rien)
            res.status(204).end();
        }
        else {
            // Sinon on retourne un code 500 pour indiquer l' erreur
            res.status(500).end();
        }
    });

// Route permettant d' obtenir une liste de joueurs sous la forme d'un PDF
router.get("/players.pdf", authenticate, acceptsMime(utils.MIME_PDF), parse_page, async (req, res) => {
    // On obtiens les joueurs selon les informations de la page
    let players = (await bd.queryAllPlayers(req.pageInfo.per_page, req.pageInfo.offset, req.pageInfo.order_by)).rows;

    // On indique à la réponse que on a du PDF
    res.setHeader('Content-Type', utils.MIME_PDF);

    // On indique que c'est une pièce jointe pour le télécharger automatiquement
    res.setHeader("Content-Disposition", `attachment; filename=${utils.PDF_FILENAME}`);

    // On crée le PDF et on l'envoie
    createPdf(players, res);
});

// Route permettant d' obtenir la photo de profile d' un joueur en particulier
router.get("/players/:id.:format", authenticate, acceptsMime(utils.MIME_JPEG_IMAGE, utils.MIME_PNG_IMAGE), parse_id, parse_image_format, async (req, res) => {
    // On essaie d' obtenir le joueur avec l' id spécifié
    let queryResult = (await bd.queryPlayerWithId(req.id)).rows;

    if (queryResult.length === 1) {
        // Si on le trouve, on le stocke
        let player = queryResult[0];

        if (player.profile_pic) {
            // S' il a une photo de profile, on obtiens son type à partir des métadonnées de l' URL base64 la représentant
            let fileType = player.profile_pic.split(",")[0].split("/")[1].split(";")[0];

            if (fileType === req.format) {
                // Si on a le bon format d' image, on crée un buffer contenant l' information binaire sur l' image
                let imgBuffer = Buffer.from(player.profile_pic.split(",")[1], "base64");
                // On indique le format de l' image dans les headers
                res.setHeader('content-type', player.profile_pic.split(",")[0].split(":")[1]);
                // On envoie l' image
                res.send(imgBuffer).end();
            }
            else {
                // Si ce n' est pas le bon format, on retourne 404
                res.status(404).end();
            }
        }
        else {
            // Si le joueur n'a pas de photo de profile, on retourne 404
            res.status(404).end();
        }
    }
    else if (queryResult.length === 0){
        // Si le joueur n' existe pas, on retourne 404
        res.status(404).end();
    }
    else {
        // Si on a plus d' un enregistrement avec le même id (ce qui est techniquement impossible), on retourne 500
        res.status(500).end();
    }
})

// Route permettant d' obtenir toute l' information sur un joueur, de le modifier et de le supprimer
router.route("/players/:id")
    .get(authenticate, acceptsMime(utils.MIME_JSON), parse_id, async (req, res) => {
        // On obtiens le joueur selon l' id de la requête
        let queryResult = (await bd.queryPlayerWithId(req.id)).rows;

        if (queryResult.length === 1) {
            // Si on a un seul résultat, on le stocke.
            let player = queryResult[0];
            // On rajoute le lien vers la ressource aux joueurs...
            player = {
                ...player,
                details: `${req.proxy_protocol}://${req.get('host')}/${req.version}/players/${player.id}`
            }
            if (player.profile_pic) {
                player.profile_pic = player.details + "." + player.profile_pic.split(",")[0].split("/")[1].split(";")[0];
            }
            // On envoie le joueur
            res.json(player);
        }
        else if (queryResult.length === 0){
            // Sinon, si on a aucun joueur, on retourne 404 car on a pas trouvé le joueur
            res.status(404).end();
        }
        else {
            // On est pas supposé avoir un résultat autre que 1 ou 0 lignes, donc si on a un autre résultat c'est anormal
            res.status(500).end();
        }
    })
    .post(editorAuthenticate, isMime(utils.MIME_JSON, utils.MIME_URL_ENCODED, utils.MIME_MULTIPART_FORM_DATA), playerUpload.single("profile_pic"), parse_id, parse_player, async (req, res) =>{
        // On essaie de modifier le joueur
        let success = (await bd.updatePlayerWithId(req.id, req.player)) === 1;

        if (success) {
            // Si on a réussi à modifier le joueur on l' indique avec un status 204
            // (et non pas 200 car on ne retourne rien)
            res.status(204).end();
        }
        else {
            // Sinon, on a pas trouvé le joueur et on l' indique avec le status 404
            res.status(404).end();
        }
    })
    .delete(editorAuthenticate, parse_id, async (req, res) => {
        // On essaie de supprimer le joueur dans la bd
        let success = (await bd.deletePlayerWithId(req.id)) === 1;

        if (success) {
            // Si on réussi l' opération on l' indique avec un code de status 204
            // (et non pas 200 car on ne retourne rien)
            res.status(204).end();
        }
        else {
            // Sinon on a pas trouvé le joueur et on l' indique avec le code de status 404
            res.status(404).end()
        }
    });



// Route appelée lorsqu' une erreur arrive dans l' une des route et n' est pas attrapée dans la route elle-même
router.use((err, req, res, _next) => {
    console.log(err);

    // Webstorm ne détecte pas correctement les composantes de la fonction...
    // noinspection JSUnresolvedFunction
    res.status(500).end();
})

module.exports = router;