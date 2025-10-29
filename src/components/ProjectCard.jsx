import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProjectCard({ project, onDelete, onEdit }) {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner' || project.ownerId === user?.id;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link 
      to={`/projects/${project._id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 cursor-pointer"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
          </div>
          
          {/* Actions */}
          {isOwner && (
            <div className="flex items-center space-x-2 ml-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(project);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(project._id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Status and Members */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status ? project.status.replace('_', ' ').toUpperCase() : ''}
            </span>
            
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {(project.members || []).slice(0, 3).map((member, index) => (
                  <div
                    key={member._id}
                    className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center border-2 border-white"
                    title={member.name}
                  >
                    <span className="text-white text-xs font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {(project.members || []).length > 3 && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-gray-600 text-xs font-medium">
                      +{(project.members || []).length - 3}
                    </span>
                  </div>
                )}
              </div>
              {(project.members || []).length > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {(project.members || []).length} member{(project.members || []).length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          
          <span className="text-sm text-gray-500">
            {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>
    </Link>
  );
}



