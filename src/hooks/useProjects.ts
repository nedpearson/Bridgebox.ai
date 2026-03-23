import { useState, useEffect } from 'react';
import { projectsService } from '../lib/db';
import type { Project } from '../types/database';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getAllProjects();
      setProjects(data as Project[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { projects, loading, error, reload: loadProjects };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadProject();
  }, [id]);

  async function loadProject() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getProjectById(id);
      setProject(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { project, loading, error, reload: loadProject };
}

export function useOrganizationProjects(organizationId: string | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    loadProjects();
  }, [organizationId]);

  async function loadProjects() {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await projectsService.getProjectsByOrganization(organizationId);
      setProjects(data as Project[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { projects, loading, error, reload: loadProjects };
}
