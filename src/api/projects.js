// Mock API for projects
const mockProjects = [
  {
    id: 1,
    name: "Website Redesign",
    description: "Complete redesign of the company website with modern UI/UX",
    status: "active",
    ownerId: 1,
    members: [
      { id: 1, name: "Admin User", email: "admin@test.com", role: "owner" },
      { id: 2, name: "John Doe", email: "john@example.com", role: "member" }
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    taskCount: 8,
    completedTasks: 3
  },
  {
    id: 2,
    name: "Mobile App Development",
    description: "Develop a cross-platform mobile application for iOS and Android",
    status: "planning",
    ownerId: 1,
    members: [
      { id: 1, name: "Admin User", email: "admin@test.com", role: "owner" },
      { id: 3, name: "Jane Smith", email: "jane@example.com", role: "member" }
    ],
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    taskCount: 12,
    completedTasks: 1
  },
  {
    id: 3,
    name: "Database Migration",
    description: "Migrate legacy database to new cloud infrastructure",
    status: "completed",
    ownerId: 1,
    members: [
      { id: 1, name: "Admin User", email: "admin@test.com", role: "owner" }
    ],
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-25T12:00:00Z",
    taskCount: 5,
    completedTasks: 5
  }
];

const mockTasks = [
  {
    id: 1,
    projectId: 1,
    title: "Design Homepage Layout",
    description: "Create wireframes and mockups for the new homepage design",
    status: "in_progress",
    priority: "high",
    assigneeId: 2,
    assignee: { id: 2, name: "John Doe", email: "john@example.com" },
    dueDate: "2024-02-15T17:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    tags: ["design", "ui", "homepage"]
  },
  {
    id: 2,
    projectId: 1,
    title: "Implement Responsive Navigation",
    description: "Build responsive navigation component with mobile menu",
    status: "todo",
    priority: "medium",
    assigneeId: 2,
    assignee: { id: 2, name: "John Doe", email: "john@example.com" },
    dueDate: "2024-02-20T17:00:00Z",
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-01-16T11:00:00Z",
    tags: ["frontend", "responsive", "navigation"]
  },
  {
    id: 3,
    projectId: 1,
    title: "Setup Testing Framework",
    description: "Configure Jest and React Testing Library for unit tests",
    status: "completed",
    priority: "low",
    assigneeId: 1,
    assignee: { id: 1, name: "Admin User", email: "admin@test.com" },
    dueDate: "2024-01-25T17:00:00Z",
    createdAt: "2024-01-15T12:00:00Z",
    updatedAt: "2024-01-25T10:00:00Z",
    tags: ["testing", "setup", "jest"]
  },
  {
    id: 4,
    projectId: 2,
    title: "Design App Architecture",
    description: "Plan the overall architecture and component structure",
    status: "in_progress",
    priority: "high",
    assigneeId: 3,
    assignee: { id: 3, name: "Jane Smith", email: "jane@example.com" },
    dueDate: "2024-02-10T17:00:00Z",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    tags: ["architecture", "planning", "mobile"]
  }
];

const mockActivityLog = [
  {
    id: 1,
    projectId: 1,
    userId: 1,
    user: { id: 1, name: "Admin User", email: "admin@test.com" },
    action: "created",
    entityType: "task",
    entityId: 1,
    entityName: "Design Homepage Layout",
    timestamp: "2024-01-15T10:00:00Z",
    details: "Task created and assigned to John Doe"
  },
  {
    id: 2,
    projectId: 1,
    userId: 2,
    user: { id: 2, name: "John Doe", email: "john@example.com" },
    action: "updated",
    entityType: "task",
    entityId: 1,
    entityName: "Design Homepage Layout",
    timestamp: "2024-01-20T14:30:00Z",
    details: "Status changed from 'todo' to 'in_progress'"
  },
  {
    id: 3,
    projectId: 1,
    userId: 1,
    user: { id: 1, name: "Admin User", email: "admin@test.com" },
    action: "added",
    entityType: "member",
    entityId: 2,
    entityName: "John Doe",
    timestamp: "2024-01-15T09:30:00Z",
    details: "Added John Doe as a project member"
  }
];

// Projects API
export async function getProjects() {
  await new Promise(res => setTimeout(res, 500));
  return mockProjects;
}

export async function getProject(id) {
  await new Promise(res => setTimeout(res, 300));
  const project = mockProjects.find(p => p.id === parseInt(id));
  if (!project) throw new Error("Project not found");
  return project;
}

export async function createProject(projectData) {
  await new Promise(res => setTimeout(res, 800));
  const newProject = {
    id: mockProjects.length + 1,
    ...projectData,
    status: "planning",
    ownerId: 1, // Current user
    members: [{ id: 1, name: "Admin User", email: "admin@test.com", role: "owner" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    taskCount: 0,
    completedTasks: 0
  };
  mockProjects.push(newProject);
  return newProject;
}

export async function updateProject(id, projectData) {
  await new Promise(res => setTimeout(res, 600));
  const projectIndex = mockProjects.findIndex(p => p.id === parseInt(id));
  if (projectIndex === -1) throw new Error("Project not found");
  
  mockProjects[projectIndex] = {
    ...mockProjects[projectIndex],
    ...projectData,
    updatedAt: new Date().toISOString()
  };
  return mockProjects[projectIndex];
}

export async function deleteProject(id) {
  await new Promise(res => setTimeout(res, 400));
  const projectIndex = mockProjects.findIndex(p => p.id === parseInt(id));
  if (projectIndex === -1) throw new Error("Project not found");
  
  const deletedProject = mockProjects.splice(projectIndex, 1)[0];
  return deletedProject;
}

// Tasks API
export async function getTasks(projectId = null, filters = {}) {
  await new Promise(res => setTimeout(res, 500));
  let filteredTasks = [...mockTasks];
  
  if (projectId) {
    filteredTasks = filteredTasks.filter(task => task.projectId === parseInt(projectId));
  }
  
  // Apply filters
  if (filters.status) {
    filteredTasks = filteredTasks.filter(task => task.status === filters.status);
  }
  
  if (filters.priority) {
    filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
  }
  
  if (filters.assigneeId) {
    filteredTasks = filteredTasks.filter(task => task.assigneeId === parseInt(filters.assigneeId));
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredTasks = filteredTasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply sorting
  if (filters.sortBy) {
    filteredTasks.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }
  
  return filteredTasks;
}

export async function getTask(id) {
  await new Promise(res => setTimeout(res, 300));
  const task = mockTasks.find(t => t.id === parseInt(id));
  if (!task) throw new Error("Task not found");
  return task;
}

export async function createTask(taskData) {
  await new Promise(res => setTimeout(res, 800));
  const newTask = {
    id: mockTasks.length + 1,
    ...taskData,
    status: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: taskData.tags || []
  };
  mockTasks.push(newTask);
  return newTask;
}

export async function updateTask(id, taskData) {
  await new Promise(res => setTimeout(res, 600));
  const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) throw new Error("Task not found");
  
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    ...taskData,
    updatedAt: new Date().toISOString()
  };
  return mockTasks[taskIndex];
}

export async function deleteTask(id) {
  await new Promise(res => setTimeout(res, 400));
  const taskIndex = mockTasks.findIndex(t => t.id === parseInt(id));
  if (taskIndex === -1) throw new Error("Task not found");
  
  const deletedTask = mockTasks.splice(taskIndex, 1)[0];
  return deletedTask;
}

// Activity Log API
export async function getProjectActivity(projectId) {
  await new Promise(res => setTimeout(res, 400));
  return mockActivityLog.filter(activity => activity.projectId === parseInt(projectId));
}

