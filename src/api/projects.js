import { api } from './auth.js';

// Projects API - Real backend implementation
export async function getProjects(params = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/projects?${queryString}` : '/projects';
    
    const response = await api.get(url);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch projects');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch projects');
  }
}

export async function getProject(id) {
  try {
    const response = await api.get(`/projects/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Project not found');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch project');
  }
}

export async function createProject(projectData) {
  try {
    const response = await api.post('/projects', projectData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create project');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error(error.response?.data?.message || 'Failed to create project');
  }
}

export async function updateProject(id, projectData) {
  try {
    const response = await api.put(`/projects/${id}`, projectData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update project');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error(error.response?.data?.message || 'Failed to update project');
  }
}

export async function deleteProject(id) {
  try {
    const response = await api.delete(`/projects/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete project');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error(error.response?.data?.message || 'Failed to delete project');
  }
}

// Project Members API
export async function addProjectMember(projectId, memberData) {
  try {
    const response = await api.post(`/projects/${projectId}/members`, memberData);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to add member');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error adding project member:', error);
    throw new Error(error.response?.data?.message || 'Failed to add member');
  }
}

export async function removeProjectMember(projectId, userId) {
  try {
    const response = await api.delete(`/projects/${projectId}/members`, {
      data: { userId }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to remove member');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error removing project member:', error);
    throw new Error(error.response?.data?.message || 'Failed to remove member');
  }
}

// Project Activity API
export async function getProjectActivity(projectId) {
  try {
    const response = await api.get(`/projects/${projectId}/activity`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch project activity');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching project activity:', error);
    // Return empty array if activity endpoint doesn't exist yet
    if (error.response?.status === 404) {
      return [];
    }
    throw new Error(error.response?.data?.message || 'Failed to fetch project activity');
  }
}



