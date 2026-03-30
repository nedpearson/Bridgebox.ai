import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Users,
  Settings as SettingsIcon,
  Palette,
  Zap,
  Smartphone,
  FileLock,
  DownloadCloud,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import AppHeader from "../../components/app/AppHeader";
import Card from "../../components/Card";
import PasskeyRegistration from "../../components/auth/PasskeyRegistration";
import { useAuth } from "../../contexts/AuthContext";
import { usePlatformIntelligence } from "../../hooks/usePlatformIntelligence";
import { organizationsService } from "../../lib/db/organizations";
import { authService } from "../../lib/auth";

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, currentOrganization, setCurrentOrganization } =
    useAuth();
  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "client_admin";

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    orgName: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [location]);

  useEffect(() => {
    setFormData({
      fullName: profile?.full_name || user?.user_metadata?.full_name || "",
      phone: user?.user_metadata?.phone || "",
      orgName: currentOrganization?.name || "",
    });
  }, [user, profile, currentOrganization]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");
    try {
      if (formData.fullName !== profile?.full_name) {
        await authService.updateProfile({ full_name: formData.fullName });
      }
      if (
        isAdmin &&
        currentOrganization &&
        formData.orgName !== currentOrganization.name
      ) {
        const updatedOrg = await organizationsService.updateOrganization(
          currentOrganization.id,
          { name: formData.orgName },
        );
        setCurrentOrganization({
          ...currentOrganization,
          name: updatedOrg.name,
        });
      }
      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  usePlatformIntelligence({
    id: "page:settings",
    name: "Global Platform Settings",
    type: "page",
    description:
      "The root configuration page governing user profiles, team branding, active features, billing access, and global roles.",
    relatedNodes: ["setting:branding", "setting:roles", "setting:features"],
    visibility: { roles: ["super_admin", "tenant_admin", "manager", "agent"] },
    actions: [],
  });

  const settingsSections = [
    {
      icon: User,
      title: "Profile",
      description: "Manage your account details and preferences",
      color: "from-indigo-500 to-[#10B981]",
      link: "/app/settings#profile",
    },
    {
      icon: Palette,
      title: "Branding",
      description: "Customize your organization branding and appearance",
      color: "from-pink-500 to-rose-500",
      link: "/app/settings/branding",
    },
    {
      icon: Zap,
      title: "Features",
      description: "Enable or disable platform features",
      color: "from-amber-500 to-orange-500",
      link: "/app/settings/features",
    },
    {
      icon: Shield,
      title: "Roles & Permissions",
      description: "Define custom roles and permissions",
      color: "from-blue-500 to-cyan-500",
      link: "/app/settings/roles",
    },
    {
      icon: FileLock,
      title: "Compliance Log",
      description: "Immutable tracking of access and mutations",
      color: "from-slate-600 to-slate-800",
      link: "/app/settings/audit",
    },
    {
      icon: DownloadCloud,
      title: "Data Export",
      description: "Download GDPR/CCPA compliant data archives",
      color: "from-teal-500 to-cyan-500",
      link: "/app/settings/export",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure email and push notification settings",
      color: "from-purple-500 to-pink-500",
      link: "/app/settings#notifications",
    },
    {
      icon: CreditCard,
      title: "Billing",
      description: "Subscription, payment methods, and invoices",
      color: "from-[#10B981] to-emerald-500",
      link: "/app/billing",
    },
    {
      icon: Users,
      title: "Team",
      description: "Manage team members and permissions",
      color: "from-blue-500 to-cyan-500",
      link: "/app/team",
    },
    {
      icon: SettingsIcon,
      title: "Integrations",
      description: "Connect third-party services and APIs",
      color: "from-yellow-500 to-orange-500",
      link: "/app/integrations",
    },
    {
      icon: Smartphone,
      title: "App Studio",
      description: "Customize and build your white-label mobile app",
      color: "from-violet-500 to-fuchsia-500",
      link: "/app/settings/studio",
    },
  ];

  return (
    <>
      <AppHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(section.link)}
              >
                <Card
                  glass
                  className="p-6 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer h-full"
                >
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {section.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div id="profile">
          <Card glass className="p-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                Account Information
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {successMsg && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-400 text-sm">{successMsg}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    disabled
                    className="w-full bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number{" "}
                    <span className="text-xs text-slate-500 font-normal ml-2">
                      (Required for 2FA)
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Organization / Client Name
                    </label>
                    <input
                      type="text"
                      value={formData.orgName}
                      onChange={(e) =>
                        setFormData({ ...formData, orgName: e.target.value })
                      }
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue={
                      profile?.role
                        ? profile.role
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                        : "Team Member"
                    }
                    disabled
                    className="w-full bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </Card>
        </div>

        <div id="notifications">
          <Card glass className="p-8">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div>
                    <h4 className="text-white font-medium">
                      Email Notifications
                    </h4>
                    <p className="text-sm text-slate-400">
                      Receive daily summaries and critical alerts via email.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div>
                    <h4 className="text-white font-medium">
                      Push Notifications
                    </h4>
                    <p className="text-sm text-slate-400">
                      Receive real-time push notifications in your browser.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div>
                    <h4 className="text-white font-medium">
                      Mobile Notifications (SMS)
                    </h4>
                    <p className="text-sm text-slate-400">
                      Receive critical security code alerts directly to your
                      phone.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="max-w-2xl">
          <PasskeyRegistration />
        </div>
      </div>
    </>
  );
}
