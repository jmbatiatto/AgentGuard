/**
 * Hook de React para la Conexión WebSocket en Tiempo Real con AgentGuard.
 * 
 * Gestiona:
 * - Ciclo de vida de conexión con /api/v1/ws (o /api/v1/ws/{org_id})
 * - Reintento automático con backoff exponencial si la conexión se cae
 * - Heartbeat PING/PONG cada 25 segundos
 * - Despacho de eventos: NEW_APPROVAL, RESOLVED_APPROVAL, NEW_ALERT
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { DEMO_IDS } from './api';

export interface WebSocketEventMessage {
  type: 'NEW_APPROVAL' | 'RESOLVED_APPROVAL' | 'NEW_ALERT' | 'NEW_EXECUTION' | 'PONG' | 'CONNECTED';
  timestamp?: string;
  data?: any;
}

export interface UseAgentGuardWebSocketOptions {
  orgId?: string;
  enabled?: boolean;
  onNewApproval?: (data: any) => void;
  onResolvedApproval?: (data: any) => void;
  onNewAlert?: (data: any) => void;
  onNewExecution?: (data: any) => void;
  onMessage?: (message: WebSocketEventMessage) => void;
}

export function useAgentGuardWebSocket({
  orgId = DEMO_IDS.ORG_ACME_ID,
  enabled = true,
  onNewApproval,
  onResolvedApproval,
  onNewAlert,
  onNewExecution,
  onMessage,
}: UseAgentGuardWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEventMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Calcular WebSocket URL
    const isHttps = window.location.protocol === 'https:';
    const wsProto = isHttps ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsHost = import.meta.env.VITE_WS_URL || `${wsProto}//${host}:8000`;
    const url = `${wsHost}/api/v1/ws/${orgId}`;

    try {
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Iniciar Heartbeat PING cada 25 segundos
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const parsed: WebSocketEventMessage = JSON.parse(event.data);
          setLastEvent(parsed);

          if (onMessage) onMessage(parsed);

          if (parsed.type === 'NEW_EXECUTION' && onNewExecution) {
            onNewExecution(parsed.data);
          } else if (parsed.type === 'NEW_APPROVAL' && onNewApproval) {
            onNewApproval(parsed.data);
          } else if (parsed.type === 'RESOLVED_APPROVAL' && onResolvedApproval) {
            onResolvedApproval(parsed.data);
          } else if (parsed.type === 'NEW_ALERT' && onNewAlert) {
            onNewAlert(parsed.data);
          }
        } catch {
          // Ignorar mensajes no JSON
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Reintento con backoff exponencial (máx 15s)
        if (enabled) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 15000);
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setIsConnected(false);
    }
  }, [orgId, enabled, onNewApproval, onResolvedApproval, onNewAlert, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  return {
    isConnected,
    lastEvent,
    sendMessage,
    reconnect: connect,
  };
}
