FinViz – Plateforme de Suivi Boursier et Alertes

Vue d’ensemble
FinViz est une application web interactive connectée à une API financière permettant de suivre en temps réel les actions en bourse. Elle offre aux utilisateurs la possibilité de rechercher des symboles boursiers, de consulter des informations détaillées sur une action (prix actuel, variation, volume, ouverture, clôture précédente, etc.), et de gérer leurs favoris et historiques de recherche.

L’application intègre également un système d’alertes personnalisées : l’utilisateur peut définir un prix cible et être notifié lorsque ce seuil est atteint. Une fonctionnalité de prévisions sur 7 jours est également prévue pour enrichir l’expérience avec des analyses prédictives.

Fonctionnalités principales
🔎 Recherche d’actions : consultation rapide d’un symbole avec ses données en temps réel.

📊 Données détaillées : prix actuel, variation (%), volume, ouverture, haut/bas du jour, clôture précédente.

⭐ Favoris & Historique : sauvegarde des actions consultées pour un accès simplifié.

⏱ Performance par période : suivi sur 1 jour, 1 semaine, 1 mois ou 1 an.

🔔 Alertes de prix : création et gestion d’alertes lorsque le prix dépasse ou descend sous une valeur définie.

📈 Prévisions (à venir) : affichage de prévisions sur 7 jours basées sur l’API et des modèles prédictifs.


Architecture technique
Frontend : React.js
UI/UX : Tailwind CSS pour un design moderne et responsive
Backend / API : intégration d’une API financière (REST) pour la récupération des données en temps réel
Gestion des états : React hooks & context
Alertes dynamiques : système basé sur les données API avec rafraîchissement automatique

Défis techniques relevés
Intégration d’une API financière et gestion des limites de requêtes.
Mise en place d’un système d’alertes dynamiques et personnalisables.

Gestion de l’historique et des favoris avec un rendu fluide côté interface.

Préparation d’un module prédictif (prévisions 7 jours).
