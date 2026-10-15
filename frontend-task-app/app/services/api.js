import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api/tasks';
const AI_SERVICE_URL = 'http://127.0.0.1:5001/api/predict';

// Tasks ලබා ගැනීම (GET)
export const fetchTasks = async () => {
  try {
    const response = await axios.get(BACKEND_URL, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn("Backend fetch failed, checking local state:", error.message);
    throw error;
  }
};

// අලුත් Task එකක් යැවීම (POST)
export const addTask = async (taskData) => {
  const response = await axios.post(BACKEND_URL, taskData, { timeout: 6000 });
  return response.data;
};

// Task Status Update කිරීම (PUT)
export const updateTaskStatus = async (id, status) => {
  try {
    const response = await axios.put(`${BACKEND_URL}/${id}`, { status }, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn("Backend update failed:", error.message);
    throw error;
  }
};

// Task එකක් Delete කිරීම (DELETE)
export const deleteTaskAPI = async (id) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/${id}`, { timeout: 4000 });
    return response.data;
  } catch (error) {
    console.warn("Backend delete failed:", error.message);
    throw error;
  }
};

// Live AI Prediction ලබා ගැනීම (Real-time Preview)
export const predictTaskAI = async (description) => {
  try {
    const response = await axios.post(AI_SERVICE_URL, { description }, { timeout: 3000 });
    return response.data;
  } catch (error) {
    console.warn("Direct AI service preview unreachable:", error.message);
    const lower = (description || '').toLowerCase();
    const isBug = ['error', 'bug', 'fix', 'fail', 'issue', 'crash', 'not working'].some(w => lower.includes(w));
    return {
      predicted_type: isBug ? 'Bug' : 'Feature',
      estimated_time: isBug ? '1 - 3 Hours' : '1 - 2 Days'
    };
  }
};