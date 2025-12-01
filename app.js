// *****************************************************************
// 1. LOGIQUE PWA (INSTALLATION)
// *****************************************************************

let deferredPrompt; 
const installButton = document.getElementById('installButton');

// Masquer le bouton au début (si le navigateur ne prend pas en charge l'installation ou si l'app est déjà installée)
// Note: Le bouton est déjà masqué par style="display: none;" dans index.html, mais cette vérification est bonne.
if (installButton) {
    installButton.style.display = 'none';
}


// Événement déclenché par le navigateur lorsqu'il est prêt à afficher l'invite d'installation
window.addEventListener('beforeinstallprompt', (e) => {
    // Empêche la fenêtre d'apparition automatique
    e.preventDefault();
    // Stocke l'événement pour pouvoir le déclencher manuellement plus tard
    deferredPrompt = e;
    
    // Si le bouton existe et que nous avons l'événement, nous l'affichons
    if (installButton && deferredPrompt) {
        installButton.style.display = 'block';
    }
});

// Gérer le clic sur le bouton d'installation personnalisé
if (installButton) {
    installButton.addEventListener('click', (e) => {
        // Cache le bouton
        installButton.style.display = 'none';
        
        // Déclenche l'invite d'installation stockée
        if (deferredPrompt) {
            deferredPrompt.prompt();
            
            // Attendre que l'utilisateur réponde à l'invite
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null; 
            });
        }
    });
}

// Gérer l'événement 'appinstalled' (si l'utilisateur installe l'application)
window.addEventListener('appinstalled', (e) => {
    console.log('CareRisk PWA installed successfully!');
    if (installButton) {
        installButton.style.display = 'none';
    }
});


// *****************************************************************
// 2. LOGIQUE D'ACTION DES CARTES (ÉVALUATION)
// *****************************************************************

// 1. Sélectionner la carte "Nouvelle Évaluation" par sa classe de bordure (border-blue-500)
// REMARQUE: Si vous ajoutez plus de CSS, il faudra utiliser un ID pour plus de précision.
const nouvelleEvaluationCard = document.querySelector('.border-blue-500'); 

// 2. Ajouter un écouteur d'événement
if (nouvelleEvaluationCard) {
    nouvelleEvaluationCard.addEventListener('click', () => {
        // Alerte pour confirmer que le bouton fonctionne
        alert('Action: Nouvelle Évaluation démarrée ! (Cette alerte sera remplacée par le formulaire)');
        
        // FUTURE ÉTAPE : Remplacer l'alerte par le code de navigation ou l'affichage du formulaire
    });
}

// *****************************************************************
// (Logique pour Historique et Protocoles pourra être ajoutée ici plus tard)
// *****************************************************************