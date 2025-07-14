<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# React Mobile App with Tailwind CSS and Firebase

This is a React mobile application built with:

- **React 18** with Vite for fast development
- **Tailwind CSS** for utility-first styling and mobile-responsive design
- **Firebase** for backend services (authentication, database, storage)

## Development Guidelines

### Mobile-First Design

- Always design for mobile devices first, then scale up for larger screens
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Consider touch interactions and finger-friendly button sizes (minimum 44px)
- Use safe area insets for devices with notches: `pt-safe-top`, `pb-safe-bottom`

### Tailwind CSS Patterns

- Use utility classes for consistent spacing, colors, and typography
- Leverage Tailwind's color palette and spacing scale
- Use `flex`, `grid`, and responsive utilities for layouts
- Apply `transition-` classes for smooth animations
- Use `hover:` and `active:` states for interactive elements

### Firebase Integration

- Import Firebase services from `src/firebase.js`
- Use Firebase Auth for user authentication
- Use Firestore for real-time database operations
- Use Firebase Storage for file uploads
- Follow Firebase v9+ modular SDK patterns

### Component Structure

- Create reusable components in `src/components/`
- Use functional components with hooks
- Implement proper loading and error states
- Make components accessible with proper ARIA attributes

### Performance Considerations

- Lazy load components and routes when appropriate
- Optimize images and use appropriate formats
- Minimize bundle size by importing only needed Firebase services
- Use React.memo for expensive component re-renders

### Code Style

- Use semantic HTML elements
- Follow React best practices for state management
- Implement proper error boundaries
- Use TypeScript for better type safety (if converting from JS)
