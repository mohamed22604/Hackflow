import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";
import { Zap, ArrowRight } from "lucide-react";

export default function Landing() {
  const { createTeam, joinTeam } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create form
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");

  // Join form
  const [inviteCode, setInviteCode] = useState("");
  const [memberName, setMemberName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createTeam(teamName.trim(), leaderName.trim());
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await joinTeam(inviteCode.trim(), memberName.trim());
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to join team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">HackFlow</span>
        </div>
        <p className="text-sm text-gray-500 hidden sm:block">
          Hackathon team management
        </p>
      </header>

      {/* Hero + form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: pitch */}
          <div className="hidden lg:block">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              Turn a group of people into an organized team.
            </h1>
            <p className="text-lg text-gray-500 mt-5 leading-relaxed">
              HackFlow brings task management, progress tracking, and team
              coordination into one simple workspace — built for the speed of
              hackathons.
            </p>
            <div className="mt-8 space-y-3">
              {[
                "Create or join a team in seconds",
                "Assign tasks and track progress at a glance",
                "Know exactly who's responsible for what",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shrink-0">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
              {/* Toggle */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-6">
                <button
                  onClick={() => setMode("create")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === "create"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Create Team
                </button>
                <button
                  onClick={() => setMode("join")}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === "join"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Join Team
                </button>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {mode === "create" ? (
                <form onSubmit={handleCreate} className="space-y-4">
                  <Input
                    label="Team name"
                    placeholder="e.g. Alpha"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    autoFocus
                  />
                  <Input
                    label="Your name"
                    placeholder="e.g. Ahmed"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Team"}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    You'll be the team leader and can invite others with a
                    code.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleJoin} className="space-y-4">
                  <Input
                    label="Invite code"
                    placeholder="Paste the code from your leader"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    autoFocus
                  />
                  <Input
                    label="Your name"
                    placeholder="e.g. Sara"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Joining..." : "Join Team"}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    Ask your team leader for the invite code.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
