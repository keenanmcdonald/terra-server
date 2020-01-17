const express = require('express')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                serializedUsers = users.map(user =>{
                    return UsersService.serializeUser(user)
                })
                res.json(serializedUsers)
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {email, user_name, password} = req.body

        email = email.toLowerCase()

        for (const field of ['email', 'user_name', 'password']) {
            if (!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        const passwordError = UsersService.validatePassword(password)

        if (passwordError){
            return res.status(400).json({error: passwordError})
        }

        return UsersService.hasUserWithEmail(req.app.get('db'), email)
            .then(hasUser => {
                if (hasUser) {
                    return res.status(400).json({error: 'There is already an account associated with this email address'})
                }

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            email,
                            user_name,
                            password: hashedPassword,
                            date_created: 'now()',
                        }

                        return UsersService.insertUser(req.app.get('db'), newUser)
                            .then(user => {
                                return res.status(201).end()
                            })
                            .catch(next)
                    })
            })
            .catch(next)
    })

module.exports = usersRouter

