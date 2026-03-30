import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import BackgroundAtmosphere from "../../components/BackgroundAtmosphere";
import LoadingSpinner from "../../components/LoadingSpinner";
import RoleBadge from "../../components/team/RoleBadge";
import { useAuth } from "../../contexts/AuthContext";
import { teamService } from "../../lib/db/team";
import type { InvitationWithDetails } from "../../types/team";

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<InvitationWithDetails | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      loadInvitation();
    } else {
      setError("Invalid invitation link");
      setLoading(false);
    }
  }, [token]);

  const loadInvitation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const invitationData = await teamService.getInvitationByToken(token);

      if (!invitationData) {
        setError("Invitation not found");
        return;
      }

      if (invitationData.status !== "pending") {
        setError(`This invitation has been ${invitationData.status}`);
        return;
      }

      if (new Date(invitationData.expires_at) < new Date()) {
        setError("This invitation has expired");
        return;
      }

      setInvitation(invitationData);
    } catch (err: any) {
      setError(err.message || "Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation || !user) return;

    try {
      setAccepting(true);
      setError("");
      await teamService.acceptInvitation(invitation.id, user.id);
      setSuccess(true);
      setTimeout(() => {
        navigate("/app/overview");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 relative">
      <BackgroundAtmosphere />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {loading ? (
          <Card glass className="p-12 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-slate-400 mt-4">Loading invitation...</p>
          </Card>
        ) : error ? (
          <Card glass className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Invalid Invitation
              </h1>
              <p className="text-slate-400 mb-6">{error}</p>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </div>
          </Card>
        ) : success ? (
          <Card glass className="p-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-8 h-8 text-[#10B981]" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-3">
                Welcome Aboard!
              </h1>
              <p className="text-slate-400 mb-6">
                You've successfully joined the team. Redirecting...
              </p>
            </div>
          </Card>
        ) : invitation ? (
          <Card glass className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-[#10B981] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                You're Invited!
              </h1>
              <p className="text-slate-400">
                Join{" "}
                <span className="text-white font-semibold">
                  {invitation.organization_name}
                </span>{" "}
                on Bridgebox
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email</span>
                <span className="text-white font-medium">
                  {invitation.email}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Role</span>
                <RoleBadge role={invitation.role} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Organization</span>
                <span className="text-white font-medium">
                  {invitation.organization_name}
                </span>
              </div>
            </div>

            {!user ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center mb-4">
                  Please sign in or create an account to accept this invitation
                </p>
                <Button
                  variant="primary"
                  onClick={() =>
                    navigate(
                      `/login?redirect=/invitations/accept?token=${token}`,
                    )
                  }
                  className="w-full"
                >
                  Sign In to Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/signup?redirect=/invitations/accept?token=${token}`,
                    )
                  }
                  className="w-full"
                >
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full"
                >
                  {accepting ? "Accepting..." : "Accept Invitation"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/app/overview")}
                  className="w-full"
                >
                  Decline
                </Button>
              </div>
            )}
          </Card>
        ) : null}
      </motion.div>
    </div>
  );
}
