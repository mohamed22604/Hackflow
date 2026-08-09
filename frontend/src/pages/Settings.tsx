import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader,
  Card,
  Button,
  Input,
  Spinner,
  ErrorState,
} from "../components/ui";
import { Copy, Check, Crown } from "lucide-react";

export default function Settings() {
  const { session, isLeader } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<{ id: number; name: string; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    if (!session) return;
    try {
      const team = await api.getTeam(session.teamId);
      setTeamName(team.name);
      setMembers(team.members || []);
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  const copyInviteCode = () => {
    navigator.clipboard.writeText(session?.token || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your team and account."
      />

      {/* Invite code */}
      {isLeader && (
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold mb-2">Invite Code</h3>
          <p className="text-sm text-gray-500 mb-4">
            Share this code with teammates so they can join your team.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-700 truncate">
              {session?.token}
            </div>
            <Button onClick={copyInviteCode} variant="secondary">
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Team info */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-bold mb-5">Team Information</h3>
        <div className="space-y-4">
          <Input
            label="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            disabled={!isLeader}
          />
          <Button disabled={!isLeader}>
            Save Changes
          </Button>
          {!isLeader && (
            <p className="text-xs text-gray-400">
              Only the team leader can change team settings.
            </p>
          )}
        </div>
      </Card>

      {/* Account info */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-bold mb-5">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
              {session?.memberName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{session?.memberName}</p>
              <p className="text-xs text-gray-500 capitalize">
                {session?.memberRole}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Members list */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-5">Team Members</h3>
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{m.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{m.role}</p>
                </div>
              </div>
              {m.role === "leader" && (
                <Crown className="w-4 h-4 text-amber-500" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
