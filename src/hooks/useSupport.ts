import { useState, useEffect } from 'react';
import { supportService } from '../lib/db';
import type { SupportTicket } from '../types/database';

export function useOrganizationTickets(organizationId: string | undefined) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    loadTickets();
  }, [organizationId]);

  async function loadTickets() {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await supportService.getOrganizationTickets(organizationId);
      setTickets(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { tickets, loading, error, reload: loadTickets };
}

export function useAllTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      setLoading(true);
      setError(null);
      const data = await supportService.getAllTickets();
      setTickets(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { tickets, loading, error, reload: loadTickets };
}

export function useTicket(id: string | undefined) {
  const [ticket, setTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadTicket();
  }, [id]);

  async function loadTicket() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await supportService.getTicketById(id);
      setTicket(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { ticket, loading, error, reload: loadTicket };
}
