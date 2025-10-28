import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';

export function useTasks(projectId = null, filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks(projectId, filters);
      setTasks(data);
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
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTaskStatus = async (task, newStatus) => {
    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, JSON.stringify(filters)]);

  return {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    updateTaskStatus,
    refetch: fetchTasks
  };
}


