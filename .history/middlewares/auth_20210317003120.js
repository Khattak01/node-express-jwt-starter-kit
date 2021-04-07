const jwt = require('jsonwebtoken')

const config = require('config')

module.exports = function (req, res, next) {
    //get the token from the header
    const token = req.header('x-auth-token')

    //check if not token
    if (!token)
        return res.status(401).json({ msg: 'No token, authorization denied' })

    //if there is one, verify the token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        if(decoded.user)
            req.user = decoded.user
        else if(decoded.lab) 
            req.lab = decoded.lab
        else if(decoded.admin)
            req.admin = decoded.admin
            
        next()
    } catch (error) {
        res.status(401).json({ msg: 'token is not valid' })
        return;
    }
}