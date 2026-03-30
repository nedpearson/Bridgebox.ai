import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Globe,
  Briefcase,
  Users,
  User,
  Plus,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Tag,
  ChevronRight,
  Check,
} from "lucide-react";
import Button from "../Button";
import { organizationsService } from "../../lib/db/organizations";
import type { CRMContact, CRMAddress, ContactMethod } from "../../types";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: any) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function ClientModal({
  isOpen,
  onClose,
  onSuccess,
}: ClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "contacts" | "locations" | "details"
  >("basic");

  const [clientType, setClientType] = useState<"business" | "individual">(
    "business",
  );

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    size: "",
    email: "",
    phone: "",
  });

  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [addresses, setAddresses] = useState<CRMAddress[]>([]);
  const [customFields, setCustomFields] = useState<
    { key: string; value: string }[]
  >([]);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) {
      setError("Client name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const customFieldsRecord: Record<string, string> = {};
      customFields.forEach((cf) => {
        if (cf.key.trim()) {
          customFieldsRecord[cf.key.trim()] = cf.value.trim();
        }
      });

      const newClient = await organizationsService.createOrganization({
        name: formData.name,
        website: formData.website || undefined,
        industry: formData.industry || undefined,
        size: formData.size || undefined,
        type: "client",
        metadata: {
          client_type: clientType,
          ...(!isAdvancedMode
            ? { email: formData.email, phone: formData.phone }
            : {}),
          contacts: isAdvancedMode ? contacts : [],
          addresses: isAdvancedMode ? addresses : [],
          custom_fields: isAdvancedMode ? customFieldsRecord : {},
        },
      });

      onSuccess(newClient);

      setFormData({
        name: "",
        website: "",
        industry: "",
        size: "",
        email: "",
        phone: "",
      });
      setClientType("business");
      setContacts([]);
      setAddresses([]);
      setCustomFields([]);
      setIsAdvancedMode(false);
      setActiveTab("basic");

      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        id: generateId(),
        firstName: "",
        lastName: "",
        role: "",
        emails: [],
        phones: [],
        notes: "",
        is_primary: contacts.length === 0,
      },
    ]);
  };

  const addEmailToContact = (contactId: string) => {
    setContacts(
      contacts.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            emails: [
              ...c.emails,
              {
                id: generateId(),
                value: "",
                label: "work",
                is_primary: c.emails.length === 0,
              },
            ],
          };
        }
        return c;
      }),
    );
  };

  const addPhoneToContact = (contactId: string) => {
    setContacts(
      contacts.map((c) => {
        if (c.id === contactId) {
          return {
            ...c,
            phones: [
              ...c.phones,
              {
                id: generateId(),
                value: "",
                label: "mobile",
                is_primary: c.phones.length === 0,
              },
            ],
          };
        }
        return c;
      }),
    );
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        id: generateId(),
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        label: "office",
        is_primary: addresses.length === 0,
      },
    ]);
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-300 w-full ${isAdvancedMode ? "max-w-5xl h-[85vh] flex flex-col" : "max-w-lg"}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 flex-shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Add New Client
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {isAdvancedMode ? "Advanced Intake Mode" : "Quick Add Mode"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {!isAdvancedMode && (
                <button
                  type="button"
                  onClick={() => setIsAdvancedMode(true)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Advanced Setup &rarr;
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex-shrink-0">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={`flex-1 overflow-hidden flex ${isAdvancedMode ? "flex-row" : "flex-col"}`}
          >
            {/* Sidebar (Advanced Mode Only) */}
            {isAdvancedMode && (
              <div className="w-64 border-r border-slate-800 bg-slate-900/30 p-4 flex flex-col space-y-2 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "basic" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-300"}`}
                >
                  <Building2 className="w-4 h-4 mr-3" /> Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("contacts")}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "contacts" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-300"}`}
                >
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-3" /> Contacts
                  </div>
                  {contacts.length > 0 && (
                    <span className="bg-slate-800 text-xs py-0.5 px-2 rounded-full">
                      {contacts.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("locations")}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "locations" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-300"}`}
                >
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3" /> Locations
                  </div>
                  {addresses.length > 0 && (
                    <span className="bg-slate-800 text-xs py-0.5 px-2 rounded-full">
                      {addresses.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "details" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-300"}`}
                >
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-3" /> Details & Fields
                  </div>
                  {customFields.length > 0 && (
                    <span className="bg-slate-800 text-xs py-0.5 px-2 rounded-full">
                      {customFields.length}
                    </span>
                  )}
                </button>

                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    onClick={() => setIsAdvancedMode(false)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-400 py-2"
                  >
                    &larr; Back to Quick Add
                  </button>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div
              className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${isAdvancedMode ? "" : "space-y-4"}`}
            >
              {/* BASIC INFO TAB (or Quick mode) */}
              {(!isAdvancedMode || activeTab === "basic") && (
                <div className="space-y-6">
                  <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 mb-6">
                    <button
                      type="button"
                      onClick={() => setClientType("business")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md flex justify-center items-center transition-all ${clientType === "business" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-slate-300"}`}
                    >
                      <Building2 className="w-4 h-4 mr-2" /> Business
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientType("individual")}
                      className={`flex-1 py-2 text-sm font-medium rounded-md flex justify-center items-center transition-all ${clientType === "individual" ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-slate-300"}`}
                    >
                      <User className="w-4 h-4 mr-2" /> Individual
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {clientType === "business"
                        ? "Company Name *"
                        : "Client Full Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                      placeholder={
                        clientType === "business"
                          ? "Acme Corporation"
                          : "John Doe"
                      }
                    />
                  </div>

                  {/* Compact Primary Contact Info for Quick Add */}
                  {!isAdvancedMode && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Primary Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Primary Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                          placeholder="555-0100"
                        />
                      </div>
                    </div>
                  )}

                  {clientType === "business" && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="https://acme.com"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Industry
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData({ ...formData, industry: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                        placeholder="e.g. Technology"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Company Size
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) =>
                          setFormData({ ...formData, size: e.target.value })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                      >
                        <option value="">Select size...</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  </div>

                  {isAdvancedMode && (
                    <div className="mt-8 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setActiveTab("contacts")}
                        className="flex items-center"
                      >
                        Continue to Contacts{" "}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* CONTACTS TAB */}
              {isAdvancedMode && activeTab === "contacts" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Client Contacts
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addContact}
                      className="text-sm border border-slate-700 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Contact
                    </Button>
                  </div>

                  {contacts.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                      <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h4 className="text-white font-medium mb-2">
                        No contacts added
                      </h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Add individuals associated with this client.
                      </p>
                      <Button type="button" onClick={addContact}>
                        Add First Contact
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {contacts.map((contact, idx) => (
                        <div
                          key={contact.id}
                          className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 relative"
                        >
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setContacts(
                                  contacts.filter((c) => c.id !== contact.id),
                                )
                              }
                              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-800 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <div className="grid grid-cols-12 gap-4 mb-4">
                            <div className="col-span-12 sm:col-span-5">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                First Name
                              </label>
                              <input
                                type="text"
                                value={contact.firstName}
                                onChange={(e) =>
                                  setContacts(
                                    contacts.map((c) =>
                                      c.id === contact.id
                                        ? { ...c, firstName: e.target.value }
                                        : c,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                placeholder="Jane"
                              />
                            </div>
                            <div className="col-span-12 sm:col-span-4">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Last Name
                              </label>
                              <input
                                type="text"
                                value={contact.lastName}
                                onChange={(e) =>
                                  setContacts(
                                    contacts.map((c) =>
                                      c.id === contact.id
                                        ? { ...c, lastName: e.target.value }
                                        : c,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                placeholder="Doe"
                              />
                            </div>
                            <div className="col-span-12 sm:col-span-3">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Role
                              </label>
                              <input
                                type="text"
                                value={contact.role}
                                onChange={(e) =>
                                  setContacts(
                                    contacts.map((c) =>
                                      c.id === contact.id
                                        ? { ...c, role: e.target.value }
                                        : c,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                placeholder="CEO, Spouse..."
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Emails */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 w-full pb-1 flex justify-between">
                                  <span>
                                    <Mail className="w-3 h-3 inline mr-1 -mt-0.5" />{" "}
                                    Emails
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addEmailToContact(contact.id)
                                    }
                                    className="text-indigo-400 hover:text-indigo-300"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </label>
                              </div>
                              <div className="space-y-2">
                                {contact.emails.map((email) => (
                                  <div
                                    key={email.id}
                                    className="flex space-x-2"
                                  >
                                    <input
                                      type="email"
                                      value={email.value}
                                      onChange={(e) =>
                                        setContacts(
                                          contacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  emails: c.emails.map((em) =>
                                                    em.id === email.id
                                                      ? {
                                                          ...em,
                                                          value: e.target.value,
                                                        }
                                                      : em,
                                                  ),
                                                }
                                              : c,
                                          ),
                                        )
                                      }
                                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                                      placeholder="Email Address"
                                    />
                                    <select
                                      value={email.label}
                                      onChange={(e) =>
                                        setContacts(
                                          contacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  emails: c.emails.map((em) =>
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
                                      <option value="personal">Personal</option>
                                      <option value="billing">Billing</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setContacts(
                                          contacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  emails: c.emails.filter(
                                                    (em) => em.id !== email.id,
                                                  ),
                                                }
                                              : c,
                                          ),
                                        )
                                      }
                                      className="text-slate-500 hover:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {contact.emails.length === 0 && (
                                  <p className="text-xs text-slate-500 italic">
                                    No emails configured.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Phones */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700 w-full pb-1 flex justify-between">
                                  <span>
                                    <Phone className="w-3 h-3 inline mr-1 -mt-0.5" />{" "}
                                    Phones
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addPhoneToContact(contact.id)
                                    }
                                    className="text-indigo-400 hover:text-indigo-300"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </label>
                              </div>
                              <div className="space-y-2">
                                {contact.phones.map((phone) => (
                                  <div
                                    key={phone.id}
                                    className="flex space-x-2"
                                  >
                                    <input
                                      type="tel"
                                      value={phone.value}
                                      onChange={(e) =>
                                        setContacts(
                                          contacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  phones: c.phones.map((ph) =>
                                                    ph.id === phone.id
                                                      ? {
                                                          ...ph,
                                                          value: e.target.value,
                                                        }
                                                      : ph,
                                                  ),
                                                }
                                              : c,
                                          ),
                                        )
                                      }
                                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                                      placeholder="Phone Number"
                                    />
                                    <select
                                      value={phone.label}
                                      onChange={(e) =>
                                        setContacts(
                                          contacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  phones: c.phones.map((ph) =>
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
                                      type="button"
                                      onClick={() =>
                                        setContacts(
                                          contacts.map((c) =>
                                            c.id === contact.id
                                              ? {
                                                  ...c,
                                                  phones: c.phones.filter(
                                                    (ph) => ph.id !== phone.id,
                                                  ),
                                                }
                                              : c,
                                          ),
                                        )
                                      }
                                      className="text-slate-500 hover:text-red-400"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                                {contact.phones.length === 0 && (
                                  <p className="text-xs text-slate-500 italic">
                                    No phones configured.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LOCATIONS TAB */}
              {isAdvancedMode && activeTab === "locations" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Locations & Addresses
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addAddress}
                      className="text-sm border border-slate-700 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Location
                    </Button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-700 rounded-xl">
                      <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h4 className="text-white font-medium mb-2">
                        No locations added
                      </h4>
                      <p className="text-sm text-slate-400 mb-4">
                        Track HQ, branches, shipping or billing facilities.
                      </p>
                      <Button type="button" onClick={addAddress}>
                        Add First Location
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {addresses.map((addr, idx) => (
                        <div
                          key={addr.id}
                          className="bg-slate-800/30 border border-slate-700 rounded-xl p-5 relative"
                        >
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setAddresses(
                                  addresses.filter((a) => a.id !== addr.id),
                                )
                              }
                              className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-400 transition-colors bg-slate-800 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-8">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Street Address
                              </label>
                              <input
                                type="text"
                                value={addr.street}
                                onChange={(e) =>
                                  setAddresses(
                                    addresses.map((a) =>
                                      a.id === addr.id
                                        ? { ...a, street: e.target.value }
                                        : a,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                placeholder="123 Corporate Blvd"
                              />
                            </div>
                            <div className="col-span-12 md:col-span-4">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Label
                              </label>
                              <select
                                value={addr.label}
                                onChange={(e) =>
                                  setAddresses(
                                    addresses.map((a) =>
                                      a.id === addr.id
                                        ? { ...a, label: e.target.value as any }
                                        : a,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-300"
                              >
                                <option value="office">Office / HQ</option>
                                <option value="billing">Billing</option>
                                <option value="shipping">Shipping</option>
                                <option value="home">Home</option>
                              </select>
                            </div>
                            <div className="col-span-12 sm:col-span-4">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                City
                              </label>
                              <input
                                type="text"
                                value={addr.city}
                                onChange={(e) =>
                                  setAddresses(
                                    addresses.map((a) =>
                                      a.id === addr.id
                                        ? { ...a, city: e.target.value }
                                        : a,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                placeholder="City"
                              />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                State / Province
                              </label>
                              <input
                                type="text"
                                value={addr.state}
                                onChange={(e) =>
                                  setAddresses(
                                    addresses.map((a) =>
                                      a.id === addr.id
                                        ? { ...a, state: e.target.value }
                                        : a,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                placeholder="State"
                              />
                            </div>
                            <div className="col-span-6 sm:col-span-4">
                              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                Postal / Zip
                              </label>
                              <input
                                type="text"
                                value={addr.zip}
                                onChange={(e) =>
                                  setAddresses(
                                    addresses.map((a) =>
                                      a.id === addr.id
                                        ? { ...a, zip: e.target.value }
                                        : a,
                                    ),
                                  )
                                }
                                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white"
                                placeholder="Zip"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DETAILS & FIELDS TAB */}
              {isAdvancedMode && activeTab === "details" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      Custom Fields
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={addCustomField}
                      className="text-sm border border-slate-700 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Field
                    </Button>
                  </div>

                  <div className="bg-slate-800/30 p-5 border border-slate-700 rounded-xl space-y-4">
                    <p className="text-sm text-slate-400 mb-4">
                      Extend your CRM natively. Define any Key/Value string
                      pairs you require tracking.
                    </p>

                    {customFields.map((field, idx) => (
                      <div key={idx} className="flex space-x-3 items-center">
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) =>
                            setCustomFields(
                              customFields.map((f, i) =>
                                i === idx ? { ...f, key: e.target.value } : f,
                              ),
                            )
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-sm text-white"
                          placeholder="Field Name (e.g. Tax ID)"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) =>
                            setCustomFields(
                              customFields.map((f, i) =>
                                i === idx ? { ...f, value: e.target.value } : f,
                              ),
                            )
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-sm text-white"
                          placeholder="Value"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setCustomFields(
                              customFields.filter((_, i) => i !== idx),
                            )
                          }
                          className="p-2 text-slate-500 hover:text-red-400 bg-slate-900 rounded border border-slate-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {customFields.length === 0 && (
                      <div className="py-6 text-center text-slate-500 text-sm italic">
                        No custom fields defined.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 flex items-center shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                "Committing..."
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" /> Initialize Final Client DB
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
