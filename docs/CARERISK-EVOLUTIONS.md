# Carerisk évolutions - Branch feature/carerisk-evolutions

Ce dossier contient des exemples d'implémentation pour :
- page d'accueil / connexion (web/login.html)
- partage de rapports par service
- suppression restreinte (admin zbawab@cmd.cd)
- styles pour plan de soins (web/styles.css)
- génération PDF côté client (html2pdf)

Instructions rapides :
1. Créer la branche feature/carerisk-evolutions (proposée par moi).
2. Déployer le backend sample (cd backend && npm install && node server.js) — ou intégrer la logique aux routes existantes.
3. Déposer l'image fournie sous web/assets/header.png (ou changer le chemin dans les fichiers).
4. Intégrer les templates / appels fetch dans votre frontend existant si vous avez un framework (React/Vue), ou utiliser tel quel pour prototype.

Notes techniques :
- Le backend sample utilise un header 'x-user-email' pour simuler l'authentification. Remplacez par votre middleware auth réel.
- Les données sont en mémoire — adaptez aux modèles DB existants.
