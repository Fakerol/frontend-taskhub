# API Usage Examples

This document provides examples of how to use the project management API functions.

## Projects API

### Get All Projects
```javascript
import { getProjects } from './api/projects';

// Basic usage
const projects = await getProjects();

// With pagination and filtering
const projectsWithParams = await getProjects({
  page: 1,
  limit: 10,
  search: 'website',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### Get Single Project
```javascript
import { getProject } from './api/projects';

const project = await getProject('project_id');
```

### Create Project
```javascript
import { createProject } from './api/projects';

const newProject = await createProject({
  name: 'My New Project',
  description: 'Project description (optional)'
});
```

### Update Project
```javascript
import { updateProject } from './api/projects';

const updatedProject = await updateProject('project_id', {
  name: 'Updated Project Name',
  description: 'Updated description'
});
```

### Delete Project
```javascript
import { deleteProject } from './api/projects';

await deleteProject('project_id');
```

### Add Project Member
```javascript
import { addProjectMember } from './api/projects';

const result = await addProjectMember('project_id', {
  email: 'member@example.com'
});
```

### Remove Project Member
```javascript
import { removeProjectMember } from './api/projects';

await removeProjectMember('project_id', 'user_id_to_remove');
```

## Tasks API

### Get Tasks
```javascript
import { getTasks } from './api/tasks';

// Get all tasks
const allTasks = await getTasks();

// Get tasks for specific project
const projectTasks = await getTasks('project_id');

// Get tasks with filters
const filteredTasks = await getTasks('project_id', {
  status: 'in_progress',
  priority: 'high',
  search: 'design',
  sortBy: 'dueDate',
  sortOrder: 'asc',
  page: 1,
  limit: 20
});
```

### Get Single Task
```javascript
import { getTask } from './api/tasks';

const task = await getTask('task_id');
```

### Create Task
```javascript
import { createTask } from './api/tasks';

const newTask = await createTask({
  projectId: 'project_id',
  title: 'Task Title',
  description: 'Task description',
  priority: 'high',
  assigneeId: 'user_id',
  dueDate: '2024-02-15T17:00:00Z',
  tags: ['frontend', 'ui']
});
```

### Update Task
```javascript
import { updateTask } from './api/tasks';

const updatedTask = await updateTask('task_id', {
  title: 'Updated Task Title',
  status: 'completed',
  priority: 'medium'
});
```

### Delete Task
```javascript
import { deleteTask } from './api/tasks';

await deleteTask('task_id');
```

## Using React Hooks

### useProjects Hook
```javascript
import { useProjects } from './hooks/useProjects';

function ProjectsList() {
  const { 
    projects, 
    loading, 
    error, 
    addProject, 
    editProject, 
    removeProject, 
    refetch 
  } = useProjects();

  const handleCreateProject = async (projectData) => {
    try {
      await addProject(projectData);
      // Project automatically added to state
    } catch (error) {
      console.error('Failed to create project:', error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project._id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <button onClick={() => removeProject(project._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### useTasks Hook
```javascript
import { useTasks } from './hooks/useTasks';

function TaskList({ projectId }) {
  const { 
    tasks, 
    loading, 
    error, 
    addTask, 
    editTask, 
    removeTask, 
    updateTaskStatus,
    refetch 
  } = useTasks(projectId, {
    status: 'in_progress',
    sortBy: 'dueDate'
  });

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTaskStatus(task, newStatus);
      // Task status automatically updated in state
    } catch (error) {
      console.error('Failed to update task:', error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task._id}>
          <h4>{task.title}</h4>
          <p>Status: {task.status}</p>
          <button onClick={() => handleStatusChange(task, 'completed')}>
            Mark Complete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

All API functions throw errors that should be caught and handled appropriately:

```javascript
try {
  const project = await createProject({
    name: 'New Project',
    description: 'Project description'
  });
  console.log('Project created:', project);
} catch (error) {
  console.error('Error creating project:', error.message);
  // Handle error (show notification, redirect, etc.)
}
```

## Response Format

All API responses follow this format:

```javascript
{
  success: true,
  message: "Operation completed successfully",
  data: {
    // Actual data here
    // For paginated responses, data contains:
    // - projects/tasks array
    // - pagination object with currentPage, totalPages, etc.
  }
}
```

## Authentication

All API calls automatically include the JWT token from localStorage. The token is refreshed automatically when it expires.
