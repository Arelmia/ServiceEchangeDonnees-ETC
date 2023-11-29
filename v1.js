const {Router} = require("express");
const bodyParser = require("body-parser");
const {logger, default_cors, parse_page, build_URLs, parse_player, parse_id, acceptsMime, isMime} = require("./validation/middlewares");
const bd = require("./database");

const router = Router();

const multer = require("multer");
const utils = require("./lib.utils");
const createPdf = require("./pdf/create-pdf");

const filter = (req, file, cb) => {
    if (file.size < 1000000 && ( file.mimetype === "image/jpeg" ||file.mimetype === "image/png")) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

const playerUpload = multer({dest: "./uploads", filter: filter});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
router.use(default_cors);
router.use(logger);

router.use((req, res, next) => {
   req.version = "v1";
   next();
});

router.get("/players", acceptsMime(utils.MIME_JSON), parse_page, build_URLs, async (req, res) => {
    try {
        let players = (await bd.queryAllPlayers(req.pageInfo.per_page, req.pageInfo.offset, req.pageInfo.order_by)).rows;

        players = players.map(player => {
            let {
                password,
                email,
                platform,
                profile_pic,
                ...validData
            } = player;
            return validData;
        });

        res.json({
            players,
            ...req.pageInfo,
            ...req.urlInfo
        });
    }
    catch (e) {
        res.status(500).end();
    }
});

router.get("/players.pdf", acceptsMime(utils.MIME_PDF), parse_page, async (req, res) => {
    try {
        let players = (await bd.queryAllPlayers(req.pageInfo.per_page, req.pageInfo.offset, req.pageInfo.order_by)).rows;

        res.setHeader('Content-Type', utils.MIME_PDF);

        res.setHeader("Content-Disposition", `attachment; filename=${utils.PDF_FILENAME}`);

        createPdf(players, res);
    }
    catch (e) {
        res.status(500).end();
    }
});

router.get("/players/:id", acceptsMime(utils.MIME_JSON), parse_id, async (req, res) => {
    // TODO: Retourner le lien vers la ressource
    try {
        let queryResult = (await bd.queryPlayerWithId(req.id)).rows;

        if (queryResult.length === 1) {
            res.json(queryResult[0]);
        }
        else {
            res.status(404).end();
        }
    }
    catch (e) {
        res.status(500).end();
    }
});

router.post("/players", isMime(utils.MIME_JSON, utils.MIME_URL_ENCODED, utils.MIME_MULTIPART_FORM_DATA), playerUpload.single("profile_pic"), parse_player, async (req, res) => {
    try {
        let success = (await bd.insertPlayer(req.player)) === 1;

        if (success) {
            res.status(204).end();
        }
        else {
            res.status(500).end();
        }
    }
    catch (e) {
        res.status(500).end();
    }
});

router.post("/players/:id", isMime(utils.MIME_JSON, utils.MIME_URL_ENCODED, utils.MIME_MULTIPART_FORM_DATA), playerUpload.single("profile_pic"), parse_id, parse_player, async (req, res) =>{
    try {
        let success = (await bd.updatePlayerWithId(req.id, req.player)) === 1;
        if (success) {
            res.status(204).end();
        }
        else {
            res.status(404).end();
        }
    }
    catch (e) {
        console.log(e);
        res.status(500).end();
    }
});

module.exports = router;