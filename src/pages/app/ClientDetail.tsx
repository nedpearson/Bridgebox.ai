import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Building2,
  AlertCircle,
  Calendar,
  MessageSquare,
  Files,
  CheckCircle2,
  MoreVertical,
  X,
  Sparkles,
  ChevronDown,
  Mail,
  Phone,
  Globe,
  Edit2,
  Check,
  Users,
  ShieldAlert,
  MapPin,
  User,
  Tag,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorState from "../../components/ErrorState";
import StatusBadge from "../../components/admin/StatusBadge";
import IntegrationBadge from "../../components/connectors/IntegrationBadge";
import RelationalCommandCenter from "../../components/app/RelationalCommandCenter";
import RelationalMetricsCard from "../../components/app/RelationalMetricsCard";
import NextBestActionPanel from "../../components/app/NextBestActionPanel";
import BlockersPanel from "../../components/app/BlockersPanel";
import TimelineActivity from "../../components/app/TimelineActivity";
import DocumentAttachmentWidget from "../../components/app/DocumentAttachmentWidget";
import { organizationsService } from "../../lib/db/organizations";
import { projectsService } from "../../lib/db/projects";
import type { CRMContact, CRMAddress, ContactMethod } from "../../types";

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState<
    "basic" | "contacts" | "locations" | "details"
  >("basic");

  // Edit State
  const [editName, setEditName] = useState("");
  const [editIndustry, setEditIndustry] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editClientType, setEditClientType] = useState<
    "business" | "individual"
  >("business");
  const [editContacts, setEditContacts] = useState<CRMContact[]>([]);
  const [editAddresses, setEditAddresses] = useState<CRMAddress[]>([]);
  const [editCustomFields, setEditCustomFields] = useState<
    { key: string; value: string }[]
  >([]);
  const [editLegacyProps, setEditLegacyProps] = useState<
    { name: string; url: string; category: string; location: string }[]
  >([]);

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [clientData, activeProjects] = await Promise.all([
        organizationsService.getOrganizationById(id),
        projectsService.getProjectsByOrganization(id),
      ]);
      setClient(clientData);
      setProjects(activeProjects || []);
      populateEditForm(clientData);
    } catch (err: any) {
      setError(err.message || "Failed to load client details");
    } finally {
      setLoading(false);
    }
  };

  const populateEditForm = (data: any) => {
    setEditName(data.name || "");
    setEditIndustry(data.industry || "");
    setEditWebsite(data.website || "");
    setEditClientType(data.metadata?.client_type || "business");
    setEditContacts(data.metadata?.contacts || []);
    setEditAddresses(data.metadata?.addresses || []);

    const cf = data.metadata?.custom_fields || {};
    setEditCustomFields(
      Object.entries(cf).map(([k, v]) => ({ key: k, value: String(v) })),
    );

    const legacyProperties = data.metadata?.properties || [];
    setEditLegacyProps(legacyProperties);
  };

  const handleEditInit = () => {
    setSaveError("");
    setEditTab("basic");
    populateEditForm(client);
    setIsEditing(true);
  };

  const handleSaveDetails = async () => {
    if (!client) return;
    setSaveError("");
    try {
      const customFieldsRecord: Record<string, string> = {};
      editCustomFields.forEach((cf) => {
        if (cf.key.trim()) {
          customFieldsRecord[cf.key.trim()] = cf.value.trim();
        }
      });

      const nextMetadata = {
        ...client.metadata,
        client_type: editClientType,
        contacts: editContacts,
        addresses: editAddresses,
        custom_fields: customFieldsRecord,
        properties: editLegacyProps,
      };

      await organizationsService.updateOrganization(client.id, {
        name: editName,
        industry: editIndustry,
        website: editWebsite,
        metadata: nextMetadata,
      });

      setClient({
        ...client,
        name: editName,
        industry: editIndustry,
        website: editWebsite,
        metadata: nextMetadata,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update client details", err);
      setSaveError(
        err.message || "Failed to update client. Please check fields.",
      );
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (error || !client)
    return <ErrorState message={error || "Client not found"} />;

  const primaryPhone =
    client.metadata?.contacts
      ?.flatMap((c: CRMContact) => c.phones)
      .find((p: ContactMethod) => p.is_primary)?.value ||
    client.metadata?.phone ||
    "No phone provided";
  const primaryEmail =
    client.metadata?.contacts
      ?.flatMap((c: CRMContact) => c.emails)
      .find((e: ContactMethod) => e.is_primary)?.value ||
    client.metadata?.email ||
    "No email provided";

  return (
    <>
      <AppHeader
        title={client.name}
        backTo="/app/clients"
        backLabel="Clients"
      />

      <RelationalCommandCenter entityType="organization" entityId={client.id}>
        <div className="space-y-6">
          <div className="flex justify-end mb-2">
            {!isEditing ? (
              <Button
                size="sm"
                onClick={handleEditInit}
                variant="outline"
                className="bg-slate-800/50 hover:bg-slate-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Dimensions
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel Edit
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveDetails}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Commit Changes
                </Button>
              </div>
            )}
          </div>

          <div
            className={`grid gap-6 ${isEditing ? "lg:grid-cols-1" : "lg:grid-cols-3"}`}
          >
            {/* LEFT RAIL / EDITOR CONSOLE */}
            <Card
              glass
              className={`p-0 overflow-hidden shadow-2xl ${isEditing ? "col-span-1" : "col-span-1"}`}
            >
              {isEditing ? (
                <div className="flex flex-col md:flex-row min-h-[600px]">
                  {/* Inline Editor Sidebar */}
                  <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 p-4 space-y-2">
                    <button
                      onClick={() => setEditTab("basic")}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${editTab === "basic" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800"}`}
                    >
                      <Building2 className="w-4 h-4 mr-3" /> Base Identity
                    </button>
                    <button
                      onClick={() => setEditTab("contacts")}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${editTab === "contacts" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800"}`}
                    >
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-3" /> CRM Contacts
                      </div>
                      {editContacts.length > 0 && (
                        <span className="bg-slate-800 text-xs py-0.5 px-2 rounded-full">
                          {editContacts.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setEditTab("locations")}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${editTab === "locations" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800"}`}
                    >
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-3" /> Addresses
                      </div>
                      {editAddresses.length > 0 && (
                        <span className="bg-slate-800 text-xs py-0.5 px-2 rounded-full">
                          {editAddresses.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setEditTab("details")}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${editTab === "details" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800"}`}
                    >
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-3" /> Custom Meta
                      </div>
                      {editCustomFields.length > 0 && (
                        <span className="bg-slate-800 text-xs py-0.5 px-2 rounded-full">
                          {editCustomFields.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Inline Editor Canvas */}
                  <div className="flex-1 p-6 overflow-y-auto bg-slate-900/20 custom-scrollbar max-h-[800px]">
                    {saveError && (
                      <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                        {saveError}
                      </div>
                    )}

                    {editTab === "basic" && (
                      <div className="space-y-6 max-w-2xl">
                        <h3 className="text-lg font-bold text-white mb-6">
                          Core Identity
                        </h3>
                        <div className="flex space-x-4">
                          <label
                            className={`flex-1 cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all ${editClientType === "business" ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                          >
                            <input
                              type="radio"
                              name="clientType"
                              value="business"
                              checked={editClientType === "business"}
                              onChange={() => setEditClientType("business")}
                              className="sr-only"
                            />
                            <Building2
                              className={`w-6 h-6 mb-2 ${editClientType === "business" ? "text-indigo-400" : "text-slate-500"}`}
                            />
                            <span className="text-sm font-semibold">
                              Business Entity
                            </span>
                          </label>
                          <label
                            className={`flex-1 cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all ${editClientType === "individual" ? "bg-indigo-500/10 border-indigo-500 text-white" : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"}`}
                          >
                            <input
                              type="radio"
                              name="clientType"
                              value="individual"
                              checked={editClientType === "individual"}
                              onChange={() => setEditClientType("individual")}
                              className="sr-only"
                            />
                            <User
                              className={`w-6 h-6 mb-2 ${editClientType === "individual" ? "text-indigo-400" : "text-slate-500"}`}
                            />
                            <span className="text-sm font-semibold">
                              Individual Account
                            </span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                            Formal Name
                          </label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                              Industry
                            </label>
                            <input
                              type="text"
                              value={editIndustry}
                              onChange={(e) => setEditIndustry(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                              Global Website
                            </label>
                            <input
                              type="url"
                              value={editWebsite}
                              onChange={(e) => setEditWebsite(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {editTab === "contacts" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                          <h3 className="text-lg font-bold text-white">
                            CRM Contacts
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditContacts([
                                ...editContacts,
                                {
                                  id: generateId(),
                                  firstName: "",
                                  lastName: "",
                                  role: "",
                                  emails: [],
                                  phones: [],
                                  notes: "",
                                  is_primary: editContacts.length === 0,
                                },
                              ])
                            }
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Matrix Member
                          </Button>
                        </div>
                        <div className="space-y-6">
                          {editContacts.map((contact, idx) => (
                            <div
                              key={contact.id}
                              className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 relative shadow-lg"
                            >
                              <button
                                onClick={() =>
                                  setEditContacts(
                                    editContacts.filter(
                                      (c) => c.id !== contact.id,
                                    ),
                                  )
                                }
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="grid grid-cols-12 gap-4 mb-6">
                                <div className="col-span-12 sm:col-span-5">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    First Name
                                  </label>
                                  <input
                                    type="text"
                                    value={contact.firstName}
                                    onChange={(e) =>
                                      setEditContacts(
                                        editContacts.map((c) =>
                                          c.id === contact.id
                                            ? {
                                                ...c,
                                                firstName: e.target.value,
                                              }
                                            : c,
                                        ),
                                      )
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                  />
                                </div>
                                <div className="col-span-12 sm:col-span-4">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Last Name
                                  </label>
                                  <input
                                    type="text"
                                    value={contact.lastName}
                                    onChange={(e) =>
                                      setEditContacts(
                                        editContacts.map((c) =>
                                          c.id === contact.id
                                            ? { ...c, lastName: e.target.value }
                                            : c,
                                        ),
                                      )
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                  />
                                </div>
                                <div className="col-span-12 sm:col-span-3">
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Designation
                                  </label>
                                  <input
                                    type="text"
                                    value={contact.role}
                                    onChange={(e) =>
                                      setEditContacts(
                                        editContacts.map((c) =>
                                          c.id === contact.id
                                            ? { ...c, role: e.target.value }
                                            : c,
                                        ),
                                      )
                                    }
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                    placeholder="CEO, Lead..."
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-lg">
                                {/* Emails */}
                                <div>
                                  <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase flex items-center">
                                      <Mail className="w-3.5 h-3.5 mr-1.5" />{" "}
                                      Comm Targets (Email)
                                    </label>
                                    <button
                                      onClick={() =>
                                        setEditContacts(
                                          editContacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  emails: [
                                                    ...c.emails,
                                                    {
                                                      id: generateId(),
                                                      value: "",
                                                      label: "work",
                                                      is_primary:
                                                        c.emails.length === 0,
                                                    },
                                                  ],
                                                }
                                              : c,
                                          ),
                                        )
                                      }
                                      className="text-indigo-400 hover:text-indigo-300"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {contact.emails.map((email) => (
                                      <div
                                        key={email.id}
                                        className="flex space-x-2 items-center"
                                      >
                                        <input
                                          type="email"
                                          value={email.value}
                                          onChange={(e) =>
                                            setEditContacts(
                                              editContacts.map((c) =>
                                                c.id === contact.id
                                                  ? {
                                                      ...c,
                                                      emails: c.emails.map(
                                                        (em) =>
                                                          em.id === email.id
                                                            ? {
                                                                ...em,
                                                                value:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : em,
                                                      ),
                                                    }
                                                  : c,
                                              ),
                                            )
                                          }
                                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                                          placeholder="john@example.com"
                                        />
                                        <select
                                          value={email.label}
                                          onChange={(e) =>
                                            setEditContacts(
                                              editContacts.map((c) =>
                                                c.id === contact.id
                                                  ? {
                                                      ...c,
                                                      emails: c.emails.map(
                                                        (em) =>
                                                          em.id === email.id
                                                            ? {
                                                                ...em,
                                                                label: e.target
                                                                  .value as any,
                                                              }
                                                            : em,
                                                      ),
                                                    }
                                                  : c,
                                              ),
                                            )
                                          }
                                          className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300"
                                        >
                                          <option value="work">Work</option>
                                          <option value="personal">
                                            Personal
                                          </option>
                                          <option value="billing">
                                            Billing
                                          </option>
                                        </select>
                                        <button
                                          onClick={() =>
                                            setEditContacts(
                                              editContacts.map((c) =>
                                                c.id === contact.id
                                                  ? {
                                                      ...c,
                                                      emails: c.emails.filter(
                                                        (em) =>
                                                          em.id !== email.id,
                                                      ),
                                                    }
                                                  : c,
                                              ),
                                            )
                                          }
                                          className="text-slate-500 hover:text-red-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                    {contact.emails.length === 0 && (
                                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                        No endpoints
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Phones */}
                                <div>
                                  <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-2">
                                    <label className="text-xs font-semibold text-slate-400 uppercase flex items-center">
                                      <Phone className="w-3.5 h-3.5 mr-1.5" />{" "}
                                      Telecom Targets
                                    </label>
                                    <button
                                      onClick={() =>
                                        setEditContacts(
                                          editContacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  phones: [
                                                    ...c.phones,
                                                    {
                                                      id: generateId(),
                                                      value: "",
                                                      label: "mobile",
                                                      is_primary:
                                                        c.phones.length === 0,
                                                    },
                                                  ],
                                                }
                                              : c,
                                          ),
                                        )
                                      }
                                      className="text-indigo-400 hover:text-indigo-300"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="space-y-2">
                                    {contact.phones.map((phone) => (
                                      <div
                                        key={phone.id}
                                        className="flex space-x-2 items-center"
                                      >
                                        <input
                                          type="tel"
                                          value={phone.value}
                                          onChange={(e) =>
                                            setEditContacts(
                                              editContacts.map((c) =>
                                                c.id === contact.id
                                                  ? {
                                                      ...c,
                                                      phones: c.phones.map(
                                                        (ph) =>
                                                          ph.id === phone.id
                                                            ? {
                                                                ...ph,
                                                                value:
                                                                  e.target
                                                                    .value,
                                                              }
                                                            : ph,
                                                      ),
                                                    }
                                                  : c,
                                              ),
                                            )
                                          }
                                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                                          placeholder="555-0100"
                                        />
                                        <select
                                          value={phone.label}
                                          onChange={(e) =>
                                            setEditContacts(
                                              editContacts.map((c) =>
                                                c.id === contact.id
                                                  ? {
                                                      ...c,
                                                      phones: c.phones.map(
                                                        (ph) =>
                                                          ph.id === phone.id
                                                            ? {
                                                                ...ph,
                                                                label: e.target
                                                                  .value as any,
                                                              }
                                                            : ph,
                                                      ),
                                                    }
                                                  : c,
                                              ),
                                            )
                                          }
                                          className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300"
                                        >
                                          <option value="mobile">Mobile</option>
                                          <option value="office">Office</option>
                                          <option value="home">Home</option>
                                        </select>
                                        <button
                                          onClick={() =>
                                            setEditContacts(
                                              editContacts.map((c) =>
                                                c.id === contact.id
                                                  ? {
                                                      ...c,
                                                      phones: c.phones.filter(
                                                        (ph) =>
                                                          ph.id !== phone.id,
                                                      ),
                                                    }
                                                  : c,
                                              ),
                                            )
                                          }
                                          className="text-slate-500 hover:text-red-400"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                    {contact.phones.length === 0 && (
                                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                        No endpoints
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {editTab === "locations" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                          <h3 className="text-lg font-bold text-white">
                            Geographic Coordinates
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditAddresses([
                                ...editAddresses,
                                {
                                  id: generateId(),
                                  street: "",
                                  city: "",
                                  state: "",
                                  zip: "",
                                  country: "",
                                  label: "office",
                                  is_primary: editAddresses.length === 0,
                                },
                              ])
                            }
                          >
                            <Plus className="w-4 h-4 mr-2" /> Bind Location
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {editAddresses.map((addr) => (
                            <div
                              key={addr.id}
                              className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 relative shadow-lg"
                            >
                              <button
                                onClick={() =>
                                  setEditAddresses(
                                    editAddresses.filter(
                                      (a) => a.id !== addr.id,
                                    ),
                                  )
                                }
                                className="absolute top-4 right-4 text-slate-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 pr-8">
                                  <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                      Street Address
                                    </label>
                                    <input
                                      type="text"
                                      value={addr.street}
                                      onChange={(e) =>
                                        setEditAddresses(
                                          editAddresses.map((a) =>
                                            a.id === addr.id
                                              ? { ...a, street: e.target.value }
                                              : a,
                                          ),
                                        )
                                      }
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                      City
                                    </label>
                                    <input
                                      type="text"
                                      value={addr.city}
                                      onChange={(e) =>
                                        setEditAddresses(
                                          editAddresses.map((a) =>
                                            a.id === addr.id
                                              ? { ...a, city: e.target.value }
                                              : a,
                                          ),
                                        )
                                      }
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                      State
                                    </label>
                                    <input
                                      type="text"
                                      value={addr.state}
                                      onChange={(e) =>
                                        setEditAddresses(
                                          editAddresses.map((a) =>
                                            a.id === addr.id
                                              ? { ...a, state: e.target.value }
                                              : a,
                                          ),
                                        )
                                      }
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                      Postal Code
                                    </label>
                                    <input
                                      type="text"
                                      value={addr.zip}
                                      onChange={(e) =>
                                        setEditAddresses(
                                          editAddresses.map((a) =>
                                            a.id === addr.id
                                              ? { ...a, zip: e.target.value }
                                              : a,
                                          ),
                                        )
                                      }
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                      Label
                                    </label>
                                    <select
                                      value={addr.label}
                                      onChange={(e) =>
                                        setEditAddresses(
                                          editAddresses.map((a) =>
                                            a.id === addr.id
                                              ? {
                                                  ...a,
                                                  label: e.target.value as any,
                                                }
                                              : a,
                                          ),
                                        )
                                      }
                                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
                                    >
                                      <option value="office">
                                        HQ / Office
                                      </option>
                                      <option value="shipping">Shipping</option>
                                      <option value="billing">Billing</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {editTab === "details" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                          <h3 className="text-lg font-bold text-white">
                            Custom Metadata
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEditCustomFields([
                                ...editCustomFields,
                                { key: "", value: "" },
                              ])
                            }
                          >
                            <Plus className="w-4 h-4 mr-2" /> Inject Key/Value
                          </Button>
                        </div>
                        <div className="bg-slate-800/30 p-5 border border-slate-700 rounded-xl space-y-4 max-w-3xl">
                          {editCustomFields.map((field, idx) => (
                            <div
                              key={idx}
                              className="flex space-x-3 items-center"
                            >
                              <input
                                type="text"
                                value={field.key}
                                onChange={(e) =>
                                  setEditCustomFields(
                                    editCustomFields.map((f, i) =>
                                      i === idx
                                        ? { ...f, key: e.target.value }
                                        : f,
                                    ),
                                  )
                                }
                                className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2.5 text-sm text-white"
                                placeholder="Key (e.g. ERP System)"
                              />
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) =>
                                  setEditCustomFields(
                                    editCustomFields.map((f, i) =>
                                      i === idx
                                        ? { ...f, value: e.target.value }
                                        : f,
                                    ),
                                  )
                                }
                                className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2.5 text-sm text-white"
                                placeholder="Value"
                              />
                              <button
                                onClick={() =>
                                  setEditCustomFields(
                                    editCustomFields.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  )
                                }
                                className="p-2.5 text-slate-500 hover:text-red-400 bg-slate-900 rounded border border-slate-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {editCustomFields.length === 0 && (
                            <p className="text-sm text-slate-500 italic">
                              No custom topology layers injected.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-lg flex items-center justify-center flex-shrink-0">
                      {client.metadata?.client_type === "individual" ? (
                        <User className="w-8 h-8 text-white" />
                      ) : (
                        <Building2 className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white mb-2 truncate">
                        {client.name}
                      </h2>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={client.status} variant="success" />
                        {client.metadata?.provider_name && (
                          <IntegrationBadge
                            providerName={client.metadata.provider_name}
                            externalId={client.metadata.external_id}
                            lastSynced={client.metadata.last_synced_at}
                            sourceUrl={client.metadata.source_url}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-slate-300">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <span className="text-sm truncate">{primaryEmail}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-300">
                      <Phone className="w-4 h-4 text-slate-500" />
                      <span className="text-sm truncate">{primaryPhone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-300">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span className="text-sm truncate">
                        {client.website || "No properties mapped"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="text-sm">
                        Onboarded {client.onboarded}
                      </span>
                    </div>

                    {/* Custom Meta Rendering */}
                    {client.metadata?.custom_fields &&
                      Object.keys(client.metadata.custom_fields).length > 0 && (
                        <div className="pt-4 mt-4 border-t border-slate-800/50">
                          <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                            <Tag className="w-4 h-4" />
                            <span className="text-xs font-semibold uppercase tracking-wider">
                              Topology Tags
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(client.metadata.custom_fields).map(
                              ([k, v]) => (
                                <span
                                  key={k}
                                  className="px-2 py-1 bg-slate-800 text-slate-300 text-[10px] rounded border border-slate-700 flex items-center"
                                >
                                  <span className="text-slate-500 mr-1.5 uppercase tracking-wider">
                                    {k}:
                                  </span>{" "}
                                  <span className="font-bold">{String(v)}</span>
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
                    <div>
                      <p className="text-2xl font-bold text-[#10B981]">
                        {client.health_score || 0}
                      </p>
                      <p className="text-slate-500 text-xs">Health Score</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        ${(client.mrr || 0).toLocaleString()}
                      </p>
                      <p className="text-slate-500 text-xs">MRR</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* RIGHT RAIL / VIEW CONSOLE */}
            {!isEditing && (
              <div className="col-span-1 lg:col-span-2 space-y-6">
                {/* ADVANCED CRM CONTACTS RENDERER */}
                {client.metadata?.contacts &&
                  client.metadata.contacts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {client.metadata.contacts.map((contact: CRMContact) => (
                        <Card
                          glass
                          key={contact.id}
                          className="p-5 border-l-2 border-l-indigo-500 hover:border-l-indigo-400 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-md font-bold text-white">
                                {contact.firstName} {contact.lastName}
                              </h4>
                              <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mt-0.5">
                                {contact.role || "Stakeholder"}
                              </p>
                            </div>
                            {contact.is_primary && (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] uppercase font-bold rounded">
                                Primary
                              </span>
                            )}
                          </div>

                          <div className="space-y-2.5">
                            {contact.emails?.map((e) => (
                              <div
                                key={e.id}
                                className="flex items-center text-sm text-slate-300 bg-slate-800/40 px-2 py-1.5 rounded"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-500 mr-2 flex-shrink-0" />
                                <span className="truncate flex-1">
                                  {e.value}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-slate-500 ml-2">
                                  {e.label}
                                </span>
                              </div>
                            ))}
                            {contact.phones?.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center text-sm text-slate-300 bg-slate-800/40 px-2 py-1.5 rounded"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-500 mr-2 flex-shrink-0" />
                                <span className="truncate flex-1">
                                  {p.value}
                                </span>
                                <span className="text-[9px] uppercase tracking-wider text-slate-500 ml-2">
                                  {p.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                {/* ADVANCED CRM LOCATIONS RENDERER */}
                {client.metadata?.addresses &&
                  client.metadata.addresses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {client.metadata.addresses.map((addr: CRMAddress) => (
                        <Card
                          glass
                          key={addr.id}
                          className="p-4 flex items-start space-x-4"
                        >
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                            <MapPin className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-white">
                                {addr.label.toUpperCase()} LOCATION
                              </h4>
                            </div>
                            <p className="text-sm text-slate-300">
                              {addr.street}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {addr.city}, {addr.state} {addr.zip}
                            </p>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                <BlockersPanel entityType="organization" entityId={client.id} />
                <RelationalMetricsCard
                  entityType="organization"
                  entityId={client.id}
                />
                <NextBestActionPanel
                  entityType="organization"
                  entityData={client}
                />
                <TimelineActivity
                  entityType="organization"
                  entityId={client.id}
                />
              </div>
            )}
          </div>
        </div>
      </RelationalCommandCenter>
    </>
  );
}
