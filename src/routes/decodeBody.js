const {jwtVerify} = require('jose');
const {httpJwtSecret} = require("../config");

const decodeBody = async (req, res, next) => {
    console.log(`decode body called on ${req.url}\n`);
    if (req.body && Object.keys(req.body).length > 0) {
        const reqBody = req.body;
        console.log(`body: ${JSON.stringify(reqBody)}`);
        try {
            const key = new TextEncoder().encode(httpJwtSecret);
            const {payload} = await jwtVerify(reqBody.signature, key);
            const {iat, exp, ...decodedBody} = payload;
            console.log(`decoded body: ${JSON.stringify(decodedBody)}\n`);

            if (JSON.stringify(decodedBody) !== JSON.stringify(reqBody.body)) {
                return res.status(418).send({message: "lmao"});
            }

            req.body = reqBody.body;
        } catch (err) {
            console.log(err.toString())
            return res.status(418).send({message: "lmao"});
        }
    }
    next();
};

module.exports = {decodeBody};