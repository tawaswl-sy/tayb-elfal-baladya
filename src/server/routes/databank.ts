import express from 'express';
import { getDb, saveDb, logActivity } from '../database.js';

const router = express.Router();

// --- Population Settings ---
router.get('/population', (req, res) => {
  const db = getDb();
  res.json(db.population_settings || { total_population: 0 });
});

router.post('/population', (req, res) => {
  const db = getDb();
  const { total_population } = req.body;
  db.population_settings = { total_population: Number(total_population) };
  saveDb();
  logActivity('update_population', 'admin', `Updated total population to ${total_population}`);
  res.json({ success: true });
});

// --- Neighborhoods ---
router.get('/neighborhoods', (req, res) => {
  const db = getDb();
  res.json(db.neighborhoods || []);
});

router.post('/neighborhoods', (req, res) => {
  const db = getDb();
  const newNeighborhood = { id: Date.now().toString(), ...req.body };
  
  // Logic check: sum of neighborhoods population <= total_population
  const currentTotal = (db.neighborhoods || []).reduce((sum: number, n: any) => sum + Number(n.population || 0), 0);
  const totalAllowed = db.population_settings?.total_population || 0;
  
  if (currentTotal + Number(newNeighborhood.population || 0) > totalAllowed) {
    return res.status(400).json({ error: 'مجموع سكان الأحياء يتجاوز إجمالي السكان المحدد للمدينة.' });
  }

  db.neighborhoods.push(newNeighborhood);
  saveDb();
  logActivity('add_neighborhood', 'admin', `Added neighborhood: ${newNeighborhood.name}`);
  res.json(newNeighborhood);
});

router.put('/neighborhoods/:id', (req, res) => {
  const db = getDb();
  const index = db.neighborhoods.findIndex((n: any) => n.id === req.params.id);
  if (index !== -1) {
    const updatedNeighborhood = { ...db.neighborhoods[index], ...req.body };
    
    const currentTotal = db.neighborhoods.reduce((sum: number, n: any) => {
      if (n.id === req.params.id) return sum;
      return sum + Number(n.population || 0);
    }, 0);
    const totalAllowed = db.population_settings?.total_population || 0;
    
    if (currentTotal + Number(updatedNeighborhood.population || 0) > totalAllowed) {
      return res.status(400).json({ error: 'مجموع سكان الأحياء يتجاوز إجمالي السكان المحدد للمدينة.' });
    }

    db.neighborhoods[index] = updatedNeighborhood;
    saveDb();
    logActivity('update_neighborhood', 'admin', `Updated neighborhood: ${updatedNeighborhood.name}`);
    res.json(updatedNeighborhood);
  } else {
    res.status(404).json({ error: 'Neighborhood not found' });
  }
});

router.delete('/neighborhoods/:id', (req, res) => {
  const db = getDb();
  const index = db.neighborhoods.findIndex((n: any) => n.id === req.params.id);
  if (index !== -1) {
    const name = db.neighborhoods[index].name;
    db.neighborhoods.splice(index, 1);
    saveDb();
    logActivity('delete_neighborhood', 'admin', `Deleted neighborhood: ${name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Neighborhood not found' });
  }
});

// --- Tribes ---
router.get('/tribes', (req, res) => {
  const db = getDb();
  res.json(db.tribes || []);
});

router.post('/tribes', (req, res) => {
  const db = getDb();
  const newTribe = { id: Date.now().toString(), ...req.body };
  db.tribes.push(newTribe);
  saveDb();
  logActivity('add_tribe', 'admin', `Added tribe: ${newTribe.name}`);
  res.json(newTribe);
});

router.put('/tribes/:id', (req, res) => {
  const db = getDb();
  const index = db.tribes.findIndex((t: any) => t.id === req.params.id);
  if (index !== -1) {
    db.tribes[index] = { ...db.tribes[index], ...req.body };
    saveDb();
    logActivity('update_tribe', 'admin', `Updated tribe: ${db.tribes[index].name}`);
    res.json(db.tribes[index]);
  } else {
    res.status(404).json({ error: 'Tribe not found' });
  }
});

router.delete('/tribes/:id', (req, res) => {
  const db = getDb();
  const index = db.tribes.findIndex((t: any) => t.id === req.params.id);
  if (index !== -1) {
    const name = db.tribes[index].name;
    db.tribes.splice(index, 1);
    saveDb();
    logActivity('delete_tribe', 'admin', `Deleted tribe: ${name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Tribe not found' });
  }
});

// --- Schools ---
router.get('/schools', (req, res) => {
  const db = getDb();
  res.json(db.schools || []);
});

router.post('/schools', (req, res) => {
  const db = getDb();
  const newSchool = { id: Date.now().toString(), ...req.body };
  db.schools.push(newSchool);
  saveDb();
  logActivity('add_school', 'admin', `Added school: ${newSchool.name}`);
  res.json(newSchool);
});

router.put('/schools/:id', (req, res) => {
  const db = getDb();
  const index = db.schools.findIndex((s: any) => s.id === req.params.id);
  if (index !== -1) {
    db.schools[index] = { ...db.schools[index], ...req.body };
    saveDb();
    logActivity('update_school', 'admin', `Updated school: ${db.schools[index].name}`);
    res.json(db.schools[index]);
  } else {
    res.status(404).json({ error: 'School not found' });
  }
});

router.delete('/schools/:id', (req, res) => {
  const db = getDb();
  const index = db.schools.findIndex((s: any) => s.id === req.params.id);
  if (index !== -1) {
    const name = db.schools[index].name;
    db.schools.splice(index, 1);
    saveDb();
    logActivity('delete_school', 'admin', `Deleted school: ${name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'School not found' });
  }
});

// --- Facilities ---
router.get('/facilities', (req, res) => {
  const db = getDb();
  res.json(db.facilities || []);
});

router.post('/facilities', (req, res) => {
  const db = getDb();
  const newFacility = { id: Date.now().toString(), ...req.body };
  db.facilities.push(newFacility);
  saveDb();
  logActivity('add_facility', 'admin', `Added facility: ${newFacility.name}`);
  res.json(newFacility);
});

router.put('/facilities/:id', (req, res) => {
  const db = getDb();
  const index = db.facilities.findIndex((f: any) => f.id === req.params.id);
  if (index !== -1) {
    db.facilities[index] = { ...db.facilities[index], ...req.body };
    saveDb();
    logActivity('update_facility', 'admin', `Updated facility: ${db.facilities[index].name}`);
    res.json(db.facilities[index]);
  } else {
    res.status(404).json({ error: 'Facility not found' });
  }
});

router.delete('/facilities/:id', (req, res) => {
  const db = getDb();
  const index = db.facilities.findIndex((f: any) => f.id === req.params.id);
  if (index !== -1) {
    const name = db.facilities[index].name;
    db.facilities.splice(index, 1);
    saveDb();
    logActivity('delete_facility', 'admin', `Deleted facility: ${name}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Facility not found' });
  }
});

// --- Properties ---
router.get('/properties', (req, res) => {
  const db = getDb();
  res.json(db.properties || []);
});

router.post('/properties', (req, res) => {
  const db = getDb();
  const newProperty = { id: Date.now().toString(), ...req.body };
  db.properties.push(newProperty);
  saveDb();
  logActivity('add_property', 'admin', `Added property of type: ${newProperty.type}`);
  res.json(newProperty);
});

router.put('/properties/:id', (req, res) => {
  const db = getDb();
  const index = db.properties.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    db.properties[index] = { ...db.properties[index], ...req.body };
    saveDb();
    logActivity('update_property', 'admin', `Updated property of type: ${db.properties[index].type}`);
    res.json(db.properties[index]);
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

router.delete('/properties/:id', (req, res) => {
  const db = getDb();
  const index = db.properties.findIndex((p: any) => p.id === req.params.id);
  if (index !== -1) {
    const type = db.properties[index].type;
    db.properties.splice(index, 1);
    saveDb();
    logActivity('delete_property', 'admin', `Deleted property of type: ${type}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Property not found' });
  }
});

export default router;
