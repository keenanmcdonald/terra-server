const app = require('../src/app')
const supertest = require('supertest')
const knex = require('knex')
const {TEST_DATABASE_URL} = require('../src/config')
const bcrypt = require('bcrypt')
const AuthService = require('../src/auth/auth-service')

const user1 = {
  email: 'test1@test.com',
  user_name: 'test-user-1',
  password: '12345',
}
const user2 = {
  email: 'test2@test.com',
  user_name: 'test-user-2',
  password: '12345',
}


const dummyEntities = [
  {
    id: 1,
    user_name: 'test-user-1',
    name: 'foo',
    description: 'this is a description',
    position: [[-1635365.35844253,-4311219.54363677,4397107.35472596]],
    type: 'waypoint',
  },
  {
    id: 2,
    user_name: 'test-user-2',
    name: 'bar',
    description: 'another description',
    position: [
      [-1635368.21897276,-4311167.71851174,4397096.05160317],
      [-1635375.00517916,-4311133.15192414,4397145.38499154],
      [-1635407.63819723,-4311141.69018955,4397188.08133147]
    ],
    type: 'route',
  }
]


describe('Entities Endpoints', () => {
  let db
  let token

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before(('clear users'), () => db.raw('TRUNCATE TABLE terra_users, terra_entities CASCADE'))

  before('insert user1', async () => {
    return db
      .into('terra_users')
      .insert({
        ...user1,
        password: await bcrypt.hash(user1.password, 12)
      })
  })

  before('insert user2', async () => {
    return db
      .into('terra_users')
      .insert({
        ...user2,
        password: await bcrypt.hash(user2.password, 12)
      })
  })

  before(('get JWT Token'), (done) => {
    supertest(app)
      .post('/auth/login')
      .send(user1)
      .then(res => {
        token = res.body.authToken
        done()
      })
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => db('terra_entities').truncate())

  afterEach('cleanup', () => db('terra_entities').truncate())    

  describe('GET /entities', () => {

    context(`Given no entities`, () => {

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/entities')
          .set('authorization', `bearer ${token}`)
          .expect(200, [])
      })
    })

    context('Given there are entities in the database', () => {

      before('insert entities', () => {
        return db
          .into('terra_entities')
          .insert(dummyEntities)
      })

      //not matching because of date-created
      it('gets the entities from the store', () => {
        return supertest(app)
          .get('/entities')
          .set('authorization', `bearer ${token}`)
          .expect(200)
          .expect(res => {
            for (let i = 0; i < res.body; i++){
              expect(res.body[i].id).to.eql(dummyEntity[i].id)
              expect(res.body[i].user_name).to.eql(dummyEntity[i].user_name)
              expect(res.body[i].name).to.eql(dummyEntity[i].name)
              expect(res.body[i].description).to.eql(dummyEntity[i].description)
              expect(res.body[i].position).to.eql(dummyEntity[i].position)
              expect(res.body[i].type).to.eql(dummyEntity[i].type)  
            }
          })    
      })
    })
  })

  dummyEntity = dummyEntities[0]

  describe('POST /entities', () => {
    it('posts entities to the server', () => {
      return supertest(app)
        .post('/entities')
        .send(dummyEntity)
        .set('authorization', `bearer ${token}`)
        .expect(201)
        .expect(res => {
          expect(res.body.id).to.eql(dummyEntity.id)
          expect(res.body.user_name).to.eql(dummyEntity.user_name)
          expect(res.body.name).to.eql(dummyEntity.name)
          expect(res.body.description).to.eql(dummyEntity.description)
          expect(res.body.position).to.eql(dummyEntity.position)
          expect(res.body.type).to.eql(dummyEntity.type)
        })
    })
  })

  describe('DELETE /entities/:entityId' , () => {
    before('insert entities', () => {
      return db
        .into('terra_entities')
        .insert(dummyEntity)
    })

    it('deletes an entity', () => {
      return supertest(app)
        .delete(`/entities/${dummyEntity.id}`)
        .set('authorization', `bearer ${token}`)
        .expect(204)
    })
  })

  describe('GET /entities/user/:userId' , () => {
    before('insert entities', () => {
      return db
        .into('terra_entities')
        .insert(dummyEntities)
    })

    it('finds a users entities', () => {
      return supertest(app)
        .get(`/entities/user/${user1.user_name}`)
        .set('authorization', `bearer ${token}`)
        .expect(201)
        .expect(res => {
          expect(res.body.length).to.eql(1)
          expect(res.body[0].id).to.eql(dummyEntities[0].id)
          expect(res.body[0].user_name).to.eql(dummyEntities[0].user_name)
          expect(res.body[0].name).to.eql(dummyEntities[0].name)
          expect(res.body[0].description).to.eql(dummyEntities[0].description)
          expect(res.body[0].position).to.eql(dummyEntities[0].position)
          expect(res.body[0].type).to.eql(dummyEntities[0].type)
        })
    })
  })
})

describe('Users Endpoints', () => {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  before(('clear users'), () => db.raw('TRUNCATE TABLE terra_users, terra_entities CASCADE'))

  describe('GET /users', () => {

    before('insert user1', async () => {
      return db
        .into('terra_users')
        .insert({
          ...user1,
          password: await bcrypt.hash(user1.password, 12)
        })
    })
  
    it('returns users', () => {
      supertest(app)
        .get('/users')
        .expect(201, [user1])
    })
  })

  describe('POST /users', () => {
  
    it('posts a user', () => {
      supertest(app)
        .post('/users')
        .send(user1)
        .expect(201)
    })
  })
})