const express = require('express');
const router = express.Router();
const { 
    createTask, 
    getTasks, 
    updateTaskStatus, 
    deleteTask 
} = require('../controllers/taskController');

router.post('/', createTask);         // POST /api/tasks
router.get('/', getTasks);            // GET /api/tasks
router.put('/:id', updateTaskStatus); // PUT /api/tasks/:id
router.delete('/:id', deleteTask);   // DELETE /api/tasks/:id

module.exports = router;
