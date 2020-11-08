const xss = require('xss')

const EntitiesService = {
    getAllPublicEntities(db) {
        return db
            .from('terra_entities')
            .where('private', false)
    },
    getEntitiesByUserName(db, user_name) {
        return db
            .from('terra_entities')
            .where({user_name})
            .select('*')
    },
    updateEntity(db, id, data){
        return db('terra_entities')
            .where({id})
            .update(data)
            .returning('*')
            .then(([entity]) => entity)
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
        console.log('id: ', id)
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
            type: entity.type,
            private: entity.private,
            date_created: new Date(entity.date_created)
        }
    },

}

module.exports = EntitiesService
