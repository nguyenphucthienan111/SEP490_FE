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

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveMatchUpdate', (update: LiveMatchUpdate) => {
      console.log('[SignalR] Received update:', update);
      setUpdates(prev => ({ ...prev, [update.eventId]: update }));
    });

    connection.onclose(() => { console.log('[SignalR] Disconnected'); setConnected(false); });
    connection.onreconnected(() => { console.log('[SignalR] Reconnected'); setConnected(true); });

    connection.start()
      .then(() => { console.log('[SignalR] Connected to', HUB_URL); setConnected(true); })
      .catch(err => console.warn('[SignalR] Connection failed:', err));

    connectionRef.current = connection;

    return () => {
      connection.stop();
    };
  }, []);

  return { updates, connected };
}
