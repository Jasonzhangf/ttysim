# TTYSim - Virtual TTY Client System

<div align="center">

![TTYSim Logo](https://via.placeholder.com/200x80/4A90E2/FFFFFF?text=TTYSim)

**A modern virtual TTY client system with multi-device synchronization**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-blue)](https://www.typescriptlang.org/)

</div>

## 🚀 What is TTYSim?

TTYSim is a virtual TTY client system that provides **Tmux-like functionality** with **real-time multi-device synchronization**. Our core innovation is **dynamic resolution negotiation** that automatically adjusts TTY resolution based on connected clients.

### ✨ Key Features

- **🔄 Dynamic Resolution Negotiation**: Automatically adjusts TTY resolution based on minimum client resolution
- **📱 Multi-Device Support**: Web, mobile, desktop, and CLI access
- **🎯 Display Content Consistency**: All clients see identical TTY content
- **⌨️ Device-Specific Interaction**: Optimized input methods for each platform
- **⚡ Real-time Synchronization**: WebSocket-based instant updates
- **🛠️ Application Reflow**: Smart TTY application reformatting on resolution changes

## 🏗️ Architecture

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Web Client    │  Mobile Client  │ Desktop Client  │
│  (React/Xterm)  │ (React Native)  │  (Electron)     │
└─────────────────┴─────────────────┴─────────────────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                         │
              WebSocket Real-time Communication
                         │
              ┌─────────────────────┐
              │   TTYSim Server     │
              │ Resolution Manager  │
              │  Virtual TTY Engine │
              │ Display Sync Engine │
              └─────────────────────┘
```

## 🚦 Resolution Negotiation Strategy

| Client Count | Resolution Strategy | Example |
|---------------|---------------------|---------|
| 1 Client | Use that client's resolution | PC (120x30) → TTY: 120x30 |
| Multiple Clients | Use minimum resolution | PC + Mobile → TTY: 40x15 |
| Client Leaves | Recalculate and reflow | Mobile leaves → TTY: 120x30 |

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Fastify
- **WebSocket**: Socket.IO
- **PTY Management**: node-pty
- **Database**: PostgreSQL + Redis
- **Language**: TypeScript

### Frontend
- **Web**: React 18 + TypeScript + Xterm.js
- **Mobile**: React Native + TypeScript
- **Desktop**: Electron (based on Electerm)
- **CLI**: Node.js + Commander.js

## 📦 Project Structure

```
ttysim/
├── packages/
│   ├── server/              # TTYSim server core
│   ├── web-client/          # React web client
│   ├── mobile-client/       # React Native client
│   └── shared/              # Shared packages
│       ├── types/          # TypeScript types
│       ├── utils/          # Utility functions
│       └── constants/      # Shared constants
├── docs/                    # Documentation
├── tests/                   # Test files
└── scripts/                 # Build and utility scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation
```bash
# Clone the repository
git clone https://github.com/Jasonzhangf/ttysim.git
cd ttysim

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development
```bash
# Start all services in development mode
pnpm dev

# Start individual services
pnpm dev:server    # TTYSim server
pnpm dev:web       # Web client
pnpm dev:mobile    # Mobile client
```

### Testing
```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test:server
pnpm test:client
```

## 📖 Documentation

- [Technical Solution](./technical_solution.md) - Detailed technical architecture
- [Development Guide](./CLAUDE.md) - Development instructions and patterns
- [Task Progress](./TASK.md) - Development task tracking

## 🗺️ Roadmap

### Phase 1: Core Architecture (Weeks 1-4)
- [x] Project initialization and basic framework
- [x] Virtual TTY engine development
- [x] Resolution negotiation system
- [x] Multi-client support

### Phase 2: Client Development (Weeks 5-8)
- [ ] Web client development
- [ ] Mobile client adaptation
- [ ] Desktop client integration
- [ ] CLI client

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] Interaction adaptation optimization
- [ ] Performance optimization
- [ ] Security mechanisms
- [ ] Testing and release

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](./CLAUDE.md) for detailed instructions.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by Tmux and other terminal multiplexers
- Powered by the amazing open-source community

---

<div align="center">

Made with ❤️ for seamless terminal session management

</div>