import { motion } from 'framer-motion';
import { User, Mail, Phone, Building2, Bell, Shield, Key } from 'lucide-react';
import Card from '../../components/Card';

export default function ClientSettings() {
  const user = {
    name: 'John Anderson',
    email: 'john.anderson@techcorp.io',
    phone: '+1 (555) 123-4567',
    title: 'VP of Technology',
    organization: 'TechCorp Industries',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and security</p>
        </div>

        <div className="space-y-6">
          <Card glass className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span>Profile Information</span>
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Job Title</label>
                  <input
                    type="text"
                    defaultValue={user.title}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    defaultValue={user.email}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    defaultValue={user.phone}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">Organization</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    defaultValue={user.organization}
                    disabled
                    className="w-full bg-slate-800/30 border border-slate-700/50 rounded-lg pl-11 pr-4 py-3 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </Card>

          <Card glass className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Bell className="w-6 h-6" />
              <span>Notifications</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white font-medium mb-1">Project Updates</p>
                  <p className="text-slate-400 text-sm">Receive notifications about project progress and milestones</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white font-medium mb-1">Deliverable Notifications</p>
                  <p className="text-slate-400 text-sm">Get notified when new deliverables are ready for review</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white font-medium mb-1">Support Ticket Updates</p>
                  <p className="text-slate-400 text-sm">Receive updates on your support tickets and responses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white font-medium mb-1">Billing Reminders</p>
                  <p className="text-slate-400 text-sm">Get reminded about upcoming invoices and payments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white font-medium mb-1">Email Digest</p>
                  <p className="text-slate-400 text-sm">Receive a weekly summary of all activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
            </div>
          </Card>

          <Card glass className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <Shield className="w-6 h-6" />
              <span>Security</span>
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium mb-1">Password</p>
                    <p className="text-slate-400 text-sm">Last changed 3 months ago</p>
                  </div>
                  <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Change Password
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium mb-1 flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>Two-Factor Authentication</span>
                    </p>
                    <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Enable
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white font-medium mb-2">Active Sessions</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-white">Current Session - Chrome on macOS</p>
                        <p className="text-slate-400 text-xs">San Francisco, CA • Active now</p>
                      </div>
                      <span className="text-[#10B981] text-xs">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
