// Prototype client-side logic for CARERISK evolutions
// - stores a simple "session" in localStorage
// - renders sample care plans
// - restricts deletion to admin (zbawab@cmd.cd)

const ADMIN_EMAIL = 'zbawab@cmd.cd';

function getSession(){
  try{ return JSON.parse(localStorage.getItem('carerisk_session')) || null }catch(e){return null}
}

function setSession(session){
  localStorage.setItem('carerisk_session', JSON.stringify(session));
}

// Login form handling (on login page)
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value;
    if(!fullname || !email) return alert('Veuillez renseigner le nom et l\'email');
    setSession({fullname,email,service});
    window.location.href = '/web/plan.html';
  });
}

// Plan page rendering
const userInfoEl = document.getElementById('userInfo');
const plansContainer = document.getElementById('plansContainer');
const filterService = document.getElementById('filterService');
const exportPdfBtn = document.getElementById('exportPdf');

function samplePlans(){
  return [
    {id:1, patient:'M. Kabila', risk:'Élevé', service:'medicine', plan:'Surveillance rapprochée, mobiliser 2x/j, surveiller glycémie.'},
    {id:2, patient:'Mme. Mbala', risk:'Moyen', service:'surgery', plan:'Antalgiques, kiné, réévaluation J+1.'},
    {id:3, patient:'Enf. K.', risk:'Faible', service:'pediatrics', plan:'Hydratation, surveillance respiratoire.'},
  ];
}

function renderUser(){
  const s = getSession();
  if(!s){
    userInfoEl.innerHTML = '<p><em>Utilisateur non connecté. Veuillez vous connecter via /web/login.html</em></p>';
    return;
  }
  userInfoEl.innerHTML = `<p>Connecté : <strong>${s.fullname}</strong> — ${s.email} — Service : ${s.service}</p>`;
}

function renderPlans(){
  const s = getSession();
  const all = samplePlans();
  const filter = filterService ? filterService.value : (s? s.service : 'all');
  const list = (filter==='all') ? all : all.filter(p=>p.service===filter);
  plansContainer.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'plan-card';
    card.innerHTML = `\n      <h3>${p.patient} <small>(${p.risk})</small></h3>\n      <p>${p.plan}</p>\n      <div class=\"plan-actions\">\n        <button class=\"btn-delete\" data-id=\"${p.id}\">Supprimer</button>\n      </div>`;
    plansContainer.appendChild(card);
  });
  attachDeleteHandlers();
}

function attachDeleteHandlers(){
  document.querySelectorAll('.btn-delete').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const s = getSession();
      if(!s) return alert('Action non autorisée — connectez-vous');
      if(s.email !== ADMIN_EMAIL) return alert('Suppression réservée aux administrateurs.');
      const id = btn.getAttribute('data-id');
      // prototype: no backend mutation; show message
      alert('Suppression simulée — plan id='+id);
    });
  });
}

if(filterService){
  filterService.addEventListener('change', renderPlans);
}

if(exportPdfBtn){
  exportPdfBtn.addEventListener('click', ()=>{
    // Simple client-side PDF export using print (for prototype).
    window.print();
  });
}

renderUser();
renderPlans();
