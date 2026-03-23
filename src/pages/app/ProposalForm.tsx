import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Send, Plus, X, AlertCircle } from 'lucide-react';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { proposalsService, CreateProposalData, Deliverable, Addon, PricingModel } from '../../lib/db/proposals';
import { leadsService } from '../../lib/db/leads';
import { organizationsService } from '../../lib/db/organizations';
import { useAuth } from '../../contexts/AuthContext';

export default function ProposalForm() {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);

  const [formData, setFormData] = useState<CreateProposalData>({
    title: '',
    organization_id: currentOrganization?.id || '',
    client_name: '',
    client_email: '',
    service_types: [],
    scope_summary: '',
    deliverables: [],
    timeline_estimate: '',
    pricing_model: 'fixed_project',
    pricing_amount: undefined,
    optional_addons: [],
    internal_notes: '',
    status: 'draft',
  });

  const [newDeliverable, setNewDeliverable] = useState<Partial<Deliverable>>({ title: '', description: '' });
  const [newAddon, setNewAddon] = useState<Partial<Addon>>({ title: '', description: '', price: 0 });

  const serviceTypeOptions = [
    'Custom Software', 'Dashboard', 'Mobile App', 'Integration', 'Automation', 'Support Retainer'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leadsData, orgsData] = await Promise.all([
        leadsService.getAllLeads(),
        organizationsService.getAllOrganizations(),
      ]);
      setLeads(leadsData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (sendNow = false) => {
    setError('');
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        status: sendNow ? 'sent' : 'draft',
      };

      const proposal = await proposalsService.createProposal(dataToSubmit);
      navigate(`/app/proposals/${proposal.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  const addDeliverable = () => {
    if (!newDeliverable.title || !newDeliverable.description) return;

    setFormData({
      ...formData,
      deliverables: [
        ...formData.deliverables,
        { ...newDeliverable, id: Date.now().toString() } as Deliverable,
      ],
    });
    setNewDeliverable({ title: '', description: '' });
  };

  const removeDeliverable = (id: string) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((d) => d.id !== id),
    });
  };

  const addAddon = () => {
    if (!newAddon.title || !newAddon.description || !newAddon.price) return;

    setFormData({
      ...formData,
      optional_addons: [
        ...formData.optional_addons,
        { ...newAddon, id: Date.now().toString() } as Addon,
      ],
    });
    setNewAddon({ title: '', description: '', price: 0 });
  };

  const removeAddon = (id: string) => {
    setFormData({
      ...formData,
      optional_addons: formData.optional_addons.filter((a) => a.id !== id),
    });
  };

  return (
    <>
      <AppHeader title="Create Proposal" subtitle="Generate a new client proposal" />

      <div className="p-8 max-w-5xl mx-auto">
        <Card glass className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Proposal Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                    placeholder="Healthcare Analytics Dashboard & Integration"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Client Name</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Linked Lead (Optional)</label>
                  <select
                    value={formData.lead_id || ''}
                    onChange={(e) => setFormData({ ...formData, lead_id: e.target.value || undefined })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="">None</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.company_name} - {lead.contact_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Organization</label>
                  <select
                    value={formData.organization_id}
                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Services & Scope</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Service Types</label>
                  <div className="flex flex-wrap gap-2">
                    {serviceTypeOptions.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => {
                          const updated = formData.service_types.includes(service)
                            ? formData.service_types.filter((s) => s !== service)
                            : [...formData.service_types, service];
                          setFormData({ ...formData, service_types: updated });
                        }}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          formData.service_types.includes(service)
                            ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#3B82F6]'
                            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Scope Summary</label>
                  <textarea
                    rows={4}
                    value={formData.scope_summary}
                    onChange={(e) => setFormData({ ...formData, scope_summary: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white resize-none"
                    placeholder="High-level overview of the project scope..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Deliverables</h3>
              <div className="space-y-4">
                {formData.deliverables.map((deliverable) => (
                  <div key={deliverable.id} className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">{deliverable.title}</h4>
                      <p className="text-slate-400 text-sm">{deliverable.description}</p>
                    </div>
                    <button
                      onClick={() => removeDeliverable(deliverable.id)}
                      className="text-red-400 hover:text-red-300 ml-4"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}

                <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Deliverable title"
                    value={newDeliverable.title}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newDeliverable.description}
                    onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  />
                  <Button variant="outline" onClick={addDeliverable} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Deliverable
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Pricing Model</label>
                  <select
                    value={formData.pricing_model}
                    onChange={(e) => setFormData({ ...formData, pricing_model: e.target.value as PricingModel })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  >
                    <option value="fixed_project">Fixed Project</option>
                    <option value="milestone_based">Milestone-Based</option>
                    <option value="monthly_retainer">Monthly Retainer</option>
                    <option value="custom_enterprise">Custom Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Total Amount ($)</label>
                  <input
                    type="number"
                    value={formData.pricing_amount || ''}
                    onChange={(e) => setFormData({ ...formData, pricing_amount: parseFloat(e.target.value) })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Timeline</label>
                  <input
                    type="text"
                    placeholder="12-16 weeks"
                    value={formData.timeline_estimate}
                    onChange={(e) => setFormData({ ...formData, timeline_estimate: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Internal Notes</label>
              <textarea
                rows={3}
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white resize-none"
                placeholder="Notes for internal team (not visible to client)..."
              />
            </div>

            <div className="flex space-x-4 pt-6 border-t border-slate-800">
              <Button variant="outline" onClick={() => navigate('/app/proposals')} className="flex-1">
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleSubmit(false)} disabled={loading} className="flex-1">
                <Save className="w-5 h-5 mr-2" />
                Save Draft
              </Button>
              <Button variant="primary" onClick={() => handleSubmit(true)} disabled={loading} className="flex-1">
                <Send className="w-5 h-5 mr-2" />
                Create & Send
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
