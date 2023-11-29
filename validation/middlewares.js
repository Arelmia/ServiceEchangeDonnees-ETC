// region Dépendances
const cors = require("cors");
const {PLAYER_SCHEMA, PAGE_SCHEMA, PROTOCOL_SCHEMA, ID_SCHEMA, USERS_SCHEMA, USERS_PASSWORD_SCHEMA, IMAGE_FORMAT_SCHEMA} = require("./validation-schemas");
const utils = require("../lib.utils");

const database = require("../database");

const fs = require("fs").promises;
// endregion Dépendances

const origin = process.env.ORIGIN || "localhost:3000";

/**
 * Fonction générant un middleware permettant de s' assurer que le type de
 * la requête est l' un des type supporté
 * @args Types supportés
 * @returns Middleware - Le middleware de validation de type
 */
function isMime() {
    const args = Array.from(arguments);
    return (req, res, next) => {
        if (!req.is(...args)) {
            res.status(415).end();
        } else {
            next();
        }
    }
}

/**
 * Fonction générant un middleware permettant de s' assurer que le type de la réponse que l' on va envoyer est
 * supporté par le client.
 * @returns {(function(*, *, *): void)|*}
 */
function acceptsMime() {
    const args = Array.from(arguments);
    return (req, res, next) => {
        if (!req.accepts(...args)) {
            res.status(406).end();
        } else {
            next();
        }
    }
}

/**
 * Middleware permettant de "logger" toutes les requêtes faites avec leur méthode et leur chemin
 * @param req - La requête du client
 * @param res - La réponse du serveur
 * @param next - Fonction à appeler pour continuer dans la route
 */
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
};

/**
 * Middleware initialisant les valeurs par défaut pour le CORS
 */
const default_cors = cors({origin})

/**
 * Middleware permettant de valider une requête de changement de mot de passe utilisateur et de la stocker dans
 * `req.user_info`
 * @param req - La requête du client
 * @param res - La réponse du serveur
 * @param next - Fonction à appeler pour continuer dans la route
 */
const parse_update_user = (req, res, next) => {
    let result = USERS_PASSWORD_SCHEMA.validate(req.body);

    if(result.error)
        res.status(400).send(result.error.details[0].message)
    else {
        req.user_info = {
            ...req.body
        }
        next();
    }
}

/**
 * Middleware permettant de valider un utilisateur dans la requête du client et de le stocker dans `req.user_info`
 * @param req - La requête du client
 * @param res - La réponse du serveur
 * @param next - Fonction à appeler pour continuer dans la route
 */
const parse_user = (req, res, next) => {
    let result = USERS_SCHEMA.validate(req.body);

    if(result.error)
        res.status(400).send(result.error.details[0].message)
    else {
        req.user_info = {
            ...req.body
        }
        next();
    }
}

/**
 * Middleware permettant de valider les différents champs d' une requête vers pour une page et les stocke dans
 * `req.pageInfo`
 * @param req
 * @param res
 * @param next
 */
const parse_page = async (req, res, next) => {

    let result = PAGE_SCHEMA.validate(req.query);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
    }
    else {
        let pageInfo = result.value;
        pageInfo.order_by = pageInfo.order_by.join();

        pageInfo.playerTotal = await database.queryPlayerCount();
        pageInfo.offset = (pageInfo.page - 1) * pageInfo.per_page;

        if (pageInfo.offset >= pageInfo.playerTotal) {
            // Si on veut obtenir des films qui ont un index plus élevé que le total, on indique qu'on ne peut pas
            // en ayant un status 422 (impossible de traiter la demande)
            res.status(422).send(utils.ERR_422_MESSAGE);
            return;
        }

        pageInfo.page_count = Math.ceil(pageInfo.playerTotal / pageInfo.per_page);

        req.pageInfo = pageInfo;
        next();
    }
}



const parse_player = async (req, res, next) => {
    let profile_pic;

    if (req.file) {
        profile_pic = `data:${req.file.mimetype};base64,${(await fs.readFile("./uploads/" + req.file.filename, {encoding: 'base64'}))}`;

        fs.unlink("./uploads/" + req.file.filename).then(); // Rien à faire après la supression...
    }
    else {
        let player = null;
        if (req.id) {
            player = (await database.queryPlayerWithId(req.id)).rows[0];
        }
        profile_pic = player ? player.profile_pic : null;
    }


    let result = PLAYER_SCHEMA.validate(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
    }
    else {
        req.player = {
            profile_pic,
            ...result.value
        };
        next();
    }
}

const parse_id = (req, res, next) => {
    let {id} = req.params;

    // Mis dans des crochets pour avoir le bon message d'erreur
    let idValidation = ID_SCHEMA.validate({id});

    if (idValidation.error) {
        res.status(400).send(idValidation.error.message);
    }
    else {
        req.id = idValidation.value.id;
        next();
    }
}

const parse_image_format = (req, res, next) => {
    let {format} = req.params;

    let formatValidation = IMAGE_FORMAT_SCHEMA.validate({format});

    if (formatValidation.error) {
        res.status(404).end();
    }
    else {
        req.format = formatValidation.value.format;
        next();
    }
}

function buildUrl(req, path, per_page, page, order_by, protocol) {
    let base_url = `${protocol}://${req.get('host')}/${req.version}${path}`
    return `${base_url}?per_page=${per_page}&page=${page}&order_by=${order_by}`
}

const build_URLs = (req, res, next) => {
    let {
        per_page,
        page,
        order_by,
        page_count
    } = req.pageInfo;

    let path = req.path;
    let pdfPath = req.path + ".pdf";

    req.urlInfo = {
        next_page :     page + 1 <= page_count ? buildUrl(req, path, per_page, page + 1, order_by, req.proxy_protocol) : undefined,
        previous_page : page - 1 >= 1 ? buildUrl(req, path, per_page, page - 1, order_by, req.proxy_protocol) : undefined,
        cur_page :      buildUrl(req, path, per_page, page, order_by, req.proxy_protocol),
        first_page :    buildUrl(req, path, per_page, 1, order_by, req.proxy_protocol),
        last_page :     buildUrl(req, path, per_page, page_count, order_by, req.proxy_protocol),
        pdf_page :      buildUrl(req, pdfPath, per_page, page, order_by, req.proxy_protocol)
    };

    next();
}

const get_proxy_protocol = (req, res, next) => {
    let protocol = req.headers['x-forwarded-proto'] || req.protocol;

    // Mis dans des crochets pour avoir le bon message d'erreur
    let protocolValidationResult = PROTOCOL_SCHEMA.validate({protocol});

    if (protocolValidationResult.error) {
        res.status(400).send(protocolValidationResult.error.message);
        return;
    }

    req.proxy_protocol = protocolValidationResult.value.protocol;

    next();
}


module.exports = {
    logger,
    default_cors,
    parse_page,
    parse_player,
    parse_id,
    parse_image_format,
    build_URLs,
    acceptsMime,
    isMime,
    parse_user,
    buildUrl,
    get_proxy_protocol,
    parse_update_user
};