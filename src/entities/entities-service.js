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
    }
}

module.exports = EntitiesService
