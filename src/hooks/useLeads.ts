import { useState, useEffect } from 'react';
import { leadsService } from '../lib/db';
import type { LeadRecord } from '../types/database';

export function useLeads() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getAllLeads();
      setLeads(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { leads, loading, error, reload: loadLeads };
}

export function useLead(id: string | undefined) {
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadLead();
  }, [id]);

  async function loadLead() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getLeadById(id);
      setLead(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { lead, loading, error, reload: loadLead };
}

export function useLeadsByStatus(status: LeadRecord['status']) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadLeads();
  }, [status]);

  async function loadLeads() {
    try {
      setLoading(true);
      setError(null);
      const data = await leadsService.getLeadsByStatus(status);
      setLeads(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { leads, loading, error, reload: loadLeads };
}
