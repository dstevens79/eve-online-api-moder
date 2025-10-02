# LMeve - EVE Online Corporation Management

LMeve is a comprehensive corporation management system for EVE Online, providing tools for managing members, assets, manufacturing, mining operations, and more.

## 🚀 Features

- **Member Management** - Track corporation members and roles
- **Asset Management** - Monitor corporation and personal assets
- **Manufacturing System** - Manage production jobs and assignments
- **Mining Operations** - Track mining activities and yields
- **Logistics** - Handle material movement and transportation
- **Killmail Analysis** - Review combat activities and losses
- **Market Analysis** - Monitor market trends and opportunities
- **Income Tracking** - Financial oversight and revenue management
- **ESI Integration** - Full EVE Online API integration
- **Multi-Database Support** - Local and remote database options

## 📚 Documentation

Complete documentation is available in the [`docs/`](docs/) directory:

- [`docs/implementation/`](docs/implementation/) - Technical implementation details
- [`docs/database/`](docs/database/) - Database setup and configuration
- [`docs/security/`](docs/security/) - Security policies and procedures
- [`docs/testing/`](docs/testing/) - Test results and validation
- [`docs/notifications/`](docs/notifications/) - Notification system documentation

For remote database setup, see [`docs/REMOTE_DATABASE_SETUP.md`](docs/REMOTE_DATABASE_SETUP.md).

## 🔧 Quick Start

1. **Local Development**: Default admin credentials are `admin` / `12345`
2. **ESI Authentication**: Configure ESI credentials in Settings for full EVE Online integration
3. **Database Setup**: Use the provided scripts in [`scripts/database/`](scripts/database/) for database initialization

## 🛠️ Development

This is a React-based application using:
- **Vite** - Build tool and development server
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Component library
- **React Query** - Data fetching and state management

## 🏗️ Architecture

The application supports multiple authentication methods:
- **Local Authentication** - Username/password for development
- **ESI SSO** - EVE Online Single Sign-On integration
- **Corporation Roles** - Automatic role assignment based on EVE corporation membership

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.