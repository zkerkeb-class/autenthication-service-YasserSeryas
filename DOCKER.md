# Service d'Authentification - Docker

Ce guide explique comment déployer le service d'authentification en utilisant Docker et Docker Compose.

## Prérequis

- Docker
- Docker Compose
- Node.js 18+ (pour le développement local)

## Configuration

1. **Copiez le fichier d'environnement :**
   ```bash
   cp .env.example .env
   ```

2. **Modifiez les variables d'environnement dans `.env` :**
   - `JWT_SECRET` : Clé secrète pour les tokens JWT
   - `SESSION_SECRET` : Clé secrète pour les sessions
   - `GOOGLE_CLIENT_ID` : ID client Google OAuth
   - `GOOGLE_CLIENT_SECRET` : Secret client Google OAuth
   - `DB_CONNECTION_STRING` : Chaîne de connexion MongoDB
   - Autres variables selon vos besoins

## Déploiement avec Docker Compose

### Démarrage complet (Application + MongoDB + Redis)

```bash
# Construire et démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

### Démarrage de l'application seule

```bash
# Si vous avez déjà une base de données externe
docker-compose up -d auth-service
```

## Construction manuelle avec Docker

```bash
# Construire l'image
docker build -t auth-service .

# Lancer le conteneur
docker run -d \
  --name auth-service \
  -p 3002:3002 \
  --env-file .env \
  auth-service
```

## Services inclus

### 1. auth-service
- **Port :** 3002
- **Description :** Service d'authentification principal
- **Healthcheck :** Disponible sur `/health`

### 2. mongodb (optionnel)
- **Port :** 27017
- **Description :** Base de données MongoDB
- **Utilisateur par défaut :** admin/password123
- **Base de données :** authdb

### 3. redis (optionnel)
- **Port :** 6379
- **Description :** Cache Redis pour les sessions
- **Persistance :** Activée

## Commandes utiles

```bash
# Voir le statut des conteneurs
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart auth-service

# Voir les logs d'un service
docker-compose logs auth-service

# Accéder au shell d'un conteneur
docker-compose exec auth-service sh

# Mise à jour après modification du code
docker-compose up -d --build

# Nettoyer les volumes (attention : supprime les données)
docker-compose down -v
```

## Volumes

- `mongodb_data` : Données persistantes de MongoDB
- `redis_data` : Données persistantes de Redis
- `./logs` : Logs de l'application (optionnel)

## Réseaux

- `auth-network` : Réseau bridge pour la communication entre services

## Monitoring

### Healthcheck
L'application dispose d'un healthcheck automatique :
- **Endpoint :** `http://localhost:3002/health`
- **Intervalle :** 30 secondes
- **Timeout :** 10 secondes

### Logs
```bash
# Suivre les logs en temps réel
docker-compose logs -f auth-service

# Logs avec horodatage
docker-compose logs -t auth-service
```

## Sécurité

- L'application fonctionne avec un utilisateur non-root
- Les secrets sont gérés via variables d'environnement
- CORS configuré pour les origines autorisées
- Sessions sécurisées avec httpOnly cookies

## Dépannage

### Problème de connexion à la base de données
```bash
# Vérifier que MongoDB est démarré
docker-compose ps mongodb

# Vérifier les logs MongoDB
docker-compose logs mongodb
```

### Problème de build
```bash
# Construire sans cache
docker-compose build --no-cache

# Nettoyer les images Docker
docker system prune -a
```

### Accès aux logs
```bash
# Logs détaillés avec horodatage
docker-compose logs -t --details auth-service
```

## Production

Pour la production, considérez :

1. **Utiliser des secrets Docker** au lieu de variables d'environnement
2. **Configurer un reverse proxy** (nginx, traefik)
3. **Activer HTTPS**
4. **Configurer un monitoring** (Prometheus, Grafana)
5. **Mettre en place des sauvegardes** pour MongoDB
6. **Utiliser un registre Docker privé**

## URL d'accès

- **Application :** http://localhost:3002
- **Health Check :** http://localhost:3002/health
- **MongoDB :** mongodb://localhost:27017
- **Redis :** redis://localhost:6379
