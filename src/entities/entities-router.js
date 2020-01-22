const express = require('express')
const EntitiesService = require('./entities-service')
const UsersService = require('../users/users-service')
const {requireAuth} = require('../middleware/jwt-auth')

const entitiesRouter = express.Router()
const jsonBodyParser = express.json()

entitiesRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        EntitiesService.getAllEntities(req.app.get('db'))
            .then(entities => {
                entities = entities.map(entity => {
                    return EntitiesService.serializeEntity(entity)
                })
                res.json(entities)
            })
            .catch(next)
    })
    .post(jsonBodyParser, (req, res, next) => {
        const {name, description, user_name, type, position} = req.body

        for (const field of ['name', 'type', 'user_name', 'position']){
            if (!req.body[field]){
                return res.status(400).json({
                    error: `Missing '${field}' in request body`
                })
            }
        }

        const newEntity = {
            name,
            description,
            user_name,
            position,
            type,
            date_created: 'now()',
        }

        EntitiesService.insertEntity(req.app.get('db'), newEntity)
            .then(entity => {
                res
                    .status(201)
                    .send(entity)
            })
            .catch(next)
    })

entitiesRouter
    .route('/:entityId')
    .all(requireAuth)
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
    .route('/user/:user_name')
    .all(requireAuth)
    .get((req, res, next) => {
        let {user_name} = req.params

        UsersService.getUserByName(req.app.get('db'), user_name)
            .then(user => {
                if (!user){
                    return res.status(404).json({
                        error: {message: 'user not found'}
                    }).end()
                }
            })
            .catch(next)

        EntitiesService.getEntitiesByUserName(req.app.get('db'), user_name)
            .then(entities => {
                entities = entities.map(entity => {
                    return EntitiesService.serializeEntity(entity)
                })
                res.status(201).json(entities)
            })
            .catch(next)
    })

module.exports = entitiesRouter
