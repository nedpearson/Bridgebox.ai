import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, UserPlus, AlertCircle } from "lucide-react";
import Button from "../Button";
import { teamService } from "../../lib/db/team";
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  type UserRole,
} from "../../types/team";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess: () => void;
  allowedRoles?: UserRole[];
}

export default function InviteMemberModal({
  isOpen,
  onClose,
  organizationId,
  onSuccess,
  allowedRoles = ["client_admin", "client_member"],
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("client_member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await teamService.createInvitation(email, organizationId, role);
      onSuccess();
      setEmail("");
      setRole("client_member");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("client_member");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-lg relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Invite Team Member
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Send an invitation to join your organization
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="colleague@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {allowedRoles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>
                        {ROLE_LABELS[roleOption]}
                      </option>
                    ))}
                  </select>
                  <p className="text-slate-500 text-xs mt-2">
                    {ROLE_DESCRIPTIONS[role]}
                  </p>
                </div>

                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-300">
                    An invitation email will be sent to{" "}
                    <span className="text-white font-medium">
                      {email || "the user"}
                    </span>{" "}
                    with instructions to join your organization.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !email}
                    className="flex-1"
                  >
                    {loading ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
