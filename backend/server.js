const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static web files if placed under web/
app.use('/web', express.static('web'));

// Sample in-memory data store (replace with DB integrations)
let reports = [
  { id:'r1', patient:'Jean Dupont', category:'Prévention chutes', content:'Plan A', service:'Hospitalisation médecine' },
  { id:'r2', patient:'Marie T', category:'Soins postopératoires', content:'Plan B', service:'Hospitalisation chirurgie' }
];
let patients = [{ id:'p1', name:'Jean Dupont' }, { id:'p2', name:'Marie T' }];

const SERVICES = ['Hospitalisation médecine','Hospitalisation chirurgie','Pédiatrie','Maternité','Soins intensifs'];

function isAdminEmail(email){ return email === 'zbawab@cmd.cd'; }

// Return services
app.get('/api/services', (req,res)=> res.json(SERVICES));

// Get reports (filtered by service). Admin can request all by omitting service or by admin email header
app.get('/api/reports', (req,res)=>{
  const service = req.query.service;
  const userEmail = req.header('x-user-email') || '';
  if(isAdminEmail(userEmail)) return res.json(reports);
  if(service){ return res.json(reports.filter(r => r.service === service)); }
  return res.json([]);
});

// Delete patient (admin only)
app.delete('/api/patients/:id', (req,res)=>{
  const userEmail = req.header('x-user-email') || '';
  if(!isAdminEmail(userEmail)) return res.status(403).json({ error:'Forbidden' });
  const id = req.params.id;
  patients = patients.filter(p => p.id !== id);
  return res.json({ ok:true });
});

// Delete plan/report (admin only)
app.delete('/api/plans/:id', (req,res)=>{
  const userEmail = req.header('x-user-email') || '';
  if(!isAdminEmail(userEmail)) return res.status(403).json({ error:'Forbidden' });
  const id = req.params.id;
  const before = reports.length;
  reports = reports.filter(r => r.id !== id);
  return res.json({ ok: before !== reports.length });
});

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('Server listening on', port));
