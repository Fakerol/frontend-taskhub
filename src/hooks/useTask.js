import { useState, useEffect } from 'react';
import { getTask, updateTask, deleteTask, assignTask } from '../api/tasks';

export function useTask(taskId) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTask = async () => {
    if (!taskId) {
      setTask(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const taskData = await getTask(taskId);
      setTask(taskData);
    } catch (err) {
      setError(err.message);
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  const editTask = async (taskData) => {
    if (!taskId) {
      throw new Error('No task ID provided');
    }

    try {
      const updatedTask = await updateTask(taskId, taskData);
      setTask(updatedTask);
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeTask = async () => {
    if (!taskId) {
      throw new Error('No task ID provided');
    }

    try {
      await deleteTask(taskId);
      setTask(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const assignTaskToUser = async (assignedTo) => {
    if (!taskId) {
      throw new Error('No task ID provided');
    }

    try {
      const updatedTask = await assignTask(taskId, assignedTo);
      setTask(updatedTask);
      return updatedTask;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTaskStatus = async (newStatus) => {
    return editTask({ status: newStatus });
  };

  const updateTaskPriority = async (newPriority) => {
    return editTask({ priority: newPriority });
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  return {
    task,
    loading,
    error,
    editTask,
    removeTask,
    assignTaskToUser,
    updateTaskStatus,
    updateTaskPriority,
    refetch: fetchTask
  };
}
