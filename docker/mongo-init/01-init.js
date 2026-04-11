db = db.getSiblingDB('barbarossa');

db.createCollection('users');
db.createCollection('games');

db.users.createIndex({ username: 1 }, { unique: true });
db.games.createIndex({ status: 1 });
db.games.createIndex({ 'giocatori.id': 1 });
db.games.createIndex({ lastUpdate: 1 });

print('MongoDB initialized: barbarossa database with users and games collections');
