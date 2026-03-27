import { useState, useEffect } from 'react';
import { MessageSquare, Save, Webhook, CheckCircle, Loader2 } from 'lucide-react';
import Card from '../Card';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function WorkspaceChatIntegrations() {
  const { currentOrganization } = useAuth();
  const [slackWebhook, setSlackWebhook] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingSlack, setSavingSlack] = useState(false);
  const [savingDiscord, setSavingDiscord] = useState(false);

  useEffect(() => {
    loadWebhooks();
  }, [currentOrganization]);

  const loadWebhooks = async () => {
    if (!currentOrganization?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bb_organization_settings')
        .select('settings')
        .eq('organization_id', currentOrganization.id)
        .single();
      
      if (data?.settings?.webhooks) {
        setSlackWebhook(data.settings.webhooks.slack || '');
        setDiscordWebhook(data.settings.webhooks.discord || '');
      }
    } catch (err) {
      console.error('Failed to load webhooks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type: 'slack' | 'discord') => {
    if (!currentOrganization?.id) return;
    if (type === 'slack') setSavingSlack(true);
    else setSavingDiscord(true);
    
    try {
      const { data: currentSettings } = await supabase
        .from('bb_organization_settings')
        .select('settings')
        .eq('organization_id', currentOrganization.id)
        .single();

      const newSettings = {
        ...currentSettings?.settings,
        webhooks: {
          ...currentSettings?.settings?.webhooks,
          [type]: type === 'slack' ? slackWebhook : discordWebhook
        }
      };

      await supabase
        .from('bb_organization_settings')
        .upsert({
          organization_id: currentOrganization.id,
          settings: newSettings
        });

      // Show brief success alert purely for UX
      setTimeout(() => {
        if (type === 'slack') setSavingSlack(false);
        else setSavingDiscord(false);
      }, 500);

    } catch (err) {
      console.error('Failed to save webhook', err);
      if (type === 'slack') setSavingSlack(false);
      else setSavingDiscord(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="p-6 bg-slate-900 border-slate-800 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Workspace Chat Bots</h2>
          <p className="text-sm text-slate-400">Map direct webhooks to broadcast critical Bridgebox events into your internal channels.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Slack Mapping */}
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" className="w-6 h-6" />
            <h3 className="text-white font-medium">Slack Integration</h3>
          </div>
          <p className="text-xs text-slate-400">Paste your Slack Incoming Webhook URL to route Lead created and Invoice paid events.</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button 
              onClick={() => handleSave('slack')}
              disabled={savingSlack}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-md text-white font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingSlack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>

        {/* Discord Mapping */}
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#5865F2] rounded flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-medium">Discord Integration</h3>
          </div>
          <p className="text-xs text-slate-400">Paste your Discord Webhook URL for real-time task assignment alerts.</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="url"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button 
              onClick={() => handleSave('discord')}
              disabled={savingDiscord}
              className="px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] rounded-md text-white font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingDiscord ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
