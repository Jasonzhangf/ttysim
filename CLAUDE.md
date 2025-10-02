# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains TTYSim - a virtual TTY client system with multi-device synchronization capabilities.

1. **TTYSim Core** - Virtual TTY client with dynamic resolution negotiation
2. **Electerm** - Terminal emulator foundation (optional desktop client)

The project aims to create a modern TTY session management system that provides Tmux-like functionality with real-time multi-device synchronization. The core innovation is **dynamic resolution negotiation** where the system automatically adjusts TTY resolution based on connected clients and reflows applications accordingly.

## Architecture

### Core Components

#### TTYSim Server Core
- **Resolution Negotiation Manager**: Dynamic resolution calculation and TTY reflow
- **Virtual TTY Engine**: PTY management with SIGWINCH handling
- **Display Sync Engine**: Real-time content broadcasting to all clients
- **Interaction Adapter**: Device-specific input handling and UI adaptation
- **Multi-client Session Management**: Dynamic client joining/leaving support

#### Client Applications
- **Web Client**: React + Xterm.js based browser interface
- **Mobile Client**: React Native with touch gestures and virtual keyboard
- **Desktop Client**: Electron-based (optional, using Electerm as foundation)
- **CLI Client**: Command-line interface for headless operation

### Key Features

- **Dynamic Resolution Negotiation**: Automatic TTY resizing based on minimum client resolution
- **Display Content Consistency**: All clients see identical TTY content
- **Device-Specific Interaction**: Optimized input methods for each platform
- **Real-time Synchronization**: WebSocket-based instant updates
- **Application Reflow**: Smart TTY application reformatting on resolution changes
- **Cross-platform Support**: Web, mobile, desktop, and CLI access

## Development Commands

### TTYSim Core Development

```bash
# Environment setup
npm install
cd packages/server && npm install
cd packages/web-client && npm install
cd packages/mobile-client && npm install

# Development workflow
npm run dev        # Start all services in development mode
npm run dev:server # Start TTYSim server only
npm run dev:web   # Start web client only
npm run dev:mobile # Start mobile client only

# Build
npm run build      # Build all packages
npm run build:server
npm run build:web
npm run build:mobile

# Testing
npm run test       # Run all tests
npm run test:server
npm run test:client
npm run test:integration

# Code quality
npm run lint       # ESLint check
npm run format     # Prettier formatting
npm run type-check # TypeScript type checking
```

### Electerm (Optional Desktop Client)

```bash
# Environment setup
cd electerm
npm install

# Development workflow
npm start         # Start Vite dev server (port 5570)
npm run app       # Run electron app

# Build
npm run b         # Build shortcut

# Testing
npm run test      # Run playwright tests
```

## Technical Implementation Details

### TTYSim Core Architecture

#### Resolution Negotiation System
- **Dynamic Resolution Calculation**: Automatic minimum resolution detection
- **TTY Application Reflow**: SIGWINCH signal handling and reflow completion detection
- **Client State Management**: Real-time client joining/leaving coordination
- **Resolution Change Propagation**: Seamless resolution transition handling

#### Virtual TTY Engine
- **PTY Management**: node-pty integration with process lifecycle control
- **Signal Handling**: SIGWINCH, SIGINT, SIGTERM proper forwarding
- **I/O Management**: Input/output buffering and streaming
- **Process Isolation**: Secure sandboxed TTY application execution

#### Multi-Client Synchronization
- **Display Content Broadcasting**: Identical content distribution to all clients
- **Input Coordination**: Conflict resolution and input serialization
- **State Consistency**: Real-time state validation and synchronization
- **Connection Management**: Robust WebSocket connection handling

#### Device-Specific Interaction Adapters
- **Mobile Adapter**: Touch gestures, virtual keyboard, device-specific UI
- **Desktop Adapter**: Keyboard shortcuts, mouse events, native integration
- **Web Adapter**: Browser-optimized interactions, responsive design
- **CLI Adapter**: Command-line interface with scriptable operations

### Session Management

- **Dynamic Sessions**: Resolution-adaptive TTY sessions
- **Multi-Device Support**: Simultaneous connections across platforms
- **State Persistence**: Session recovery and restoration
- **Collaborative Features**: Multi-user session sharing
- **Application Detection**: Smart TTY application type recognition

### Core Innovation: Display vs Interaction Separation

#### Display Layer (Identical Across All Clients)
- All clients receive exactly the same TTY content
- Resolution-based scaling for different screen sizes
- Consistent rendering of TTY applications
- Real-time content synchronization

#### Interaction Layer (Device-Specific)
- **Mobile**: Touch gestures, virtual keyboards, specialized buttons
- **Desktop**: Keyboard shortcuts, mouse interactions, native menus
- **Web**: Browser-optimized controls, responsive interfaces
- **CLI**: Command-line operations and scripting support

## Dependencies and Requirements

### TTYSim Core
- **Node.js 18+ (LTS)** required for server
- **TypeScript** for type-safe development
- **Socket.IO** for real-time WebSocket communication
- **node-pty** for pseudo-terminal management
- **Fastify** for high-performance web server
- **PostgreSQL** for persistent data storage
- **Redis** for caching and session state

### Client Applications
- **Web Client**: React 18 + TypeScript + Xterm.js
- **Mobile Client**: React Native + TypeScript
- **Desktop Client**: Electron (optional, based on Electerm)
- **CLI Client**: Node.js + Commander.js

## Key Development Patterns

- **Resolution Negotiation**: Dynamic multi-client resolution management
- **Display/Interaction Separation**: Consistent display, adaptive interaction
- **Event-Driven Architecture**: Async event handling and propagation
- **Adapter Pattern**: Device-specific interaction adaptation
- **State Synchronization**: Real-time multi-client state management
- **Monorepo Structure**: Shared code across multiple packages

## Development Phases

Based on `technical_solution.md`, the project will evolve through these phases:

1. **Phase 1 (Weeks 1-4)**: Core architecture and resolution negotiation system
2. **Phase 2 (Weeks 5-8)**: Multi-client development and interaction adapters
3. **Phase 3 (Weeks 9-12)**: Performance optimization and security features

## Core Innovation

The project's key innovation is the **dynamic resolution negotiation** system:
- **Single Client**: Uses that client's resolution
- **Multiple Clients**: Automatically uses minimum resolution
- **TTY Reflow**: Applications intelligently reformat on resolution changes
- **Display Consistency**: All clients see identical content
- **Interaction Adaptation**: Each device uses optimal interaction methods

## Security Considerations

- **Connection Security**: TLS encryption for all WebSocket communications
- **Session Isolation**: Secure multi-tenant session management
- **Input Validation**: Proper sanitization of all client inputs
- **Process Isolation**: Sandboxed TTY application execution
- **Access Control**: User authentication and authorization mechanisms

The codebase focuses on virtual TTY management and multi-device synchronization without containing any malicious functionality.