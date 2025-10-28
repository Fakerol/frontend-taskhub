import React, { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import Modal from '../../components/Modal';
import { getProject } from '../../api/projects';

const createTaskSchema = (requireProject = false) => z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Task title must be less than 200 characters'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  assignedTo: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  status: z.enum(['todo', 'in-progress', 'done']).optional(),
  projectId: requireProject ? z.string().min(1, 'Project selection is required') : z.string().optional()
});

export default function TaskForm({ isOpen, onClose, onSubmit, task, title, projectId, members = [], projects = [], projectsLoading = false }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    status: 'todo',
    projectId: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProjectMembers, setSelectedProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const prevProjectIdRef = useRef(null);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: task.status || 'todo',
        projectId: task.project?._id || task.projectId || ''
      });
    } else {
      setForm({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        status: 'todo',
        projectId: projectId || ''
      });
    }
    setErrors({});
  }, [task, isOpen, projectId]);

  // Fetch project members when project is selected
  useEffect(() => {
    const fetchProjectMembers = async () => {
      // Only fetch if projectId actually changed and is not empty
      if (form.projectId && form.projectId !== prevProjectIdRef.current && projects.length > 0) {
        try {
          setLoadingMembers(true);
          const projectData = await getProject(form.projectId);
          setSelectedProjectMembers(projectData.members || []);
          prevProjectIdRef.current = form.projectId;
        } catch (err) {
          console.error('Failed to fetch project members:', err);
          setSelectedProjectMembers([]);
        } finally {
          setLoadingMembers(false);
        }
      } else if (members.length > 0 && !form.projectId) {
        // Use provided members if no project selection needed
        setSelectedProjectMembers(members);
      } else if (!form.projectId) {
        setSelectedProjectMembers([]);
      }
    };

    fetchProjectMembers();
  }, [form.projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const formData = {
        ...form,
        projectId: form.projectId || projectId,
        assignedTo: form.assignedTo || undefined,
        dueDate: new Date(form.dueDate).toISOString()
      };
      
      createTaskSchema(projects.length > 0 && !projectId).parse(formData);
      await onSubmit(formData);
    } catch (err) {
      if (err.errors) {
        const newErrors = {};
        err.errors.forEach(error => {
          newErrors[error.path[0]] = error.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Enter task title"
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Project Selection - Only show if projects are provided and no specific projectId */}
        {projects.length > 0 && !projectId && (
          <div>
            <label htmlFor="projectId" className="block text-sm font-semibold text-gray-700 mb-2">
              Project *
            </label>
            <select
              id="projectId"
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.projectId ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting || projectsLoading}
              required
            >
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
            )}
            {projectsLoading && (
              <p className="mt-1 text-sm text-gray-500">Loading projects...</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
              errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder="Describe the task (optional)..."
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isSubmitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-semibold text-gray-700 mb-2">
              Assignee
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isSubmitting || loadingMembers}
            >
              <option value="">Unassigned</option>
              {loadingMembers ? (
                <option value="" disabled>Loading members...</option>
              ) : (
                selectedProjectMembers.map(member => (
                  <option key={member._id || member.id} value={member._id || member.id}>{member.name}</option>
                ))
              )}
            </select>
            {loadingMembers && (
              <p className="mt-1 text-sm text-gray-500">Loading project members...</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
          )}
        </div>


        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{task ? 'Updating...' : 'Creating...'}</span>
              </>
            ) : (
              <span>{task ? 'Update Task' : 'Create Task'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}



