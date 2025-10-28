import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import Modal from '../../components/Modal';
import { addProjectMember, removeProjectMember } from '../../api/projects';

const emailSchema = z.string().email('Please enter a valid email address');

export default function ProjectMembersModal({ isOpen, onClose, projectId, members = [], onMembersUpdate }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setErrors({});
      setIsSubmitting(false);
      setIsRemoving(null);
    }
  }, [isOpen]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      emailSchema.parse(email);
      await addProjectMember(projectId, { email });
      
      // Refresh members list
      if (onMembersUpdate) {
        await onMembersUpdate();
      }
      
      setEmail('');
    } catch (err) {
      if (err.errors) {
        setErrors({ email: err.errors[0].message });
      } else {
        setErrors({ general: err.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the project?')) {
      return;
    }

    setIsRemoving(memberId);
    try {
      await removeProjectMember(projectId, memberId);
      
      // Refresh members list
      if (onMembersUpdate) {
        await onMembersUpdate();
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member. Please try again.');
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Project Members" size="lg">
      <div className="space-y-6">
        {/* Add Member Form */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h3>
          
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleAddMember} className="flex space-x-3">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter member email address"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting || !email.trim()}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Member</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Members List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Members</h3>
          
          {members.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-gray-600">No members added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600">{member.email}</p>
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
                  
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    disabled={isRemoving === member._id}
                    className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {isRemoving === member._id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Removing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Remove</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
