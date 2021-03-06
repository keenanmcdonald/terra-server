DROP TABLE IF EXISTS terra_entities;

DROP TYPE IF EXISTS entity_type;

CREATE TYPE entity_type AS ENUM ('waypoint', 'route');

CREATE TABLE terra_entities (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    description TEXT,
    user_name TEXT NOT NULL REFERENCES terra_users(user_name),
    type entity_type NOT NULL,
    position FLOAT[][],
    private BOOLEAN DEFAULT false NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
)