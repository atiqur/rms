const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extends: false }));

app.get('/', (req, res) => res.status(200).send('API running'));

// Define Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/clients', require('./routes/api/clients'));
app.use('/api/mandates', require('./routes/api/mandates'));
app.use('/api/candidates', require('./routes/api/candidates'));
app.use('/api/interviews', require('./routes/api/interviews'));
app.use('/api/joinings', require('./routes/api/joinings'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
