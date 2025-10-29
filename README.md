# TaskHub Frontend

A modern, responsive task and project management application built with React and Vite. TaskHub provides a comprehensive interface for managing projects, tasks, team members, and user authentication.

## 🚀 Features

### Authentication
- User registration and login
- JWT token-based authentication with automatic refresh
- Protected routes
- User session management

### Projects Management
- Create, view, edit, and delete projects
- Project member management (add/remove members)
- Project overview with statistics
- Project-specific task listing

### Tasks Management
- **Table View**: Display all tasks in a responsive table format
- Create, update, and delete tasks
- Task filtering by status and priority
- Task search functionality
- Sort tasks by due date, title, priority, status, or creation date
- Task assignment to team members
- Priority levels (High, Medium, Low)
- Task status management (Todo, In Progress, Done)
- Due date tracking with overdue highlighting
- Task tags for categorization
- Task details modal with comprehensive information

### User Interface
- Modern, clean UI built with Tailwind CSS
- Fully responsive design
- Dark/light theme support
- Real-time updates
- Loading states and error handling
- Pagination for large datasets

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite 7** - Build tool and dev server
- **React Router DOM 7** - Client-side routing
- **Axios** - HTTP client for API requests
- **TanStack Query** - Server state management and data fetching
- **Tailwind CSS** - Utility-first CSS framework
- **Zod** - Schema validation

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** or **pnpm** package manager
- **Backend API** running (default: `http://localhost:5000/api/`)

## 🔧 Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd frontend-taskhub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```
   or
   ```bash
   pnpm install
   ```

## ⚙️ Configuration

The application connects to a backend API. By default, it's configured to use:

```
http://localhost:5000/api/
```

To change the API base URL, you can:

1. **Create a `.env` file** in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/
   ```

2. **Or modify** the baseURL in `src/api/auth.js`:
   ```javascript
   const api = axios.create({
     baseURL: 'http://your-api-url/api/',
     // ...
   });
   ```

## 🏃 Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

or

```bash
yarn dev
```

or

```bash
pnpm dev
```

The application will be available at `http://localhost:5173` (or the next available port).

The development server includes:
- Hot Module Replacement (HMR) for instant updates
- Fast refresh for React components
- Source maps for debugging

### Building for Production

To create a production build:

```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

### Linting

To check for linting errors:

```bash
npm run lint
```

## 📁 Project Structure

```
frontend-taskhub/
├── public/              # Static assets
├── src/
│   ├── api/            # API service functions
│   │   ├── auth.js     # Authentication API
│   │   ├── projects.js # Projects API
│   │   └── tasks.js    # Tasks API
│   ├── components/     # Reusable React components
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Modal.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── TaskCard.jsx
│   │   └── TaskDetailsModal.jsx
│   ├── context/        # React Context providers
│   │   └── AuthContext.jsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useProjects.js
│   │   ├── useTasks.js
│   │   ├── useTask.js
│   │   └── useDebounce.js
│   ├── pages/          # Page components
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── Projects/
│   │   │   ├── ProjectsList.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── CreateProjectModal.jsx
│   │   │   └── ProjectMembersModal.jsx
│   │   ├── Tasks/
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskForm.jsx
│   │   └── Settings/
│   │       └── Settings.jsx
│   ├── router/         # Routing configuration
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   ├── styles/         # Global styles
│   │   └── globals.css
│   ├── utils/          # Utility functions
│   │   └── validators.js
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## 🔐 Authentication Flow

1. Users register or login through the `/login` or `/signup` pages
2. Upon successful authentication, JWT tokens are stored in localStorage
3. The access token is automatically included in all API requests
4. When the access token expires, the refresh token is used to obtain a new access token
5. If refresh fails, users are redirected to the login page

## 🎯 Key Features Explained

### Protected Routes
All routes except `/login` and `/signup` are protected and require authentication. Unauthenticated users are automatically redirected to the login page.

### Task Management
- **Table View**: Tasks are displayed in a responsive table with columns for:
  - Title and description
  - Status badges (Todo, In Progress, Done)
  - Priority indicators
  - Assignee information with avatars
  - Due dates (with overdue highlighting)
  - Tags
  - Action buttons (Edit, Delete, Mark Complete)

### Real-time Updates
The application uses React Query for efficient data fetching and caching, ensuring a smooth user experience with automatic refetching.

## 🐛 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port. You can also specify a different port:

```bash
npm run dev -- --port 3000
```

### API Connection Issues
- Ensure the backend API is running and accessible
- Check the API base URL configuration
- Verify CORS settings on the backend if accessing from a different origin
- Check browser console for specific error messages

### Build Errors
- Clear node_modules and reinstall dependencies:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Check Node.js version compatibility (v18+ recommended)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Heroicons](https://heroicons.com/)

---

For more information about the API usage, see `src/api/README.md`.
