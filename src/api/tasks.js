// Tasks API - Real backend implementation
import { api } from './auth.js';

export async function getTasks(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters according to API specification
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
    if (filters.projectId) queryParams.append('projectId', filters.projectId);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    
    const response = await api.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch tasks');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch tasks');
  }
}

export async function getTask(id) {
  try {
    const response = await api.get(`/tasks/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Task not found');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch task');
  }
}

export async function createTask(taskData) {
  try {
    // Ensure the task data matches the API specification
    const apiTaskData = {
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      assignedTo: taskData.assignedTo
    };
    
    const response = await api.post('/tasks', apiTaskData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create task');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error(error.response?.data?.message || 'Failed to create task');
  }
}

export async function updateTask(id, taskData) {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update task');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error(error.response?.data?.message || 'Failed to update task');
  }
}

export async function deleteTask(id) {
  try {
    const response = await api.delete(`/tasks/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete task');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete task');
  }
}

export async function assignTask(id, assignedTo) {
  try {
    const response = await api.patch(`/tasks/${id}/assign`, { assignedTo });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to assign task');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error assigning task:', error);
    throw new Error(error.response?.data?.message || 'Failed to assign task');
  }
}

