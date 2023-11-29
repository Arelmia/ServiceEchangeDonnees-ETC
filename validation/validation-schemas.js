const joi = require("joi").extend(joi => ({
    base: joi.array(),
    coerce: (value, _) => ({
        value: value.split ? value.split(',') : [value]
    }),
    type:'csvArray'
}));

const VALID_DB_FIELDS = ["id", "username", "email", "level", "last_connection"];

const PLAYER_SCHEMA = joi.object({
    username: joi.string().alphanum().min(3).max(50).required(),
    password: joi.string().min(3).max(150).required(),
    email: joi.string().email().required(),
    level: joi.number().integer().default(1).min(1).max(100),
    platform: joi.string().allow("").alphanum().optional(),
    last_connection: joi.date().empty("").optional()
});

// noinspection JSUnresolvedFunction
const PAGE_SCHEMA = joi.object({
    per_page: joi.number().integer().min(10).max(100).default(50),
    page: joi.number().integer().min(1).default(1),
    order_by: joi.csvArray().default(["id"]).items(joi.string().valid(...VALID_DB_FIELDS)).single().unique()
});

const PROTOCOL_SCHEMA = joi.object({protocol: joi.string().valid("http", "https").required()});

const ID_SCHEMA = joi.object({
    id: joi.number().integer().greater(0).required()
});

const IMAGE_FORMAT_SCHEMA = joi.object({format: joi.string().valid("jpg", "jpeg", "png").required()});

const USERS_SCHEMA = joi.object({
    username: joi.string().alphanum().min(3).max(50).required(),
    password: joi.string().trim().min(3).max(50).required(),
});

const USERS_PASSWORD_SCHEMA = joi.object({
    password: joi.string().trim().min(3).max(50).required(),
});

module.exports = {
    PLAYER_SCHEMA,
    PAGE_SCHEMA,
    PROTOCOL_SCHEMA,
    ID_SCHEMA,
    IMAGE_FORMAT_SCHEMA,
    USERS_SCHEMA,
    USERS_PASSWORD_SCHEMA
}