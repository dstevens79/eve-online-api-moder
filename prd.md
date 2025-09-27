# LMeve - EVE Online Corporation Management Tool

## Core Purpose & Success
- **Mission Statement**: A comprehensive web-based corporation management tool for EVE Online that helps CEOs and directors manage member assets, manufacturing, mining operations, and corporation logistics efficiently, while providing integrated API exploration capabilities for advanced users.
- **Success Indicators**: Reduced time spent on manual corporation management tasks, improved member engagement tracking, streamlined asset and production oversight, enhanced API integration capabilities.
- **Experience Qualities**: Professional, efficient, comprehensive - feels like a serious business management tool for virtual corporations with developer-grade API capabilities.

## Project Classification & Approach
- **Complexity Level**: Complex Application (advanced functionality, multiple data views, corporation management features, integrated API tools)
- **Primary User Activity**: Managing - CEOs and directors actively managing corporation operations, with secondary support for API exploration and custom integrations.

## Essential Features

### Corporation Management Core

#### Tabbed Interface
- **Functionality**: Core navigation between different management areas (Members, Assets, Manufacturing, Mining, API Tools, etc.)
- **Purpose**: Organize complex corporation data into manageable sections
- **Success criteria**: Intuitive navigation with persistent state across sessions

#### Member Management
- **Functionality**: Track corporation members, their assets, activities, and contributions
- **Purpose**: Monitor member engagement and asset allocation
- **Success criteria**: Real-time member data with activity tracking and contribution metrics

#### Asset Tracking
- **Functionality**: Monitor corporation and member assets across different locations and types with live EVE data
- **Purpose**: Maintain oversight of corporation resources and member holdings
- **Success criteria**: Comprehensive asset overview with location tracking and value calculations

#### Manufacturing Job Scheduling
- **Functionality**: Real-time tracking of active manufacturing jobs with progress monitoring, pause/resume capabilities, and completion alerts
- **Purpose**: Optimize production workflows and resource allocation
- **Success criteria**: Live job tracking with automated alerts and scheduling tools

#### Blueprint Management
- **Functionality**: Comprehensive blueprint library with research levels, material efficiency tracking, and production planning
- **Purpose**: Maximize production efficiency and track blueprint investments
- **Success criteria**: Complete blueprint database with research progress and efficiency metrics

#### Production Planning
- **Functionality**: Advanced planning tools for creating production schedules, cost analysis, and profit estimation
- **Purpose**: Strategic planning for manufacturing operations
- **Success criteria**: Accurate cost/profit analysis with scheduling optimization

#### Mining Operations
- **Functionality**: Monitor mining activities, ore processing, and resource allocation
- **Purpose**: Track and optimize mining fleet operations
- **Success criteria**: Real-time mining metrics with efficiency tracking

### Integrated API Tools

#### API Endpoint Browser
- **Functionality**: Browse and search through EVE Online ESI endpoints organized by category, integrated within corporation management workflows
- **Purpose**: Allow advanced users to explore additional API functionality and customize data retrieval
- **Success criteria**: ESI endpoints accessible within corporation management context with clear documentation

#### Custom API Integration
- **Functionality**: Configure and execute custom API requests for specialized corporation data needs
- **Purpose**: Enable advanced users to extend corporation management capabilities
- **Success criteria**: Successful custom API integration with corporation data workflows

#### Enhanced Authentication Management
- **Functionality**: Handle EVE Online SSO authentication flow for both standard corporation features and custom API access
- **Purpose**: Provide seamless access to all corporation and character-specific data
- **Success criteria**: Unified authentication supporting both core features and API exploration

#### Advanced Data Viewer
- **Functionality**: Enhanced data presentation with JSON viewing, syntax highlighting, and data export capabilities
- **Purpose**: Support both standard corporation reporting and custom data analysis
- **Success criteria**: Flexible data presentation supporting various corporation management needs

### System Features

#### Real-time Data Dashboard
- **Functionality**: Live connection status, API health monitoring, and automatic data refresh capabilities
- **Purpose**: Ensure data accuracy and system reliability across all features
- **Success criteria**: Reliable API integration with clear status indicators for all data sources

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Professional confidence, data-driven decision making, corporate efficiency with technical precision
- **Design Personality**: Clean, professional, data-focused enterprise software with subtle developer tool aesthetics
- **Visual Metaphors**: Corporate dashboards with technical precision elements, space/sci-fi elements from EVE
- **Complexity Balance**: Rich corporation management interface with integrated but non-intrusive technical tools

### Unified Color Strategy
- **Primary Color**: Deep space blue (#1a365d) - corporate stability and trust
- **Secondary Colors**: Steel grays (#2d3748, #4a5568) for data containers and technical elements
- **Accent Color**: EVE Online orange (#f56500) for important actions and alerts
- **Technical Accent**: Warm orange (oklch(0.65 0.15 45)) for API-related features and technical highlights
- **Background Palette**: 
  - Light gray backgrounds for main content areas
  - Darker themes for technical/API sections
  - High contrast ratios maintained throughout (WCAG AA compliance)

### Typography System
- **Primary**: Inter for all UI text, headers, and general content
- **Technical**: JetBrains Mono for data, numbers, code, and API responses
- **Hierarchy**: 
  - H1 (Page Title): Inter Bold/32px
  - H2 (Section Headers): Inter Semibold/24px
  - H3 (Feature Names): Inter Medium/18px
  - Body: Inter Regular/16px
  - Data/Code: JetBrains Mono Regular/14px
- **Focus**: Balance between corporate clarity and technical precision

### Component Selection & Layout
- **Navigation**: Tabbed interface with expandable technical sections
- **Data Display**: Tables for corporation data, enhanced viewers for API responses
- **Cards**: Metric summaries and feature groupings
- **Forms**: Parameter inputs with validation for both corp management and API features
- **States**: Unified loading, error, and success states across all features
- **Mobile**: Responsive design prioritizing core corporation features, with technical tools accessible but streamlined

### Animation Strategy
- **Corporate Features**: Smooth, professional transitions focused on data workflows
- **Technical Features**: Subtle state changes that don't interfere with technical work
- **Integration Points**: Gentle transitions between corporation management and API tool contexts

## Edge Case Handling
- **Large Data Sets**: Pagination and virtualization for performance across all features
- **API Rate Limiting**: Intelligent request queuing affecting both corp data and custom requests
- **Network Issues**: Graceful degradation with clear distinction between corp features and API tools
- **Authentication**: Unified error handling for both corporation access and technical API permissions
- **Mixed User Types**: Clear progressive disclosure - corp managers see management features prominently, technical users can access advanced tools

## Implementation Considerations
- **Architecture**: Core corporation management with pluggable API exploration modules
- **Data Flow**: Unified data layer supporting both corporation management and custom API integration
- **User Experience**: Primary focus on corporation management with optional technical enhancement
- **Performance**: Optimized for corporation management workflows, with API tools designed to not impact core performance