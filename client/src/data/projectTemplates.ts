export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  prompt: string;
  imageUrl?: string;
  category: string;
  featured: boolean;
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: '1',
    title: 'E-commerce Store',
    description: 'Full-featured online store with payment integration, inventory management, and customer accounts.',
    techStack: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    prompt: 'Create a modern e-commerce platform with the following features: user authentication and profiles, product catalog with categories and search, shopping cart functionality, secure payment processing with Stripe, order management system, inventory tracking, admin dashboard for managing products and orders, responsive design for mobile and desktop, email notifications for orders, customer reviews and ratings system, and wishlist functionality. Include proper SEO optimization and loading states.',
    imageUrl: '/templates/ecommerce.jpg',
    category: 'E-commerce',
    featured: true
  },
  {
    id: '2',
    title: 'Social Media Dashboard',
    description: 'Analytics dashboard for managing multiple social media accounts with scheduling and reporting.',
    techStack: ['Next.js', 'TypeScript', 'D3.js', 'Redis'],
    prompt: 'Build a comprehensive social media management dashboard that includes: multi-platform account integration (Twitter, Facebook, Instagram, LinkedIn), post scheduling and automation, analytics and performance tracking with interactive charts, content calendar with drag-and-drop functionality, team collaboration features, hashtag research tools, competitor analysis, real-time notifications, bulk content management, custom reporting with PDF exports, and dark/light theme support. Ensure responsive design and fast data visualization.',
    imageUrl: '/templates/social-dashboard.jpg',
    category: 'Analytics',
    featured: true
  },
  {
    id: '3',
    title: 'Task Management App',
    description: 'Collaborative project management tool with kanban boards, time tracking, and team features.',
    techStack: ['Vue.js', 'Express', 'MongoDB', 'WebSocket'],
    prompt: 'Create a powerful task management application featuring: kanban-style boards with drag-and-drop functionality, project and task hierarchies, team collaboration with real-time updates, time tracking and reporting, deadline management with notifications, file attachments and comments, user roles and permissions, activity timeline and audit logs, custom fields and labels, search and filtering capabilities, calendar integration, mobile-responsive design, and data export functionality. Include dark mode and customizable workflows.',
    imageUrl: '/templates/task-management.jpg',
    category: 'Productivity',
    featured: true
  },
  {
    id: '4',
    title: 'Learning Management System',
    description: 'Complete online education platform with courses, quizzes, and student tracking.',
    techStack: ['React', 'Node.js', 'MongoDB', 'Video.js'],
    prompt: 'Develop a comprehensive learning management system with: course creation and management tools, video streaming with playback controls, interactive quizzes and assessments, student progress tracking, gradebook and reporting, discussion forums and messaging, calendar and scheduling, certificate generation, payment integration for course purchases, multi-language support, mobile app compatibility, instructor dashboard, student portfolios, and advanced analytics. Ensure accessibility compliance and offline content support.',
    imageUrl: '/templates/lms.jpg',
    category: 'Education',
    featured: false
  },
  {
    id: '5',
    title: 'Fitness Tracking App',
    description: 'Personal fitness companion with workout plans, nutrition tracking, and progress analytics.',
    techStack: ['React Native', 'Firebase', 'Chart.js', 'Stripe'],
    prompt: 'Build a comprehensive fitness tracking application that includes: personalized workout plan generator, exercise library with video demonstrations, nutrition tracking with barcode scanning, progress monitoring with visual charts, social features for sharing achievements, wearable device integration, meal planning and recipes, goal setting and milestone tracking, personal trainer booking system, community challenges, premium subscription features, offline workout mode, and health data synchronization. Include calorie calculator and macro tracking.',
    imageUrl: '/templates/fitness.jpg',
    category: 'Health & Fitness',
    featured: false
  },
  {
    id: '6',
    title: 'Real Estate Platform',
    description: 'Property listing and management platform with virtual tours and mortgage calculators.',
    techStack: ['Next.js', 'PostgreSQL', 'MapBox', 'AWS S3'],
    prompt: 'Create a modern real estate platform featuring: property listing management with high-quality image galleries, advanced search with filters (location, price, type, features), interactive maps with neighborhood information, virtual tour integration, mortgage calculator and financing tools, agent profiles and contact system, saved searches and favorites, property comparison tool, market analytics and trends, CRM for real estate agents, lead management system, email automation, mobile-first responsive design, and SEO optimization for property pages.',
    imageUrl: '/templates/real-estate.jpg',
    category: 'Real Estate',
    featured: false
  },
  {
    id: '7',
    title: 'Recipe & Meal Planning',
    description: 'Culinary platform with recipe sharing, meal planning, and grocery list generation.',
    techStack: ['React', 'Node.js', 'MongoDB', 'Cloudinary'],
    prompt: 'Develop a comprehensive recipe and meal planning platform with: recipe creation and sharing with photo uploads, ingredient substitution suggestions, automated grocery list generation, weekly meal planning calendar, nutritional information and dietary filtering, cooking timers and step-by-step instructions, user recipe collections and favorites, social features for rating and reviewing recipes, ingredient inventory tracking, cost calculation per meal, meal prep scheduling, and integration with grocery delivery services. Include barcode scanning for pantry management.',
    imageUrl: '/templates/recipe.jpg',
    category: 'Food & Beverage',
    featured: false
  },
  {
    id: '8',
    title: 'Event Management System',
    description: 'Complete event planning platform with ticketing, attendee management, and analytics.',
    techStack: ['Vue.js', 'Laravel', 'MySQL', 'Stripe'],
    prompt: 'Build a full-featured event management system including: event creation with detailed information and media, ticketing system with multiple ticket types and pricing, attendee registration and check-in, payment processing with refund management, email marketing and communication tools, event analytics and reporting, venue management with capacity tracking, speaker and agenda management, networking features for attendees, mobile event app, QR code generation for tickets, waitlist management, and post-event feedback collection. Support for virtual and hybrid events.',
    imageUrl: '/templates/event.jpg',
    category: 'Events',
    featured: false
  },
  {
    id: '9',
    title: 'Cryptocurrency Tracker',
    description: 'Real-time crypto portfolio tracking with news, alerts, and advanced analytics.',
    techStack: ['React', 'Node.js', 'WebSocket', 'Chart.js'],
    prompt: 'Create a sophisticated cryptocurrency tracking platform with: real-time price monitoring and portfolio tracking, price alerts and notifications, advanced charting with technical indicators, news aggregation and sentiment analysis, DeFi integration and yield farming tracking, NFT collection management, tax reporting and transaction history, market analysis and trends, social sentiment tracking, automated trading signals, multi-exchange API integration, security features with 2FA, dark mode interface, and mobile companion app. Include P&L calculations and performance analytics.',
    imageUrl: '/templates/crypto.jpg',
    category: 'Finance',
    featured: true
  },
  {
    id: '10',
    title: 'Booking & Appointment System',
    description: 'Flexible scheduling platform for service businesses with calendar management and payments.',
    techStack: ['React', 'Express', 'PostgreSQL', 'Stripe'],
    prompt: 'Develop a comprehensive booking and appointment system featuring: flexible scheduling with availability management, service catalog with pricing and duration, customer booking portal with account management, automated email and SMS reminders, payment processing and invoicing, staff management and calendar sync, resource and room booking, waitlist and cancellation management, reporting and analytics dashboard, multi-location support, integration with Google Calendar and Outlook, custom booking forms, and API for third-party integrations. Include no-show tracking and loyalty programs.',
    imageUrl: '/templates/booking.jpg',
    category: 'Business',
    featured: false
  },
  {
    id: '11',
    title: 'Content Management Blog',
    description: 'Modern blogging platform with SEO optimization, analytics, and monetization features.',
    techStack: ['Next.js', 'Strapi', 'PostgreSQL', 'Algolia'],
    prompt: 'Build a powerful content management and blogging platform with: rich text editor with media embedding, SEO optimization tools and meta management, content scheduling and draft management, multi-author support with role-based permissions, commenting system with moderation, newsletter integration and email marketing, social media auto-posting, analytics and performance tracking, monetization with ads and subscriptions, content categorization and tagging, advanced search functionality, mobile-responsive design, and AMP support. Include content migration tools and backup systems.',
    imageUrl: '/templates/blog.jpg',
    category: 'Content',
    featured: false
  },
  {
    id: '12',
    title: 'Inventory Management',
    description: 'Enterprise inventory tracking system with barcode scanning and supply chain management.',
    techStack: ['Angular', 'Spring Boot', 'PostgreSQL', 'Redis'],
    prompt: 'Create a comprehensive inventory management system including: product catalog with variants and specifications, barcode scanning and QR code generation, stock level tracking with low-stock alerts, purchase order management and supplier integration, warehouse management with location tracking, inventory valuation and costing methods, reporting and analytics dashboard, multi-location inventory tracking, asset management and depreciation, integration with accounting systems, mobile app for warehouse staff, batch and serial number tracking, and automated reorder points. Support for dropshipping and third-party fulfillment.',
    imageUrl: '/templates/inventory.jpg',
    category: 'Business',
    featured: false
  },
  {
    id: '13',
    title: 'Customer Support Portal',
    description: 'Comprehensive help desk solution with ticketing, knowledge base, and live chat.',
    techStack: ['React', 'Node.js', 'MongoDB', 'WebSocket'],
    prompt: 'Develop a full-featured customer support platform with: ticketing system with priority and category management, knowledge base with search functionality, live chat with agent routing, email integration and auto-responses, customer portal for ticket tracking, agent dashboard with performance metrics, SLA management and escalation rules, canned responses and templates, file attachment support, integration with CRM systems, reporting and analytics, customer satisfaction surveys, multi-channel support (email, chat, phone), and AI-powered suggested responses. Include workflow automation and chatbot integration.',
    imageUrl: '/templates/support.jpg',
    category: 'Customer Service',
    featured: false
  },
  {
    id: '14',
    title: 'Food Delivery App',
    description: 'Multi-restaurant delivery platform with real-time tracking and payment processing.',
    techStack: ['React Native', 'Node.js', 'MongoDB', 'Socket.io'],
    prompt: 'Build a comprehensive food delivery platform featuring: restaurant onboarding and menu management, customer ordering with customization options, real-time order tracking with GPS integration, delivery driver app with route optimization, payment processing with multiple options, rating and review system, promotional codes and loyalty programs, admin dashboard for platform management, real-time notifications and updates, order history and reordering, dietary filters and allergen information, estimated delivery times, and integration with third-party delivery services. Include surge pricing and dynamic delivery fees.',
    imageUrl: '/templates/food-delivery.jpg',
    category: 'Food & Beverage',
    featured: true
  },
  {
    id: '15',
    title: 'Video Streaming Platform',
    description: 'Netflix-like streaming service with content management, user profiles, and recommendation engine.',
    techStack: ['React', 'Node.js', 'FFmpeg', 'AWS S3'],
    prompt: 'Create a comprehensive video streaming platform with: video upload and transcoding pipeline, content management system with metadata, user authentication and profile management, subscription billing and payment processing, video player with adaptive bitrate streaming, search and discovery with advanced filters, personalized recommendation engine, watchlist and viewing history, social features for sharing and rating, content categorization and genre management, admin dashboard for content moderation, analytics and viewing statistics, mobile and TV app compatibility, offline download capability, and multi-language subtitle support. Include parental controls and content restrictions.',
    imageUrl: '/templates/streaming.jpg',
    category: 'Entertainment',
    featured: true
  }
];