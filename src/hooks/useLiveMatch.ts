import { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export interface LiveMatchUpdate {
  eventId: number;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  currentMinute?: number;
  status?: string;
  updatedAt: string;
  recentIncidents: {
    type?: string;
    time?: number;
    player?: string;
    team?: string;
    incidentClass?: string;
  }[];
}

const HUB_URL = `${import.meta.env.VITE_API_BASE_URL}/hubs/livematch`;

export function useLiveMatch() {
  const [updates, setUpdates] = useState<Record<number, LiveMatchUpdate>>({});
  const [connected, setConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const startConnection = () => {
      if (!isMounted) return;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, { withCredentials: true })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on('ReceiveMatchUpdate', (update: LiveMatchUpdate) => {
        console.log('[SignalR] Received update:', update);
        setUpdates(prev => ({ ...prev, [update.eventId]: update }));
      });

      connection.onreconnected(() => {
        console.log('[SignalR] Reconnected');
        setConnected(true);
      });

      connection.onclose((error) => {
        console.log('[SignalR] Disconnected', error);
        setConnected(false);
        
        // Retry connection after 5 seconds if still mounted
        // This handles server restarts where the connection ID becomes invalid
        if (isMounted && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null;
            console.log('[SignalR] Attempting to reconnect...');
            startConnection();
          }, 5000);
        }
      });

      connection.start()
        .then(() => {
          if (isMounted) {
            console.log('[SignalR] Connected to', HUB_URL);
            setConnected(true);
          }
        })
        .catch(err => {
          console.warn('[SignalR] Connection failed:', err);
          // Retry after 10 seconds on initial connection failure
          if (isMounted && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = window.setTimeout(() => {
              reconnectTimeoutRef.current = null;
              startConnection();
            }, 10000);
          }
        });

      connectionRef.current = connection;
    };

    startConnection();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      connectionRef.current?.stop();
    };
  }, []);

  return { updates, connected };
}
