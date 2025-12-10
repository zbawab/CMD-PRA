/* Prototype in-memory backend for CARERISK evolutions
   - Exposes endpoints to list reports by service
   - Deletion endpoint checks admin email (prototype)
   - NOT for production: integrate with real DB & auth before deploying
*/

const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let plans = [
  {id:1, patient:'M. Kabila', risk:'Élevé', service:'medicine', plan:'Surveillance rapprochée'},
  {id:2, patient:'Mme. Mbala', risk:'Moyen', service:'surgery', plan:'Antalgiques'},
  {id:3, patient:'Enf. K.', risk:'Faible', service:'pediatrics', plan:'Hydratation'},
];

// List plans, optional ?service=...
app.get('/api/plans', (req,res)=>{
  const service = req.query.service;
  if(service){
    return res.json(plans.filter(p=>p.service===service));
  }
  res.json(plans);
});

// Simulated deletion: requires adminEmail in body to allow
app.delete('/api/plans/:id', (req,res)=>{
  const adminEmail = req.body.adminEmail;
  if(adminEmail !== 'zbawab@cmd.cd'){
    return res.status(403).json({error:'Suppression réservée aux administrateurs.'});
  }
  const id = Number(req.params.id);
  plans = plans.filter(p=>p.id!==id);
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`CARERISK prototype backend listening on ${PORT}`));
