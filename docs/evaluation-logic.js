// docs/evaluation-logic.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('risk-management-form');
    const resultDisplay = document.getElementById('result-display');
    const totalScoreSpan = document.getElementById('total-score');
    const riskRecommendationP = document.getElementById('risk-recommendation');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Empêche l'envoi classique du formulaire (rechargement de page)
            calculateRiskScore();
        });
    }

    // Fonction de conversion de la valeur du menu déroulant en score numérique
    // NOTE: Les valeurs sont stockées dans les options des menus déroulants (e.g., "data-2")
    // Pour une application réelle, chaque option aurait directement sa valeur en points (e.g., value="20")
    function getScoreFromDataValue(dataValue) {
        // Ceci est une simple table de conversion pour simuler le calcul des points
        switch (dataValue) {
            case 'data-0': return 0; // Risque faible
            case 'data-1': return 10; // Risque modéré
            case 'data-2': return 25; // Risque élevé
            default: return 0;
        }
    }

    function calculateRiskScore() {
        let totalScore = 0;
        
        // 1. Risque de Chutes
        const chutesHistoriqueValue = form.elements['chutes-historique'].value;
        const chutesMobiliteValue = form.elements['chutes-mobilite'].value;

        totalScore += getScoreFromDataValue(chutesHistoriqueValue);
        totalScore += getScoreFromDataValue(chutesMobiliteValue);

        // 2. Risque d'Escarres
        const escarresNutritionValue = form.elements['escarres-nutrition'].value;
        const escarresPlaiesValue = form.elements['escarres-plaies'].value;

        totalScore += getScoreFromDataValue(escarresNutritionValue);
        totalScore += getScoreFromDataValue(escarresPlaiesValue);

        // 3. Risque d'Infection
        const infectionDispositifValue = form.elements['infection-dispositif'].value;
        
        totalScore += getScoreFromDataValue(infectionDispositifValue);


        // Afficher les résultats
        totalScoreSpan.textContent = totalScore;
        
        let recommendation = '';
        if (totalScore <= 20) {
            recommendation = "Faible risque. Surveillance standard.";
            resultDisplay.className = "mt-8 p-4 bg-green-100 border-l-4 border-green-500 text-green-700";
        } else if (totalScore <= 50) {
            recommendation = "Risque Modéré. Mise en place de protocoles de prévention de base (ex: bascules horaires).";
            resultDisplay.className = "mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700";
        } else {
            recommendation = "Risque Élevé ! Intervention immédiate et plan de soins individualisé requis.";
            resultDisplay.className = "mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700";
        }
        riskRecommendationP.textContent = recommendation;
        
        resultDisplay.classList.remove('hidden');
    }
});