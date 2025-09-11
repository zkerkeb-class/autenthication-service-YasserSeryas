// Script d'initialisation pour MongoDB
db = db.getSiblingDB('authdb');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'authuser',
  pwd: 'authpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'authdb'
    }
  ]
});

// Créer les collections de base
db.createCollection('users');
db.createCollection('sessions');

// Créer des index pour optimiser les performances
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "googleId": 1 }, { sparse: true });
db.sessions.createIndex({ "expires": 1 }, { expireAfterSeconds: 0 });

print('Base de données authdb initialisée avec succès!');
