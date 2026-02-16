

# Application Timesheet - MVP (Phases 1+2)

App React optimisée mobile, empaquetée via Capacitor pour Android natif. Stockage local (localStorage/IndexedDB), pas de backend nécessaire pour le MVP.

---

## Écran Principal - Saisie Timesheet

L'écran est divisé en 3 sections verticales :

### Section 1 : Sélection Client (~30%)
- Liste défilante des clients triés par dernière utilisation
- Badge couleur + nom du client
- Tap pour sélectionner (un seul à la fois, highlight visuel)
- Bouton "Gérer les clients" pour accéder à l'écran de gestion

### Section 2 : Sélection Activité (~20%)
- Chips horizontaux affichant toutes les activités (5-6)
- Badge couleur + libellé
- Tap pour sélectionner (une seule à la fois)
- Bouton "Gérer les activités"

### Section 3 : Grille Horaires (~50%)
- Grille 2D : heures en vertical (8h-19h par défaut), jours en horizontal
- Navigation entre jours avec boutons ◀ / Aujourd'hui / ▶
- Tap sur cellule vide = remplir avec client+activité sélectionnés (couleurs client en fond, accent activité en bordure)
- Tap sur cellule remplie = vider la cellule
- Résolution par défaut : 1h
- Indicateurs : weekend en grisé, jours freezés avec cadenas

### Barre d'actions (en haut)
- Date courante avec navigation J-1/J+1
- Bouton Sauvegarder (avec feedback)
- Bouton Freeze/Unfreeze de la journée
- Bouton Exporter (CSV)
- Menu d'accès aux autres écrans

---

## Écran Gestion Clients
- Liste de tous les clients avec badge couleur
- Ajout : bouton "+" avec formulaire (nom, couleur via palette prédéfinie, actif/inactif, notes)
- Édition : tap sur un client
- Suppression : avec protection si des entrées existent
- Validation : unicité des noms

## Écran Gestion Activités
- Liste des activités avec drag & drop pour réorganiser
- Formulaire : libellé, couleur, code court (2-3 caractères), actif/inactif
- Ordre d'affichage personnalisable

---

## Export CSV
- Options : journée, semaine ou mois
- Format : Date, Client, Activité, Heure début, Heure fin, Durée
- Nommage : `timesheet-YYYY-MM-DD.csv` / `timesheet-YYYY-WW.csv` / `timesheet-YYYY-MM.csv`
- Téléchargement du fichier / partage

## Freeze/Unfreeze
- Verrouillage par journée : empêche toute modification
- Indicateur visuel (cadenas) sur les jours gelés
- Confirmation avant déverrouillage

---

## Système de Couleurs
- Palette de 20 couleurs pour les clients, 10 pour les activités
- Cellules remplies : fond = couleur client, bordure gauche = couleur activité
- Attribution automatique à la création

## Navigation
- Bottom navigation : Timesheet / Vue Semaine / Clients / Activités
- Stockage local des données (pas de backend, tout reste sur l'appareil)

## Setup Capacitor
- Configuration Capacitor pour empaquetage Android natif
- Instructions pour compiler et déployer sur appareil Android

