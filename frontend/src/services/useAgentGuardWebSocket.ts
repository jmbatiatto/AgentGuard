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
  type: 'NEW_APPROVAL' | 'RESOLVED_APPROVAL' | 'NEW_ALERT' | 'ALERT_STATUS_UPDATED' | 'NEW_EXECUTION' | 'PONG' | 'CONNECTED';
  timestamp?: string;
  data?: any;
}

export interface UseAgentGuardWebSocketOptions {
  orgId?: string;
  enabled?: boolean;
  onNewApproval?: (data: any) => void;
  onResolvedApproval?: (data: any) => void;
  onNewAlert?: (data: any) => void;
  onAlertUpdated?: (data: any) => void;
  onNewExecution?: (data: any) => void;
  onMessage?: (message: WebSocketEventMessage) => void;
}

export function useAgentGuardWebSocket({
  orgId = DEMO_IDS.ORG_ACME_ID,
  enabled = true,
  onNewApproval,
  onResolvedApproval,
  onNewAlert,
  onAlertUpdated,
  onNewExecution,
  onMessage,
}: UseAgentGuardWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEventMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);

  // Guardar referencias a callbacks para evitar reconexiones innecesarias ante re-renders
  const onNewApprovalRef = useRef(onNewApproval);
  const onResolvedApprovalRef = useRef(onResolvedApproval);
  const onNewAlertRef = useRef(onNewAlert);
  const onAlertUpdatedRef = useRef(onAlertUpdated);
  const onNewExecutionRef = useRef(onNewExecution);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onNewApprovalRef.current = onNewApproval;
    onResolvedApprovalRef.current = onResolvedApproval;
    onNewAlertRef.current = onNewAlert;
    onAlertUpdatedRef.current = onAlertUpdated;
    onNewExecutionRef.current = onNewExecution;
    onMessageRef.current = onMessage;
  });

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
          const raw = JSON.parse(event.data);
          const eventType = raw.type || raw.event;
          const eventData = raw.data || raw;

          const parsed: WebSocketEventMessage = {
            type: eventType,
            data: eventData,
            timestamp: raw.timestamp,
          };

          setLastEvent(parsed);

          if (onMessageRef.current) onMessageRef.current(parsed);

          if (eventType === 'NEW_EXECUTION' && onNewExecutionRef.current) {
            onNewExecutionRef.current(eventData);
          } else if (eventType === 'NEW_APPROVAL' && onNewApprovalRef.current) {
            onNewApprovalRef.current(eventData);
          } else if (eventType === 'RESOLVED_APPROVAL' && onResolvedApprovalRef.current) {
            onResolvedApprovalRef.current(eventData);
          } else if ((eventType === 'NEW_ALERT' || eventType === 'ALERT') && onNewAlertRef.current) {
            onNewAlertRef.current(eventData);
          } else if (eventType === 'ALERT_STATUS_UPDATED' && onAlertUpdatedRef.current) {
            onAlertUpdatedRef.current(eventData);
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
  }, [orgId, enabled]);

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
