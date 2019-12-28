const express = require('express')
const EntitiesService = require('./entities-service')
const UsersService = require('../users/users-service')
const {requireAuth} = require('../middleware/jwt-auth')

const entitiesRouter = express.Router()
const jsonBodyParser = express.json()

entitiesRouter
    .route('/')
    .get((req, res, next) => {
        EntitiesService.getAllEntities(req.app.get('db'))
            .then(entities => {
                res.json(entities)
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {name, description, user_id, type, position} = req.body

        for (const field of ['name', 'type', 'user_id', 'position']){
            if (!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        const newEntity = {
            name,
            description,
            user_id,
            position,
            type,
            date_created: 'now()',
        }

        EntitiesService.insertEntity(req.app.get('db'), newEntity)
            .then(entity => {
                res
                    .status(201)
                    .json(entity)
            })
            .catch(next)
    })

entitiesRouter
    .route('/:entityId')
    .delete((req, res, next) => {
        let {entityId} = req.params

        EntitiesService.getEntityById(req.app.get('db'), entityId)
            .then(entity => {
                if (!entity){
                    return res.status(404).json({
                        error: {message: 'entity does not exist'}
                    })
                }
            })
            .catch(next)

        EntitiesService.removeEntity(req.app.get('db'), entityId)
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
entitiesRouter 
    .route('/user/:user_id')
    .get((req, res, next) => {
        let {user_id} = req.params

        console.log(user_id)

        UsersService.getUserById(req.app.get('db'), user_id)
            .then(user => {
                console.log('user: ' + user)
                if (!user){
                    return res.status(404).json({
                        error: {message: 'user not found'}
                    })
                }
            })
            .catch(next)

        EntitiesService.getEntitiesByUserId(req.app.get('db'), user_id)
            .then(entities => {
                res.status(201).json(entities)
            })
            .catch(next)
    })

module.exports = entitiesRouter
