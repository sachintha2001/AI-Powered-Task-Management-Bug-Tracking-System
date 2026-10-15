const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Databases import කිරීම
const mysqlPool = require('./config/db');
const connectMongo = require('./config/mongo');

const app = express();
app.use(cors());
app.use(express.json());

// Routes import කිරීම
const taskRoutes = require('./routes/taskRoutes');

// API URL එක සැකසීම
app.use('/api/tasks', taskRoutes);

// MongoDB connect කිරීම
connectMongo();

app.get('/api/status', (req, res) => {
    res.json({ message: "Backend and Databases are running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

