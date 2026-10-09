// docs/evaluation-logic.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('risk-management-form');
    const resultDisplay = document.getElementById('result-display');
    const totalScoreSpan = document.getElementById('total-score');
    const riskRecommendationP = document.getElementById('risk-recommendation');
    const carePlanContainer = document.getElementById('care-plan-display');

    function getScoreFromDataValue(dataValue) {
        switch (dataValue) {
            case 'data-0': return 0;
            case 'data-1': return 10;
            case 'data-2': return 25;
            default: return 0;
        }
    }

    function buildCarePlanText(score) {
        const patientName = 'Patient';
        let riskLevel = 'Faible risque';
        let actions = [
            'Surveillance standard et éducation du patient.',
            'Vérification quotidienne de l’état général et des signes vitaux.'
        ];

        if (score >= 50) {
            riskLevel = 'Risque élevé';
            actions = [
                'Évaluation clinique immédiate et plan de soins individualisé.',
                'Surveillance rapprochée au moins toutes les 2 heures.',
                'Prévention des chutes et des escarres renforcée.',
                'Contrôle de la température, du débit et du site invasif si présent.'
            ];
        } else if (score >= 25) {
            riskLevel = 'Risque modéré';
            actions = [
                'Surveillance renforcée et mise en place de protocoles de prévention de base.',
                'Aide technique ou mobilisation adaptée selon le besoin.',
                'Suivi de la nutrition et de la peau.'
            ];
        }

        return [
            `Plan de soins pour ${patientName}:`,
            `Niveau de risque: ${riskLevel}.`,
            `Score global estimé: ${score}.`,
            '',
            'Actions prioritaires:',
            ...actions.map((action, index) => `${index + 1}. ${action}`)
        ].join('\n');
    }

    function renderCarePlan(planText) {
        if (!carePlanContainer) return;

        let pre = carePlanContainer.querySelector('pre');
        if (!pre) {
            pre = document.createElement('pre');
            pre.className = 'whitespace-pre-wrap text-sm text-gray-800';
            carePlanContainer.appendChild(pre);
        }

        pre.textContent = planText;
        carePlanContainer.classList.remove('hidden');
    }

    function calculateRiskScore() {
        let totalScore = 0;

        const chutesHistoriqueValue = form.elements['chutes-historique'].value;
        const chutesMobiliteValue = form.elements['chutes-mobilite'].value;
        totalScore += getScoreFromDataValue(chutesHistoriqueValue);
        totalScore += getScoreFromDataValue(chutesMobiliteValue);

        const escarresNutritionValue = form.elements['escarres-nutrition'].value;
        const escarresPlaiesValue = form.elements['escarres-plaies'].value;
        totalScore += getScoreFromDataValue(escarresNutritionValue);
        totalScore += getScoreFromDataValue(escarresPlaiesValue);

        const infectionDispositifValue = form.elements['infection-dispositif'].value;
        totalScore += getScoreFromDataValue(infectionDispositifValue);

        totalScoreSpan.textContent = totalScore;

        let recommendation = '';
        if (totalScore <= 20) {
            recommendation = 'Faible risque. Surveillance standard.';
            resultDisplay.className = 'mt-8 p-4 bg-green-100 border-l-4 border-green-500 text-green-700';
        } else if (totalScore <= 50) {
            recommendation = 'Risque Modéré. Mise en place de protocoles de prévention de base (ex: bascules horaires).';
            resultDisplay.className = 'mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700';
        } else {
            recommendation = 'Risque Élevé ! Intervention immédiate et plan de soins individualisé requis.';
            resultDisplay.className = 'mt-8 p-4 bg-red-100 border-l-4 border-red-500 text-red-700';
        }
        riskRecommendationP.textContent = recommendation;

        try {
            let planText = buildCarePlanText(totalScore);

            if (typeof window !== 'undefined' && typeof window.generateCarePlan === 'function') {
                planText = window.generateCarePlan({ name: 'Patient', totalRisk: totalScore });
            }

            renderCarePlan(planText);
        } catch (err) {
            console.error('Erreur lors de la génération locale du plan de soins:', err);
            if (carePlanContainer) {
                const pre = carePlanContainer.querySelector('pre');
                if (pre) {
                    pre.textContent = 'Erreur lors de la génération du plan de soins.';
                }
                carePlanContainer.classList.remove('hidden');
            }
        }

        resultDisplay.classList.remove('hidden');
    }

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            calculateRiskScore();
        });
    }
});
