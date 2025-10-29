import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import { getProjects } from '../../api/projects';
import { getTask, getTasks } from '../../api/tasks';
import TaskForm from './TaskForm';
import TaskDetailsModal from '../../components/TaskDetailsModal';

export default function TaskList() {
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetails, setTaskDetails] = useState(null);
  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, todo: 0, completed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
    page: 1,
    limit: 6
  });
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Use the useTasks hook with filters
  const { tasks, loading, error, pagination, addTask, editTask, removeTask, updateTaskStatus, refetch } = useTasks(filters);

  const isOwner = user?.role === 'owner';

  // Fetch stats for all tasks (without pagination/filters to get accurate totals)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        // Fetch all tasks without pagination and filters to get accurate stats
        const allTasksResponse = await getTasks({});
        let allTasks = [];
        
        if (allTasksResponse.tasks && Array.isArray(allTasksResponse.tasks)) {
          allTasks = allTasksResponse.tasks;
        } else if (Array.isArray(allTasksResponse)) {
          allTasks = allTasksResponse;
        }

        // Calculate stats from all tasks
        const total = allTasks.length;
        const todo = allTasks.filter(t => t.status === 'todo' || t.status === 'in-progress' || t.status === 'in_progress').length;
        const completed = allTasks.filter(t => t.status === 'completed' || t.status === 'done').length;
        
        setStats({ total, todo, completed });
      } catch (err) {
        console.error('Failed to fetch task stats:', err);
        // Fallback to using pagination totals if available
        if (pagination) {
          setStats({
            total: pagination.totalItems || 0,
            todo: 0,
            completed: 0
          });
        }
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []); // Only fetch once on mount

  // Function to refetch stats (called after task operations)
  const refreshStats = async () => {
    try {
      const allTasksResponse = await getTasks({});
      let allTasks = [];
      
      if (allTasksResponse.tasks && Array.isArray(allTasksResponse.tasks)) {
        allTasks = allTasksResponse.tasks;
      } else if (Array.isArray(allTasksResponse)) {
        allTasks = allTasksResponse;
      }

      const total = allTasks.length;
      const todo = allTasks.filter(t => t.status === 'todo' || t.status === 'in-progress' || t.status === 'in_progress').length;
      const completed = allTasks.filter(t => t.status === 'completed' || t.status === 'done').length;
      
      setStats({ total, todo, completed });
    } catch (err) {
      console.error('Failed to update task stats:', err);
    }
  };

  // Fetch projects for task creation
  useEffect(() => {
    const fetchProjects = async () => {
      if (isOwner) {
        try {
          setProjectsLoading(true);
          const projectsData = await getProjects();
          // Handle both paginated and non-paginated responses
          if (projectsData.projects && Array.isArray(projectsData.projects)) {
            setProjects(projectsData.projects);
          } else if (Array.isArray(projectsData)) {
            setProjects(projectsData);
          } else {
            setProjects([]);
          }
        } catch (err) {
          console.error('Failed to fetch projects:', err);
          setProjects([]);
        } finally {
          setProjectsLoading(false);
        }
      }
    };

    fetchProjects();
  }, [isOwner]);

  const handleCreateTask = async (taskData) => {
    try {
      await addTask(taskData);
      setIsCreateModalOpen(false);
      await refreshStats(); // Refresh stats after creating task
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await editTask(editingTask._id, taskData);
      setEditingTask(null);
      await refreshStats(); // Refresh stats after updating task
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(taskId);
        await refreshStats(); // Refresh stats after deleting task
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleStatusChange = async (task) => {
    try {
      // Toggle between todo and done only
      const newStatus = task.status === 'todo' || task.status === 'in-progress' || task.status === 'in_progress' ? 'done' : 'todo';
      await updateTaskStatus(task, newStatus);
      await refreshStats(); // Refresh stats after status change
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleViewTaskDetails = async (task) => {
    try {
      setTaskDetailsLoading(true);
      setSelectedTask(task);
      
      // Fetch detailed task information using the API
      const detailedTask = await getTask(task._id);
      setTaskDetails(detailedTask);
    } catch (err) {
      console.error('Failed to fetch task details:', err);
      // Fallback to the basic task data if API call fails
      setTaskDetails(task);
    } finally {
      setTaskDetailsLoading(false);
    }
  };

  const handleCloseTaskDetails = () => {
    setSelectedTask(null);
    setTaskDetails(null);
    setTaskDetailsLoading(false);
  };

  // Handle filter changes and refetch data
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setFilters(prev => ({ ...prev, page }));
  };

  // Get pagination info from API response
  const totalPages = pagination ? pagination.totalPages : Math.max(1, Math.ceil(tasks.length / 6));
  const startIndex = pagination ? (pagination.currentPage - 1) * pagination.itemsPerPage : (currentPage - 1) * 6;
  
  // Client-side pagination fallback
  const paginatedTasks = pagination ? tasks : tasks.slice(startIndex, startIndex + 6);
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Tasks</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600 mt-1">Manage tasks across all projects</p>
        </div>
        
        {isOwner && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">To Do</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.todo}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Done</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Sort Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange({ status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange({ priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dueDate">Due Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Clear Filters Button */}
        {(filters.status || filters.priority || searchInput) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchInput('');
                handleFilterChange({ 
                  status: '', 
                  priority: '', 
                  search: '' 
                });
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Page {pagination ? pagination.currentPage : currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span> •{' '}
              <span className="font-medium">{pagination ? pagination.totalItems : tasks.length}</span> total tasks
            </div>
            <div className="text-xs text-blue-600">
              Showing {pagination ? pagination.itemsPerPage : 6} tasks per page
            </div>
          </div>
        </div>
      )}

      {/* Tasks Table */}
      {paginatedTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-6">
            {filters.status || filters.priority || searchInput 
              ? 'Try adjusting your filters to see more tasks.' 
              : 'Create your first task to get started.'}
          </p>
          {isOwner && !filters.status && !filters.priority && !searchInput && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTasks.map(task => {
                    const isAssignee = task.assignedTo?._id === user?.id;
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'done';
                    
                    const getStatusColor = (status) => {
                      switch (status) {
                        case 'todo': return 'bg-gray-100 text-gray-800';
                        case 'in_progress': return 'bg-blue-100 text-blue-800';
                        case 'completed': return 'bg-green-100 text-green-800';
                        case 'done': return 'bg-green-100 text-green-800';
                        case 'cancelled': return 'bg-red-100 text-red-800';
                        default: return 'bg-gray-100 text-gray-800';
                      }
                    };

                    const getPriorityColor = (priority) => {
                      switch (priority) {
                        case 'high': return 'text-red-600';
                        case 'medium': return 'text-yellow-600';
                        case 'low': return 'text-green-600';
                        default: return 'text-gray-600';
                      }
                    };

                    const getStatusLabel = (status) => {
                      if (status === 'done' || status === 'completed') return 'DONE';
                      if (status === 'in-progress' || status === 'in_progress') return 'IN PROGRESS';
                      return 'TODO';
                    };

                    return (
                      <tr 
                key={task._id}
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          isOverdue ? 'bg-red-50' : ''
                        }`}
                        onClick={() => handleViewTaskDetails(task)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-gray-900">
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority ? task.priority.toUpperCase() : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {task.assignedTo?.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">
                              {task.assignedTo?.name || 'Unassigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center space-x-1 text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {task.tags && task.tags.length > 0 ? (
                              task.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
                            {(isOwner || isAssignee) && task.status !== 'completed' && task.status !== 'done' && (
                              <button
                                onClick={() => handleStatusChange(task)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Mark Complete"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            {(isOwner || isAssignee) && (
                              <button
                                onClick={() => setEditingTask(task)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit task"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                            {isOwner && (
                              <button
                                onClick={() => handleDeleteTask(task._id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete task"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {pagination ? (
                      <>
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(startIndex + pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
                        <span className="font-medium">{pagination.totalItems}</span> results
                      </>
                    ) : (
                      <>
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(startIndex + 6, tasks.length)}</span> of{' '}
                        <span className="font-medium">{tasks.length}</span> results
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <TaskForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        title="Create New Task"
        projects={projects}
        projectsLoading={projectsLoading}
      />

      {editingTask && (
        <TaskForm
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleEditTask}
          task={editingTask}
          title="Edit Task"
          projects={projects}
          projectsLoading={projectsLoading}
        />
      )}

      {/* Task Details Modal */}
      <TaskDetailsModal
        task={taskDetails}
        isOpen={!!selectedTask}
        onClose={handleCloseTaskDetails}
      />
    </div>
  );
}
