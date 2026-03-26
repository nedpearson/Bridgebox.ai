import { motion } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Users, Settings as SettingsIcon, Palette, Zap, Smartphone, FileLock, DownloadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../../components/app/AppHeader';
import Card from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformIntelligence } from '../../hooks/usePlatformIntelligence';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();

  usePlatformIntelligence({
    id: 'page:settings',
    name: 'Global Platform Settings',
    type: 'page',
    description: 'The root configuration page governing user profiles, team branding, active features, billing access, and global roles.',
    relatedNodes: ['setting:branding', 'setting:roles', 'setting:features'],
    visibility: { roles: ['super_admin', 'tenant_admin', 'manager', 'agent'] },
    actions: []
  });

  const settingsSections = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your account details and preferences',
      color: 'from-[#3B82F6] to-[#10B981]',
      link: '/app/settings',
    },
    {
      icon: Palette,
      title: 'Branding',
      description: 'Customize your organization branding and appearance',
      color: 'from-pink-500 to-rose-500',
      link: '/app/settings/branding',
    },
    {
      icon: Zap,
      title: 'Features',
      description: 'Enable or disable platform features',
      color: 'from-amber-500 to-orange-500',
      link: '/app/settings/features',
    },
    {
      icon: Shield,
      title: 'Roles & Permissions',
      description: 'Define custom roles and permissions',
      color: 'from-blue-500 to-cyan-500',
      link: '/app/settings/roles',
    },
    {
      icon: FileLock,
      title: 'Compliance Log',
      description: 'Immutable tracking of access and mutations',
      color: 'from-slate-600 to-slate-800',
      link: '/app/settings/audit',
    },
    {
      icon: DownloadCloud,
      title: 'Data Export',
      description: 'Download GDPR/CCPA compliant data archives',
      color: 'from-teal-500 to-cyan-500',
      link: '/app/settings/export',
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure email and push notification settings',
      color: 'from-purple-500 to-pink-500',
      link: '/app/settings',
    },
    {
      icon: CreditCard,
      title: 'Billing',
      description: 'Subscription, payment methods, and invoices',
      color: 'from-[#10B981] to-emerald-500',
      link: '/app/billing',
    },
    {
      icon: Users,
      title: 'Team',
      description: 'Manage team members and permissions',
      color: 'from-blue-500 to-cyan-500',
      link: '/app/team',
    },
    {
      icon: SettingsIcon,
      title: 'Integrations',
      description: 'Connect third-party services and APIs',
      color: 'from-yellow-500 to-orange-500',
      link: '/app/integrations',
    },
    {
      icon: Smartphone,
      title: 'App Studio',
      description: 'Customize and build your white-label mobile app',
      color: 'from-violet-500 to-fuchsia-500',
      link: '/app/settings/studio',
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
                <Card glass className="p-6 hover:border-[#3B82F6]/30 transition-all duration-300 cursor-pointer h-full">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {section.title}
                  </h3>
                  <p className="text-slate-400 text-sm">{section.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card glass className="p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.user_metadata?.full_name || ''}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <input
                  type="text"
                  defaultValue="Team Member"
                  disabled
                  className="w-full bg-slate-800/30 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="pt-4">
                <button className="px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
