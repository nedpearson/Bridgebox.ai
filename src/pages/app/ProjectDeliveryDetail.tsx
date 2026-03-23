import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, Target, Package, MessageSquare, Plus } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import DeliveryPhaseBadge from '../../components/delivery/DeliveryPhaseBadge';
import HealthStatusIndicator from '../../components/delivery/HealthStatusIndicator';
import RiskLevelBadge from '../../components/delivery/RiskLevelBadge';
import MilestoneStatusBadge from '../../components/delivery/MilestoneStatusBadge';
import DeliverableStatusBadge from '../../components/delivery/DeliverableStatusBadge';
import {
  deliveryService,
  ProjectDeliveryWithDetails,
  MilestoneWithDetails,
  Deliverable,
  DeliveryNoteWithAuthor,
  DeliveryPhase,
  HealthStatus,
} from '../../lib/db/delivery';

export default function ProjectDeliveryDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [delivery, setDelivery] = useState<ProjectDeliveryWithDetails | null>(null);
  const [milestones, setMilestones] = useState<MilestoneWithDetails[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [notes, setNotes] = useState<DeliveryNoteWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) loadData();
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const [deliveryData, milestonesData, deliverablesData, notesData] = await Promise.all([
        deliveryService.getProjectDelivery(projectId),
        deliveryService.getProjectMilestones(projectId),
        deliveryService.getProjectDeliverables(projectId),
        deliveryService.getProjectNotes(projectId),
      ]);
      setDelivery(deliveryData);
      setMilestones(milestonesData);
      setDeliverables(deliverablesData);
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhaseChange = async (phase: DeliveryPhase) => {
    if (!projectId) return;
    try {
      await deliveryService.updateProjectDelivery(projectId, { delivery_phase: phase });
      loadData();
    } catch (error) {
      console.error('Failed to update phase:', error);
    }
  };

  const handleHealthChange = async (health: HealthStatus) => {
    if (!projectId) return;
    try {
      await deliveryService.updateProjectDelivery(projectId, { health_status: health });
      loadData();
    } catch (error) {
      console.error('Failed to update health:', error);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="Project Delivery" />
        <div className="p-8 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </>
    );
  }

  if (!delivery) {
    return (
      <>
        <AppHeader title="Delivery Not Found" />
        <div className="p-8">
          <Card glass className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Delivery Record Not Found</h2>
            <Button variant="primary" onClick={() => window.history.back()}>
              Back to Delivery OS
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader title={delivery.project?.name || 'Project Delivery'} />

      <div className="p-8 space-y-6 max-w-7xl">
        <Link
          to="/app/delivery"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Delivery OS</span>
        </Link>

        <div className="grid lg:grid-cols-4 gap-6">
          <Card glass className="p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Delivery Phase</h3>
            <DeliveryPhaseBadge phase={delivery.delivery_phase} />
            <select
              value={delivery.delivery_phase}
              onChange={(e) => handlePhaseChange(e.target.value as DeliveryPhase)}
              className="mt-3 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value="discovery">Discovery</option>
              <option value="planning">Planning</option>
              <option value="design">Design</option>
              <option value="build">Build</option>
              <option value="integration">Integration</option>
              <option value="qa">QA</option>
              <option value="deployment">Deployment</option>
              <option value="support">Support</option>
            </select>
          </Card>

          <Card glass className="p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Health Status</h3>
            <HealthStatusIndicator status={delivery.health_status} size="md" />
            <select
              value={delivery.health_status}
              onChange={(e) => handleHealthChange(e.target.value as HealthStatus)}
              className="mt-3 w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              <option value="green">Healthy</option>
              <option value="yellow">At Risk</option>
              <option value="red">Critical</option>
            </select>
          </Card>

          <Card glass className="p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Risk Level</h3>
            <RiskLevelBadge level={delivery.risk_level} />
          </Card>

          <Card glass className="p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Completion</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3B82F6] transition-all duration-500"
                  style={{ width: `${delivery.completion_percentage}%` }}
                />
              </div>
              <span className="text-lg font-bold text-white">{delivery.completion_percentage}%</span>
            </div>
          </Card>
        </div>

        <Card glass className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Project Summary</h2>
            <Link
              to={`/app/projects/${projectId}`}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors text-sm"
            >
              <span>View Full Project</span>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {delivery.project?.organizations && (
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Client</p>
                  <p className="text-white font-medium">{delivery.project.organizations.name}</p>
                </div>
              </div>
            )}

            {delivery.project?.type && (
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Project Type</p>
                  <p className="text-white font-medium capitalize">{delivery.project.type.replace(/_/g, ' ')}</p>
                </div>
              </div>
            )}

            {delivery.team_lead && (
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Team Lead</p>
                  <p className="text-white font-medium">
                    {delivery.team_lead.full_name || delivery.team_lead.email}
                  </p>
                </div>
              </div>
            )}

            {delivery.start_date && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Start Date</p>
                  <p className="text-white font-medium">
                    {new Date(delivery.start_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {delivery.target_completion_date && (
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Target Completion</p>
                  <p className="text-white font-medium">
                    {new Date(delivery.target_completion_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {delivery.current_milestone && (
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-slate-400 mt-1" />
                <div>
                  <p className="text-sm text-slate-400">Current Milestone</p>
                  <p className="text-white font-medium">{delivery.current_milestone}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card glass className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Milestones</h2>
          </div>
          {milestones.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No milestones defined yet</p>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{milestone.title}</h3>
                      {milestone.description && (
                        <p className="text-slate-400 text-sm mb-2">{milestone.description}</p>
                      )}
                    </div>
                    <MilestoneStatusBadge status={milestone.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    {milestone.due_date && (
                      <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                    )}
                    {milestone.owner && (
                      <span>Owner: {milestone.owner.full_name || milestone.owner.email}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        <Card glass className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Deliverables</h2>
          </div>
          {deliverables.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No deliverables tracked yet</p>
          ) : (
            <div className="space-y-3">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{deliverable.title}</h4>
                      {deliverable.description && (
                        <p className="text-slate-400 text-sm">{deliverable.description}</p>
                      )}
                    </div>
                    <DeliverableStatusBadge status={deliverable.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card glass className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <MessageSquare className="w-6 h-6 mr-3" />
            Delivery Notes
          </h2>
          {notes.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No notes yet</p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg ${
                    note.is_critical
                      ? 'bg-red-500/5 border border-red-500/30'
                      : 'bg-slate-800/30 border border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
                        {note.note_type}
                      </span>
                      {note.is_critical && (
                        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                          Critical
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">
                      {new Date(note.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300">{note.content}</p>
                  {note.author && (
                    <p className="text-xs text-slate-500 mt-2">
                      By {note.author.full_name || note.author.email}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
