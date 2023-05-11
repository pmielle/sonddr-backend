set -e 

mongosh <<EOF

db = db.getSiblingDB('${MONGO_INITDB_DATABASE}')

db.createUser({
    user: '${MONGO_USERNAME}',
    pwd: '${MONGO_PASSWORD}',
    roles: [{ role: 'readWrite', db: '${MONGO_INITDB_DATABASE}' }]
});

db.createCollection('goals');

db.goals.insertOne({
    id: "goal_id",
    name: "Goal name"
});

EOF
