import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProject } from '../../api/projects';
import { api } from '../../api/auth';
import { useTasks } from '../../hooks/useTasks';
import TaskCard from '../../components/TaskCard';
import Modal from '../../components/Modal';
import TaskForm from '../Tasks/TaskForm';
import ProjectMembersModal from './ProjectMembersModal';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityPagination, setActivityPagination] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    projectId: id
  });

  const { tasks, loading: tasksLoading, addTask, editTask, removeTask, updateTaskStatus } = useTasks(filters);

  const isOwner = user?.role === 'owner' || project?.createdBy === user?._id || project?.owner === user?._id;

  const refreshProject = async () => {
    try {
      const projectData = await getProject(id);
      setProject(projectData);
    } catch (err) {
      console.error('Failed to refresh project:', err);
    }
  };

  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch project data
        const projectData = await getProject(id);
        setProject(projectData);
        
        // Fetch activity data from the real API
        await fetchActivities();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchActivities = async (page = 1) => {
    try {
      const response = await api.get(`/activities/project/${id}?page=${page}&limit=10`);
      
      if (response.data.success && response.data.data) {
        setActivities(response.data.data.activities || []);
        setActivityPagination(response.data.data.pagination || null);
        setActivityPage(page);
      } else {
        setActivities([]);
        setActivityPagination(null);
      }
    } catch (activityErr) {
      console.log('Activity endpoint error:', activityErr.message);
      setActivities([]);
      setActivityPagination(null);
    }
  };

  const handleActivityPageChange = (page) => {
    fetchActivities(page);
  };

  const handleCreateTask = async (taskData) => {
    try {
      await addTask({ ...taskData, projectId: id });
      setIsTaskModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleEditTask = async (taskData) => {
    try {
      await editTask(editingTask._id, taskData);
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(taskId);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleStatusChange = async (task) => {
    try {
      // Mark as done if not completed/done, otherwise toggle back to in-progress
      // Use 'in-progress' format to match TaskList implementation (backend may normalize it)
      const newStatus = (task.status === 'completed' || task.status === 'done') ? 'in-progress' : 'done';
      await updateTaskStatus(task, newStatus);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const getTotalTasksCount = () => {
    return tasks.length;
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.status === 'completed' || task.status === 'done').length;
  };

  const getProgressPercentage = () => {
    const totalTasks = getTotalTasksCount();
    const completedTasks = getCompletedTasksCount();
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

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
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Project</h3>
        <p className="text-red-600">{error}</p>
        <Link to="/projects" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
        <Link to="/projects" className="text-blue-600 hover:text-blue-800">
          ← Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Link to="/projects" className="text-blue-600 hover:text-blue-800">
            ← Back to Projects
          </Link>
        </div>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          </div>
          
          {isOwner && (
            <div className="flex space-x-3 ml-6">
              <button
                onClick={() => setIsMembersModalOpen(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Manage Members</span>
              </button>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Task</span>
              </button>
            </div>
          )}
        </div>
        
        <p className="text-gray-600">{project.description}</p>
      </div>

      {/* Project Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Progress</h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Tasks</h3>
            <p className="text-lg font-semibold text-gray-900">
              {getCompletedTasksCount()}/{getTotalTasksCount()} completed
            </p>
          </div>
        </div>
      </div>

      {/* Project Members */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <span className="text-sm text-gray-600">{project.members?.length || 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}</span>
        </div>
        
        {project.members && project.members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members.map(member => (
              <div key={member._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {member.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{member.email}</p>
                  {member.role && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === 'owner' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <p className="text-gray-600">No team members added yet</p>
            {isOwner && (
              <button
                onClick={() => setIsMembersModalOpen(true)}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Add team members
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
          <span className="text-sm text-gray-600">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </div>

        {tasksLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">Create your first task to get started.</p>
            {isOwner && (
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          {activityPagination && (
            <span className="text-sm text-gray-600">
              {activityPagination.totalItems} total activities
            </span>
          )}
        </div>

        {/* Activity Page Info */}
        {activityPagination && activityPagination.totalPages > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <span className="font-medium">Page {activityPagination.currentPage}</span> of{' '}
                <span className="font-medium">{activityPagination.totalPages}</span> •{' '}
                <span className="font-medium">{activityPagination.totalItems}</span> total activities
              </div>
              <div className="text-xs text-blue-600">
                Showing {activityPagination.itemsPerPage} activities per page
              </div>
            </div>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">No recent activity</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.activityId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {activity.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.action === 'created' ? 'bg-green-100 text-green-800' :
                          activity.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                          activity.action === 'deleted' ? 'bg-red-100 text-red-800' :
                          activity.action === 'added' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {activity.target}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Activity Pagination */}
            {activityPagination && activityPagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 rounded-lg shadow mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleActivityPageChange(Math.max(activityPage - 1, 1))}
                    disabled={activityPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleActivityPageChange(Math.min(activityPage + 1, activityPagination.totalPages))}
                    disabled={activityPage === activityPagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(activityPagination.currentPage - 1) * activityPagination.itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(activityPagination.currentPage * activityPagination.itemsPerPage, activityPagination.totalItems)}</span> of{' '}
                      <span className="font-medium">{activityPagination.totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handleActivityPageChange(Math.max(activityPage - 1, 1))}
                        disabled={activityPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(activityPagination.totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handleActivityPageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            activityPage === i + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handleActivityPageChange(Math.min(activityPage + 1, activityPagination.totalPages))}
                        disabled={activityPage === activityPagination.totalPages}
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
      </div>

      {/* Modals */}
      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        title="Create New Task"
        projectId={id}
        members={project.members || []}
        projects={[]}
        projectsLoading={false}
      />

      {editingTask && (
        <TaskForm
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleEditTask}
          task={editingTask}
          title="Edit Task"
          projectId={id}
          members={project.members || []}
          projects={[]}
          projectsLoading={false}
        />
      )}

      {/* Project Members Modal */}
      <ProjectMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={id}
        members={project.members || []}
        onMembersUpdate={refreshProject}
      />
    </div>
  );
}



