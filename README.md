# Terra API
This is the back end server for Terra - a mapping app that allows users to create waypoints and routes on a 3D terrain map of the world

## Terra Repo
https://github.com/keenanmcdonald/terra-app

## Terra Live App
https://terra-app1.herokuapp.com/

## Endpoints
All entities endpoints require authentication attached to header.
An entity is a route or a waypoint

### /entities/
GET: Gives a list of all Entities in the database
POST: Posts a new entity in the database. Requires an object in the body that includes {name, description, user_name, type, position}

### /entities/:entityId
DELETE: Deletes an entity based on the Id

### /entities/user/:user_name
GET: Gets all entities created by a particular user