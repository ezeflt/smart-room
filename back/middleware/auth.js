const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // exemple header = Authorization: 'Bearer <token>'
    const token = getTokenByHeader(req);

    if (!token) {
        // 401 Unauthorized
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // 403 Forbidden
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

const authenticateStreamToken = (req, res, next) => {
    const token = getTokenByQuery(req);

    if (!token) {
        return res.status(401);
    }
    
    // Vérifier le JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403);
        }
        req.user = user;
        next();
    });
};

module.exports = {authenticateToken, authenticateStreamToken}; 

function getTokenByQuery(req) {
    const token = req.query.token;
    return token;
}

function getTokenByHeader(req) {
    const authHeader = req.headers['authorization'];
    const [bearer, token] = authHeader?.split(' ');
    
    return token;
}