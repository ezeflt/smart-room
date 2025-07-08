const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Exemple de route GET
app.get('/alarm/:userId', (req, res) => {
  // TODO: logique pour récupérer l'alarme
  res.json({ enabled: true });
});

// Exemple de route POST
app.post('/alarm/:userId', (req, res) => {
  // TODO: logique pour activer/désactiver l'alarme
  res.json({ success: true });
});

// Exemple de route GET météo
app.get('/weather/:userId', (req, res) => {
  // TODO: logique pour récupérer la météo
  res.json({ weather: 'sunny' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
