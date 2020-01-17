const xss = require('xss')
const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[\S]+/

const UsersService = {
    getAllUsers(db) {
        return db
            .from('terra_users')
    },
    getUserById(db, id) { 
        return db
            .from('terra_users')
            .select('*')
            .where({id})
            .first()
    },
    getUserByName(db, user_name){
        return db
            .from('terra_users')
            .select('*')
            .where({user_name})
            .first()
    },
    validatePassword(password){
        if (password.length < 8) {
            return 'Password must be longer than 8 characters'
        }
        if (password.length > 72) {
            return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')){
            return 'Password must not start or end with spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER.test(password)) {
            return 'Password must contain at least one 1 upper case, lower case and number'
        }
        return null
    },
    hasUserWithEmail(db, email){
        return db('terra_users')
            .where({email})
            .first()
            .then(user => !!user)
    },
    insertUser(db, newUser){
        return db
            .insert(newUser)
            .into('terra_users')
            .returning('*')
    },
    hashPassword(password){
        return bcrypt.hash(password, 12)
    },
    serializeUser(user) {
        return {
            id: user.id,
            user_name: xss(user.user_name),
            email: xss(user.email),
            date_created: new Date(user.date_created)
        }
    },
}

module.exports = UsersService
