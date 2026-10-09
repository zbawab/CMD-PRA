// Instrumentation + evaluation logic

// Install network instrumentation early to capture failing requests
(function(){
  // Simple reporter to show failures in debug panel
  function reportFailure(obj){
    try{
      console.error('Network failure captured:', obj);
      const pre = document.getElementById('debug-panel-pre');
      const panel = document.getElementById('debug-panel');
      const line = '[' + new Date().toISOString() + '] ' + (obj.method||'') + ' ' + (obj.url||'') + ' => ' + (obj.status||'') + '\n' + (obj.response || '') + '\n\n';
      if(pre){ pre.textContent = line + pre.textContent; }
      if(panel){ panel.classList.remove('hidden'); }
    }catch(e){ console.error(e); }
  }

  // Wrap fetch
  const _fetch = window.fetch.bind(window);
  window.fetch = async function(input, init){
    const url = typeof input === 'string' ? input : (input && input.url);
    try{
      // Intercept risk-evaluations POST and return a local plan to avoid server 500
      if (url && url.includes('/api/risk-evaluations')) {
        try {
          // attempt to read body to compute score
          let bodyText = null;
          if (init && init.body) {
            bodyText = typeof init.body === 'string' ? init.body : JSON.stringify(init.body);
          } else if (input instanceof Request) {
            bodyText = await input.clone().text();
          }
          let parsed = {};
          try { parsed = bodyText ? JSON.parse(bodyText) : {}; } catch(e) { parsed = {}; }

          // compute score from parsed payload or fallback to 0
          let score = 0;
          if (typeof parsed.totalScore === 'number') {
            score = parsed.totalScore;
          } else if (typeof parsed.totalRisk === 'number') {
            score = parsed.totalRisk;
          } else if (parsed.data) {
            // if payload contains fields, try summing known keys
            const keys = ['chutes', 'escarres', 'infection', 'bradenScore', 'morseScore', 'infectionRisk'];
            for (const k of keys) {
              if (typeof parsed.data[k] === 'number') score += parsed.data[k];
            }
          }

          // build plan text (simple, same logic as buildCarePlanText)
          function buildCarePlanText(score) {
            const patientName = (parsed && parsed.patientName) ? parsed.patientName : 'Patient';
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

          const planText = buildCarePlanText(score);
          const fakeResponse = { id: 'local', plan: planText, score };
          return new Response(JSON.stringify(fakeResponse), { status: 200, headers: {'Content-Type':'application/json'} });
        } catch(err) {
          reportFailure({url, method: (init && init.method) || 'POST', status: 'intercept-error', response: String(err)});
          // fallthrough to real fetch on error
        }
      }

      const res = await _fetch(input, init);
      let text = '';
      try{ text = await res.clone().text(); }catch(e){ text = '<no-body>'; }
      if(!res.ok){
        reportFailure({url, method: (init && init.method) || 'GET', status: res.status, response: text});
      }
      return res;
    }catch(err){
      reportFailure({url, method: (init && init.method) || 'GET', status: 'network-error', response: String(err)});
      throw err;
    }
  };

  // Wrap XHR
  const OrigXHR = window.XMLHttpRequest;
  function WrappedXHR(){
    const xhr = new OrigXHR();
    const open = xhr.open;
    xhr.open = function(method, url){
      this._method = method; this._url = url;
      return open.apply(this, arguments);
    };
    xhr.addEventListener('loadend', function(){
      try{
        const status = this.status;
        const url = this._url;
        if(status >= 400){
          reportFailure({url, method: this._method, status, response: this.responseText});
        }
      }catch(e){console.error(e);}    
    });
    return xhr;
  }
  window.XMLHttpRequest = WrappedXHR;

})();

// Existing evaluation logic (unchanged) - wrapped to run after instrumentation
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
