import React, { useState, useEffect, useCallback } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { socketService } from './services/socket-service';
import 'xterm/css/xterm.css';

function App() {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState('demo-session');
  const [inputSessionId, setInputSessionId] = useState('demo-session');

  useEffect(() => {
    // Initialize terminal
    const term = new Terminal({
      cols: 80,
      rows: 24,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      fontSize: 14,
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(document.getElementById('terminal')!);
    fitAddon.fit();

    // Handle terminal resize
    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    // Setup terminal data handler
    term.onData((data) => {
      if (isConnected) {
        socketService.sendInput(data);
      }
    });

    setTerminal(term);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [isConnected]);

  useEffect(() => {
    // Setup WebSocket message handlers
    const handleTTYOutput = (event: CustomEvent) => {
      const message = event.detail;
      if (terminal && message.data.output) {
        terminal.write(message.data.output);
      }
    };

    const handleSessionSync = (event: CustomEvent) => {
      console.log('Session synced:', event.detail);
    };

    const handleClientJoin = (event: CustomEvent) => {
      console.log('Client joined:', event.detail);
    };

    const handleClientLeave = (event: CustomEvent) => {
      console.log('Client left:', event.detail);
    };

    const handleResolutionChange = (event: CustomEvent) => {
      console.log('Resolution changed:', event.detail);
    };

    window.addEventListener('ttysim:tty_output', handleTTYOutput as EventListener);
    window.addEventListener('ttysim:session_sync', handleSessionSync as EventListener);
    window.addEventListener('ttysim:client_join', handleClientJoin as EventListener);
    window.addEventListener('ttysim:client_leave', handleClientLeave as EventListener);
    window.addEventListener('ttysim:resolution_change', handleResolutionChange as EventListener);

    return () => {
      window.removeEventListener('ttysim:tty_output', handleTTYOutput as EventListener);
      window.removeEventListener('ttysim:session_sync', handleSessionSync as EventListener);
      window.removeEventListener('ttysim:client_join', handleClientJoin as EventListener);
      window.removeEventListener('ttysim:client_leave', handleClientLeave as EventListener);
      window.removeEventListener('ttysim:resolution_change', handleResolutionChange as EventListener);
    };
  }, [terminal]);

  const handleConnect = useCallback(async () => {
    try {
      await socketService.connect();
      setIsConnected(true);

      // Join session with web client type
      socketService.joinSession(inputSessionId, 'web', {
        cols: 80,
        rows: 24,
      });

      setSessionId(inputSessionId);

      if (terminal) {
        terminal.clear();
        terminal.writeln('\x1b[32m✓ Connected to TTYSim server\x1b[0m');
        terminal.writeln(`\x1b[36mSession: ${inputSessionId}\x1b[0m`);
        terminal.writeln('');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      if (terminal) {
        terminal.writeln(`\x1b[31m✗ Connection failed: ${error}\x1b[0m`);
      }
    }
  }, [inputSessionId, terminal]);

  const handleDisconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setSessionId('');

    if (terminal) {
      terminal.clear();
      terminal.writeln('\x1b[33mDisconnected from TTYSim server\x1b[0m');
    }
  }, [terminal]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e' }}>
      <div style={{
        padding: '1rem',
        backgroundColor: '#2d2d2d',
        borderBottom: '1px solid #444',
        color: '#d4d4d4'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#4fc3f7' }}>TTYSim Web Client</h1>
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            value={inputSessionId}
            onChange={(e) => setInputSessionId(e.target.value)}
            placeholder="Session ID"
            disabled={isConnected}
            style={{
              padding: '0.5rem',
              backgroundColor: '#1e1e1e',
              border: '1px solid #555',
              color: '#d4d4d4',
              borderRadius: '4px',
            }}
          />
          <button
            onClick={isConnected ? handleDisconnect : handleConnect}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isConnected ? '#f44336' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
          <span style={{
            color: isConnected ? '#4caf50' : '#f44336',
            fontSize: '0.9rem'
          }}>
            {isConnected ? `● Connected (${sessionId})` : '○ Disconnected'}
          </span>
        </div>
      </div>
      <div
        id="terminal"
        style={{
          flex: 1,
          padding: '1rem',
          backgroundColor: '#1e1e1e',
        }}
      />
    </div>
  );
}

export default App;