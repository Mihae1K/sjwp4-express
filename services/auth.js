const JWT_SECRET_KEY = "1q47P22p7JCuitX8yVyPEyy3JGK6zStjoogoBlzLwJdH0vU5FdU9jTcXMY5x0Kww6qxgSx40gYyBITWdYyFhARMZ0lwYP2FWcWrv6KyEoMXkP9S4UOCHwtk0FLbSR3sy";

const JWT = require("jsonwebtoken");

function getUserJWT(id, email, name, role, expDays = 7 ) {
    const tokenData = {
        uid: id,
        email: email,
        name: name,
        role: role,
        time: Date.now()
    };

    const tokenOptions = {
        expiresIn: expDays*24*60*60
    };

    const token = JWT.sign(tokenData, JWT_SECRET_KEY, tokenOptions);

    return token;
}

// MIDDLEWARE FOR AUTH COOKIE CHECK
function checkAuthCookie(req, res, nex) {
    const token = req.cookies["auth"];
    console.log("COOKIE CHECK: ", token)

    const result = JWT.verify(token, JWT_SECRET_KEY);
    console.log("TOKEN CHECK: " + result);
}

module.exports = {
    getUserJWT,
    checkAuthCookie
};