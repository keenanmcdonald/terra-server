const express = require('express')
const AuthService = require('./auth-service')
const {requireAuth} = require('../middleware/jwt-auth')
const UserService = require('../users/users-service')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter.post('/login', jsonBodyParser, (req, res, next) => {
        const {email, password } = req.body
        const loginUser = {email, password}

        for (const [key, value] of Object.entries(loginUser)){
            if (value == null){
                return res.status(400).json({error: `missing ${key} in request body`})
            }
        }
    
        AuthService.getUserWithEmail(
            req.app.get('db'),
            loginUser.email.toLowerCase()
        )
            .then(dbUser => {
                if (!dbUser){
                    return res.status(400).json({
                        error: 'Incorrect username or password'
                    })
                }
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        if (!compareMatch){
                            return res.status(400).json({
                                error: 'Incorrect username or password'
                            })
                        }
                        const sub = dbUser.email
                        const payload = {user_id: dbUser.id}
                        res.send({
                            user: dbUser,
                            authToken: AuthService.createJwt(sub, payload),
                        })
                    })
            })
            .catch(next)
    })

authRouter.post('/verify_token', jsonBodyParser, (req, res, next) => {
    const {authToken} = req.body
    
    const payload = AuthService.verifyJwt(authToken)

    if (payload){
        AuthService.getUserWithEmail(req.app.get('db'), payload.sub)
            .then(user => {
                if (!user){
                    return res.status(401).json({error: 'Unauthorized request'})
                }
                user = UserService.serializeUser(user)
                res
                    .status(201)
                    .json(user)
            })
            .catch(e => {
                next(e)
            })
    }
    else {
        res.status(401)
    }
})

authRouter.post('/refresh', requireAuth, (req, res) => {
    const sub = req.user.user_name
    const payload = {userid: req.user.id }
    res.send({
        authToken: AuthService.createJwt(sub, payload)
    })
})


module.exports = authRouter