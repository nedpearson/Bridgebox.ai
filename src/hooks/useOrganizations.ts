import { useState, useEffect } from 'react';
import { organizationsService } from '../lib/db';
import type { Organization } from '../types/database';

export function useMyOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  async function loadOrganizations() {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationsService.getMyOrganizations();
      setOrganizations(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { organizations, loading, error, reload: loadOrganizations };
}

export function useOrganization(id: string | undefined) {
  const [organization, setOrganization] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadOrganization();
  }, [id]);

  async function loadOrganization() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await organizationsService.getOrganizationById(id);
      setOrganization(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { organization, loading, error, reload: loadOrganization };
}

export function useOrganizationMembers(organizationId: string | undefined) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    loadMembers();
  }, [organizationId]);

  async function loadMembers() {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await organizationsService.getOrganizationMembers(organizationId);
      setMembers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { members, loading, error, reload: loadMembers };
}
