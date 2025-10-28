import { useState, useEffect } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProjects(params);
      // Handle both paginated and non-paginated responses
      if (response.projects) {
        setProjects(response.projects);
      } else if (Array.isArray(response)) {
        setProjects(response);
      } else {
        setProjects([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData) => {
    try {
      const newProject = await createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const editProject = async (id, projectData) => {
    try {
      const updatedProject = await updateProject(id, projectData);
      setProjects(prev => prev.map(p => p._id === id ? updatedProject : p));
      return updatedProject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    addProject,
    editProject,
    removeProject,
    refetch: fetchProjects
  };
}


