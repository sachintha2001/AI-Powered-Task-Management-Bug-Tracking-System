const db = require('../config/db');
const axios = require('axios'); // අලුතින් එකතු කළා

// අලුත් Task එකක් Save කිරීම (POST)
const createTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        
        // 1. Python AI Model එකෙන් prediction එක ලබාගැනීම
        let predictedType = 'Feature';
        let estimatedTime = '1 - 2 Days';
        try {
            const aiResponse = await axios.post('http://127.0.0.1:5001/api/predict', {
                description: description
            }, { timeout: 3000 });
            
            predictedType = aiResponse.data.predicted_type || predictedType;
            estimatedTime = aiResponse.data.estimated_time || estimatedTime;
        } catch (aiErr) {
            console.warn('AI service connection failed, using heuristic fallback:', aiErr.message);
            const lower = (description || '').toLowerCase();
            const isBug = ['error', 'bug', 'fix', 'fail', 'issue', 'crash', 'not working'].some(w => lower.includes(w));
            predictedType = isBug ? 'Bug' : 'Feature';
            estimatedTime = isBug ? '1 - 3 Hours' : '1 - 2 Days';
        }

        // 2. AI එකෙන් ආපු Type එකත් එක්කම MySQL Database එකේ Save කිරීම
        const [result] = await db.query(
            'INSERT INTO tasks (title, description, type) VALUES (?, ?, ?)',
            [title, description, predictedType]
        );

        res.status(201).json({ 
            message: 'Task created successfully', 
            taskId: result.insertId,
            ai_prediction: {
                type: predictedType,
                estimated_time: estimatedTime
            }
        });
    } catch (error) {
        console.error('Error in createTask:', error.message);
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error in getTasks:', error.message);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

// Task Status එක Update කිරීම (PUT)
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
        res.status(200).json({ message: 'Task status updated successfully' });
    } catch (error) {
        console.error('Error in updateTaskStatus:', error.message);
        res.status(500).json({ message: 'Error updating task status', error: error.message });
    }
};

// Task එකක් Delete කිරීම (DELETE)
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTask:', error.message);
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};

module.exports = { createTask, getTasks, updateTaskStatus, deleteTask };


