# CARERISK - EVOLUTIONS (Prototype)

Résumé :
- Ajoute une page de connexion (nom complet, email CMD, sélection du service).
- Partage des rapports par service (filtrage côté client et endpoint prototype).
- Suppression restreinte aux administrateurs (adresse admin: zbawab@cmd.cd).
- Amélioration du style des plans de soins et export PDF côté client (via impression navigateur).

Fichiers ajoutés :
- web/login.html
- web/plan.html
- web/plan.js
- web/styles.css
- web/assets/header.png
- backend/server.js
- backend/package.json
- docs/CARERISK-EVOLUTIONS.md

Notes :
- Backend prototype en mémoire. Il est nécessaire d'intégrer la persistance (base de données) et le système d'authentification réel avant mise en production.
- L'export PDF est assuré côté client par window.print() pour ce prototype ; envisager une solution serveur si besoin de rendu controlé.
- La suppression est simulée côté client / backend prototype et vérifie seulement l'email admin fourni. Implémenter un système d'autorisation robuste en production.

Proposition de workflow pour mise en prod :
1. Intégrer l'authentification via votre provider (LDAP/Keycloak/SSO) et vérifier les rôles.
2. Migrer le stockage des plans vers la base de données (Postgres / MongoDB selon architecture).
3. Mettre en place des tests E2E et code review avant fusion.
4. Déployer sur un environnement stagging et vérifier export/permissions.

Auteur: Prototype créé pour la PR "CARERISK-EVOLUTIONS".