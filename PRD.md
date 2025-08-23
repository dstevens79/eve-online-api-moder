# EVE Online API Explorer

A modern React-based tool for exploring and interacting with the EVE Online ESI (EVE Swagger Interface) API, providing an intuitive interface for developers and players to access game data.

**Experience Qualities**:
1. **Professional** - Clean, developer-focused interface that prioritizes functionality and data clarity
2. **Efficient** - Quick access to API endpoints with minimal clicks and fast response times
3. **Informative** - Rich data presentation with proper formatting and contextual information

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple API categories and endpoints to explore, request/response handling, authentication flow, and data persistence for favorites and history

## Essential Features

### API Endpoint Browser
- **Functionality**: Browse and search through all available EVE Online ESI endpoints organized by category
- **Purpose**: Allow users to discover and understand available API functionality
- **Trigger**: User navigates to the application or uses search functionality
- **Progression**: Landing page → Browse categories → Select endpoint → View documentation → Make request
- **Success criteria**: All ESI endpoints are categorized and searchable with clear documentation

### API Request Interface
- **Functionality**: Interactive form to configure and execute API requests with parameter inputs
- **Purpose**: Enable users to test API calls with real data and see formatted responses
- **Trigger**: User selects an API endpoint to test
- **Progression**: Select endpoint → Fill parameters → Execute request → View formatted response → Save/share
- **Success criteria**: Successful API calls with properly formatted JSON responses and error handling

### Authentication Management
- **Functionality**: Handle EVE Online SSO authentication flow for authenticated endpoints
- **Purpose**: Allow access to character-specific and corporation data
- **Trigger**: User attempts to access an authenticated endpoint
- **Progression**: Request auth → Redirect to EVE SSO → Handle callback → Store token → Make authenticated requests
- **Success criteria**: Seamless OAuth flow with secure token storage and automatic refresh

### Response Data Viewer
- **Functionality**: Pretty-printed JSON responses with syntax highlighting and data exploration
- **Purpose**: Make API responses easy to read and understand
- **Trigger**: API request completes successfully
- **Progression**: Request completes → Format response → Display with highlighting → Allow data exploration
- **Success criteria**: Readable, searchable JSON with proper formatting and type information

### Request History & Favorites
- **Functionality**: Save frequently used endpoints and view request history
- **Purpose**: Improve workflow efficiency for developers and power users
- **Trigger**: User marks endpoint as favorite or views history panel
- **Progression**: Make request → Auto-save to history → Option to favorite → Quick access from sidebar
- **Success criteria**: Persistent storage of favorites and history with quick access

## Edge Case Handling

- **Rate Limiting**: Display clear messages when hitting ESI rate limits with retry suggestions
- **Network Errors**: Graceful handling of connectivity issues with retry mechanisms
- **Invalid Parameters**: Real-time validation of required parameters before request submission
- **Token Expiration**: Automatic token refresh or clear re-authentication prompts
- **Large Responses**: Pagination or truncation of very large API responses
- **CORS Issues**: Clear messaging about browser limitations and potential solutions

## Design Direction

The design should feel professional and developer-focused like Postman or Swagger UI, with a clean interface that prioritizes data readability and efficient workflows. Minimal interface approach serves the core purpose of API exploration and testing.

## Color Selection

Complementary color scheme with blue and orange accents to create visual distinction between different interface areas while maintaining professional appearance.

- **Primary Color**: Deep Blue (oklch(0.45 0.15 250)) - Communicates trust and professionalism for primary actions
- **Secondary Colors**: Light Gray (oklch(0.95 0.02 250)) for backgrounds, Medium Gray (oklch(0.7 0.05 250)) for secondary elements
- **Accent Color**: Warm Orange (oklch(0.65 0.15 45)) - Attention-grabbing highlight for CTAs and important status indicators
- **Foreground/Background Pairings**: 
  - Background (Light Gray): Dark Gray text (oklch(0.2 0.02 250)) - Ratio 12.5:1 ✓
  - Card (White): Dark Gray text (oklch(0.2 0.02 250)) - Ratio 15.8:1 ✓
  - Primary (Deep Blue): White text (oklch(0.98 0.02 250)) - Ratio 8.2:1 ✓
  - Secondary (Light Gray): Dark Gray text (oklch(0.2 0.02 250)) - Ratio 12.5:1 ✓
  - Accent (Warm Orange): White text (oklch(0.98 0.02 250)) - Ratio 6.1:1 ✓

## Font Selection

Inter typeface should convey clarity and technical precision, perfect for displaying code, data, and API documentation with excellent readability at all sizes.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter Semibold/24px/normal spacing  
  - H3 (Endpoint Names): Inter Medium/18px/normal spacing
  - Body (Documentation): Inter Regular/16px/relaxed line height
  - Code (JSON/Parameters): JetBrains Mono Regular/14px/monospace spacing
  - Labels (Form Fields): Inter Medium/14px/normal spacing

## Animations

Subtle functionality-focused animations that communicate state changes and guide user attention without feeling flashy or distracting from the technical content.

- **Purposeful Meaning**: Smooth transitions communicate data loading states and form the professional, polished tool aesthetic
- **Hierarchy of Movement**: API response areas deserve primary animation focus, with secondary attention to navigation state changes

## Component Selection

- **Components**: Cards for endpoint groups and responses, Tabs for organizing API categories, Forms for parameter input, Dialog for authentication flow, Accordion for collapsible documentation sections, Tables for structured data display, Code blocks with syntax highlighting
- **Customizations**: Custom JSON viewer component with collapsible sections, Custom request builder with dynamic parameter forms, Enhanced syntax highlighting for different data types
- **States**: Buttons show loading spinners during requests, Form inputs highlight validation errors, Response areas show loading skeletons, Authentication status visible in header
- **Icon Selection**: External link icons for API documentation, Play button for request execution, Star icons for favorites, History clock icon, Authentication shield icon
- **Spacing**: Consistent 4-unit spacing (16px) between major sections, 2-unit (8px) for related elements, 6-unit (24px) for page margins
- **Mobile**: Stack horizontal layouts vertically, Collapse sidebar into drawer, Ensure touch-friendly button sizes, Responsive table scrolling for large API responses