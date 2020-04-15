const xss = require('xss')

const EntitiesService = {
    getAllEntities(db) {
        return db
            .from('terra_entities')
    },
    getEntitiesByUserName(db, user_name) {
        return db
            .from('terra_entities')
            .where({user_name})
            .select('*')
    },
    insertEntity(db, entity) {
        return db
            .insert(entity)
            .into('terra_entities')
            .returning('*')
            .then(([entity]) => entity)
    },
    removeEntity(db, id) {
        return db
            .from('terra_entities')
            .where({id})
            .delete()
    },
    getEntityById(db, id){
        return db
            .from('terra_entities')
            .select('*')
            .where({id})
            .first()
    },
    serializeEntity(entity) {
        return {
            id: entity.id,
            user_name: xss(entity.user_name),
            name: xss(entity.name),
            description: xss(entity.description),
            position: entity.position,
            elevation: entitiy.elevation,
            type: entity.type,
            date_created: new Date(entity.date_created)
        }
    },

}

module.exports = EntitiesService
