import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, assignTask } from '../api/tasks';

export function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTasks(filters);
      // Handle paginated response structure from API
      if (response.tasks && Array.isArray(response.tasks)) {
        setTasks(response.tasks);
        setPagination(response.pagination || null);
      } else if (Array.isArray(response)) {
        setTasks(response);
        setPagination(null);
      } else {
        setTasks([]);
        setPagination(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editTask = async (id, taskData) => {
    try {
      const updatedTask = await updateTask(id, taskData);
      setTasks(prev => prev.map(t => t._id === id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    try {
      const updatedTask = await updateTask(task._id, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const assignTaskToUser = async (taskId, assignedTo) => {
    try {
      const updatedTask = await assignTask(taskId, assignedTo);
      setTasks(prev => prev.map(t => t._id === taskId ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [JSON.stringify(filters)]);

  return {
    tasks,
    loading,
    error,
    pagination,
    addTask,
    editTask,
    removeTask,
    updateTaskStatus,
    assignTaskToUser,
    refetch: fetchTasks
  };
}



