import { useState } from 'react';
import { Fingerprint, MonitorSmartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../Card';

export default function PasskeyRegistration() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const registerPasskey = async () => {
    setLoading(true);
    setError('');
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn is not supported by this browser or OS.');
      }

      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      // Trigger the native OS Biometric Prompt (TouchID / FaceID)
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Bridgebox Enterprise",
            id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
          },
          user: {
            id: userId,
            name: "user@bridgebox.ai",
            displayName: "Bridgebox User"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // requires TouchID / FaceID / Windows Hello
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "none"
        }
      });

      if (credential) {
        // Store visual verification 
        localStorage.setItem('has_passkey_enabled', 'true');
        setSuccess(true);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Passkey registration cancelled or biometric scan failed.');
      } else {
        setError(err.message || 'Failed to register Biometric Passkey');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-slate-900 border-slate-800">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Fingerprint className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Biometric WebAuthn (Passkeys)</h3>
          <p className="text-sm text-slate-400">
            Register your device's native fingerprint or face scanner to log in instantly without passwords.
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MonitorSmartphone className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-sm font-medium text-white">This Device</p>
            <p className="text-xs text-slate-500">Supports TouchID / Windows Hello</p>
          </div>
        </div>
        
        {success ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Registered
          </div>
        ) : (
          <button
            onClick={registerPasskey}
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
            Register Device
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </Card>
  );
}
