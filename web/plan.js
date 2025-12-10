// Simple client logic to render reports and handle PDF export
(function(){
  const user = JSON.parse(localStorage.getItem('carerisk_user') || 'null');
  if(!user){ window.location.href = '/web/login.html'; return; }

  document.getElementById('userInfo').textContent = user.fullname + ' — ' + user.email + ' — ' + user.service;
  document.getElementById('logoutBtn').addEventListener('click', ()=>{ localStorage.removeItem('carerisk_user'); window.location.href = '/web/login.html'; });

  const reportsEl = document.getElementById('reportsList');
  const downloadBtn = document.getElementById('downloadAll');

  async function loadReports(){
    try{
      // Call backend API to get reports for this service
      const res = await fetch('/api/reports?service=' + encodeURIComponent(user.service), { headers: { 'x-user-email': user.email } });
      const data = await res.json();
      renderReports(data);
    }catch(err){
      reportsEl.innerHTML = '<p class="error">Impossible de charger les rapports. (Simulé si pas de backend)</p>';
      // fallback: show demo report
      renderReports([{
        id: 'demo-1', patient: 'Patient Demo', category: 'Prévention chutes', content: 'Plan de soins démo', service: user.service
      }]);
    }
  }

  function renderReports(list){
    reportsEl.innerHTML = '';
    list.forEach(r => {
      const card = document.createElement('article');
      card.className = 'report-card';
      card.id = 'report-' + r.id;

      card.innerHTML = `
        <div class="report-header">
          <h2 class="plan-category-title">${escapeHtml(r.category || 'Plan de soins')}</h2>
          <div class="meta">Patient: ${escapeHtml(r.patient || '')} — Service: ${escapeHtml(r.service || '')}</div>
        </div>
        <div class="report-body">${escapeHtml(r.content || '')}</div>
        <div class="report-actions">
          <button class="download" data-id="${r.id}">Télécharger (PDF)</button>
        </div>
      `;

      // If admin allow delete
      if(user.email === 'zbawab@cmd.cd'){
        const del = document.createElement('button');
        del.textContent = 'Supprimer';
        del.addEventListener('click', ()=> deleteReport(r.id));
        card.querySelector('.report-actions').appendChild(del);
      }

      card.querySelector('.download').addEventListener('click', ()=> downloadSingle(r.id));

      reportsEl.appendChild(card);
    });
  }

  function escapeHtml(s){ return String(s).replace(/[&<>\"']+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

  async function deleteReport(id){
    if(!confirm('Confirmer la suppression ?')) return;
    try{
      const res = await fetch('/api/plans/' + encodeURIComponent(id), { method: 'DELETE', headers: { 'x-user-email': user.email } });
      if(res.ok){ document.getElementById('report-' + id).remove(); alert('Supprimé'); }
      else alert('Échec suppression');
    }catch(err){ alert('Erreur réseau'); }
  }

  function downloadSingle(id){
    const el = document.getElementById('report-' + id);
    if(!el) return alert('Rapport introuvable');
    html2pdf().from(el).set({ margin: 10, filename: 'plan-' + id + '.pdf', html2canvas: { scale: 2 } }).save();
  }

  downloadBtn.addEventListener('click', ()=>{
    const el = document.querySelector('#reportsList');
    if(!el) return alert('Rien à exporter');
    html2pdf().from(el).set({ margin: 10, filename: 'plans-' + (user.service || 'service') + '.pdf', html2canvas: { scale: 2 } }).save();
  });

  loadReports();
})();
