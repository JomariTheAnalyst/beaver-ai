export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  prompt: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  featured?: boolean;
  order?: number;
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'ecommerce-store',
    title: 'E-commerce Store',
    description: 'A full-featured online store with product catalog, shopping cart, and payment integration',
    techStack: ['React', 'Next.js', 'Stripe', 'TailwindCSS', 'PostgreSQL'],
    category: 'E-commerce',
    tags: ['shopping', 'payments', 'inventory'],
    featured: true,
    order: 1,
    imageUrl: 'https://images.unsplash.com/photo-1457305237443-44c3d5a30b89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx3ZWIlMjBkZXZlbG9wbWVudHxlbnwwfHx8fDE3NTU0MDU3NzF8MA&ixlib=rb-4.1.0&q=85',
    prompt: `Create a modern e-commerce store with the following features:

**Core Features:**
- Product catalog with categories and search
- Shopping cart and wishlist functionality
- User authentication and profiles
- Secure payment processing with Stripe
- Order management and tracking
- Admin dashboard for inventory management

**Design Requirements:**
- Clean, modern design with excellent UX
- Mobile-responsive layout
- Fast loading and optimized images
- SEO-friendly structure

**Technical Specifications:**
- React/Next.js frontend
- PostgreSQL database
- Stripe payment integration
- TailwindCSS for styling
- JWT authentication
- RESTful API design

Please build a complete, production-ready e-commerce solution with all necessary pages, components, and functionality.`
  },
  {
    id: 'saas-dashboard',
    title: 'SaaS Dashboard',
    description: 'Analytics dashboard with charts, metrics, and user management for SaaS applications',
    techStack: ['React', 'TypeScript', 'Chart.js', 'TailwindCSS', 'Node.js'],
    category: 'SaaS',
    tags: ['analytics', 'dashboard', 'charts'],
    featured: true,
    order: 2,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxkYXNoYm9hcmR8ZW58MHx8fHwxNzU1NDA1Nzc2fDA&ixlib=rb-4.1.0&q=85',
    prompt: `Build a comprehensive SaaS dashboard application:

**Dashboard Features:**
- Real-time analytics and metrics
- Interactive charts and graphs
- User management and permissions
- Subscription and billing management
- Activity logs and notifications
- Settings and configuration panels

**Analytics Components:**
- Revenue and growth metrics
- User engagement analytics
- Performance monitoring
- Custom report generation
- Export functionality

**Technical Requirements:**
- TypeScript for type safety
- Chart.js for data visualization
- Real-time updates with WebSockets
- Responsive design
- Dark/light theme support
- Role-based access control

Create a modern, professional dashboard that works great for any SaaS business.`
  },
  {
    id: 'social-media-app',
    title: 'Social Media Platform',
    description: 'Full-featured social media app with posts, comments, likes, and real-time messaging',
    techStack: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Cloudinary'],
    category: 'Social',
    tags: ['social', 'messaging', 'real-time'],
    featured: false,
    order: 3,
    imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHx3ZWIlMjBkZXZlbG9wbWVudHxlbnwwfHx8fDE3NTU0MDU3NzF8MA&ixlib=rb-4.1.0&q=85',
    prompt: `Create a modern social media platform:

**Core Social Features:**
- User profiles and authentication
- Post creation with text, images, and videos
- Like, comment, and share functionality
- Follow/unfollow users
- News feed with algorithmic sorting
- Real-time messaging and notifications

**Advanced Features:**
- Story functionality (24-hour posts)
- Live streaming capabilities
- Hashtag and mention system
- Search and discovery
- Content moderation tools
- Mobile-responsive design

**Technical Stack:**
- React frontend with modern hooks
- Node.js/Express backend
- MongoDB for data storage
- Socket.io for real-time features
- Cloudinary for media management
- JWT authentication

Build a complete social media experience that rivals modern platforms.`
  },
  {
    id: 'project-management',
    title: 'Project Management Tool',
    description: 'Kanban-style project management with teams, tasks, and collaboration features',
    techStack: ['React', 'Redux', 'Node.js', 'PostgreSQL', 'Socket.io'],
    category: 'Productivity',
    tags: ['kanban', 'collaboration', 'tasks'],
    featured: true,
    order: 4,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxkYXNoYm9hcmR8ZW58MHx8fHwxNzU1NDA1Nzc2fDA&ixlib=rb-4.1.0&q=85',
    prompt: `Build a comprehensive project management tool:

**Project Management Features:**
- Kanban boards with drag-and-drop
- Task creation and assignment
- Project timelines and milestones
- Team collaboration tools
- File attachments and comments
- Time tracking and reporting

**Team Features:**
- User roles and permissions
- Team workspaces
- Real-time collaboration
- Notification system
- Activity feeds
- Integration capabilities

**Technical Implementation:**
- Redux for state management
- PostgreSQL for data persistence
- Socket.io for real-time updates
- Drag-and-drop functionality
- Responsive design
- API for third-party integrations

Create a powerful tool that teams love to use for managing their projects.`
  },
  {
    id: 'learning-platform',
    title: 'Online Learning Platform',
    description: 'Educational platform with courses, video streaming, progress tracking, and certificates',
    techStack: ['React', 'Next.js', 'Video.js', 'Prisma', 'Stripe'],
    category: 'Education',
    tags: ['education', 'video', 'certificates'],
    featured: false,
    order: 5,
    imageUrl: 'https://images.pexels.com/photos/39284/macbook-apple-imac-computer-39284.jpeg',
    prompt: `Create a comprehensive online learning platform:

**Learning Features:**
- Course catalog with categories
- Video lessons with playback controls
- Progress tracking and completion
- Quizzes and assessments
- Certificates and achievements
- Discussion forums and Q&A

**Instructor Tools:**
- Course creation and management
- Video upload and processing
- Student analytics and insights
- Grading and feedback tools
- Revenue tracking
- Marketing tools

**Technical Specifications:**
- Video.js for video playback
- Stripe for course payments
- Prisma ORM for database
- Search and filtering
- Mobile-responsive design
- SEO optimization

Build a platform that makes online learning engaging and effective.`
  },
  {
    id: 'crypto-tracker',
    title: 'Cryptocurrency Tracker',
    description: 'Real-time crypto portfolio tracker with price alerts and market analysis',
    techStack: ['React', 'TypeScript', 'Chart.js', 'CoinGecko API', 'TailwindCSS'],
    category: 'Finance',
    tags: ['crypto', 'portfolio', 'real-time'],
    featured: false,
    order: 6,
    imageUrl: 'https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxkYXNoYm9hcmR8ZW58MHx8fHwxNzU1NDA1Nzc2fDA&ixlib=rb-4.1.0&q=85',
    prompt: `Build a professional cryptocurrency tracking application:

**Portfolio Features:**
- Add and track crypto holdings
- Real-time price updates
- Portfolio performance analytics
- Profit/loss calculations
- Price alerts and notifications
- Market news and analysis

**Market Data:**
- Live price charts and indicators
- Market cap and volume data
- Top gainers and losers
- Historical price data
- Currency conversion tools
- Watchlist functionality

**Technical Implementation:**
- TypeScript for type safety
- CoinGecko API integration
- Chart.js for price charts
- Real-time data updates
- Local storage for portfolios
- Responsive mobile design

Create a powerful tool for crypto investors and traders.`
  }
];