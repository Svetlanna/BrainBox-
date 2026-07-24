# BrainBox

BrainBox
une base de connaissances (extraits de code, commandes, procédures, notes de cours...) 
interrogeable en langage naturel grâce à une IA exécutée localement via Ollama.
L'API construit chaque réponse **uniquement** à partir des connaissances enregistrées — jamais à partir des connaissances générales du modèle.

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose
- [Node.js](https://nodejs.org/) — utile pour développer en local hors Docker
- Un compte [MongoDB Atlas](https://www.mongodb.com/atlas) 
- Environ 6 Go d'espace disque libre pour les modèles Ollama

## Installation

### 1. Cloner le projet et installer les dépendances

```bash
git clone https://github.com/Svetlanna/BrainBox-
cd BrainBox
```

**Backend :**
```bash
cd backend
npm init -y
npm install express mongodb cors dotenv jsonwebtoken bcryptjs
npm install --save-dev nodemon
```

**Frontend (Angular) :**
```bash
cd ../frontend
npm install
```

Les composants Angular du projet ont été générés avec :
```bash
ng generate component components/knowledge-list
ng generate component components/knowledge-detail
ng generate component components/knowledge-form
ng generate component components/assistant
ng generate component components/login
```

### 2. Configurer les variables d'environnement

Créer un fichier `backend/.env` :
```
PORT=3000
MONGO_URI=<ton-uri-de-connexion-atlas>
DB_NAME=BrainBox
JWT_SECRET=<une-longue-chaine-secrete-aleatoire>
```

## Configuration de MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Créer un **Cluster** (le tier gratuit M0 suffit largement)
3. Créer une **base de données** nommée `BrainBox`, avec deux collections : `knowledge` et `users`
4. Autoriser l'accès réseau (IP whitelist) pour ta machine, ou `0.0.0.0/0` en développement
5. Récupérer l'URI de connexion (bouton **Connect** → **Drivers**) et le coller dans `MONGO_URI` (fichier `.env`)
6. [MongoDB Compass](https://www.mongodb.com/products/compass) permet de visualiser/éditer les documents graphiquement (utile pour importer des connaissances ou des utilisateurs de test via un fichier CSV)

## Lancement de l'application

Tout le projet (backend, frontend, Ollama) tourne via Docker Compose :

```bash
docker compose up --build
```

- Frontend : http://localhost:4200
- Backend : http://localhost:3000
- Ollama : http://localhost:11434

## Lancement d'Ollama

Ollama tourne dans son propre conteneur (`brainbox-ollama`). Il faut télécharger un modèle avant la première utilisation :

```bash
docker exec -it brainbox-ollama ollama pull qwen2.5:0.5b
```

Vérifier que le modèle est bien disponible :
```bash
curl http://localhost:11434/api/tags
```

Vérifier la connectivité réseau du conteneur si besoin :
```bash
docker run --rm alpine nslookup registry.ollama.ai
```

Tester directement l'assistant une fois le backend démarré :
```bash
curl http://localhost:3000/assistant -X POST -H "Content-Type: application/json" -d "{\"question\": \"Comment creer une route GET Express ?\"}"
```

## Routes disponibles

### Authentification
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Connexion, renvoie un token JWT + le rôle de l'utilisateur |

### Connaissances
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/knowledge` | Tous (connectés) | Liste toutes les connaissances |
| GET | `/knowledge/search?q=...` | Tous (connectés) | Recherche par mot-clé (titre, contenu, catégorie, tags) |
| GET | `/knowledge/:id` | Tous (connectés) | Détail d'une connaissance |
| POST | `/knowledge` | **Admin uniquement** | Créer une connaissance |
| PUT | `/knowledge/:id` | **Admin uniquement** | Modifier une connaissance |
| DELETE | `/knowledge/:id` | **Admin uniquement** | Supprimer une connaissance |

### Assistant IA
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/assistant` | Tous (connectés) | Pose une question ; recherche dans MongoDB, construit le prompt, interroge Ollama, renvoie la réponse + les sources utilisées |

Toutes les routes protégées attendent un en-tête `Authorization: Bearer <token>`.

## Modèle utilisé

**`qwen2.5:0.5b`** (0,5 milliard de paramètres) est le modèle retenu en production.

Plusieurs modèles ont été testés pour trouver le meilleur compromis vitesse/qualité sur une machine sans GPU (inférence CPU uniquement) :

| Modèle | Résultat |
|---|---|
| `llama3.2` | Testé, temps de réponse très long (plusieurs minutes) |
| `mistral` | Fonctionnel mais lent (~20-30s par réponse) |
| `gemma4:e2b` | Plus rapide, mais toujours lourd sur CPU |
| **`qwen2.5:0.5b`** |  Retenu — nettement plus rapide, suffisant pour ce cas d'usage |

La réponse est aussi limitée à `num_predict: 200` tokens côté API pour éviter les générations trop longues (et donc trop lentes) sur une machine sans accélération matérielle.

 Étant un très petit modèle, `qwen2.5:0.5b` suit parfois imparfaitement les consignes strictes du prompt (il peut répondre "je ne sais pas" même quand l'information existe). Le prompt inclut une instruction stricte demandant de ne répondre qu'à partir des connaissances fournies, et l'API court-circuite complètement l'appel au modèle si aucune connaissance pertinente n'est trouvée en base.

