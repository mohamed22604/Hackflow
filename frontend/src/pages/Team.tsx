import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Spinner, ErrorState } from "../components/ui";
import type { Task, Member } from "../types";
import { Crown, CircleCheck as CheckCircle2, Clock, CircleDashed } from "lucide-react";

export default function Team() {
  const { session } = useAuth();
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!session) return;
    try {
      const [team, allTasks] = await Promise.all([
        api.getTeam(session.teamId),
        api.getTasks(),
      ]);
      setTeamName(team.name);
      setMembers(team.members || []);
      setTasks(allTasks.filter((t) => t.team_id === session.teamId));
    } catch (err: any) {
      setError(err.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  const memberStats = (memberId: number) => {
    const memberTasks = tasks.filter((t) => t.member_id === memberId);
    const completed = memberTasks.filter((t) => t.status === "done").length;
    const inProgress = memberTasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    const todo = memberTasks.filter((t) => t.status === "todo").length;
    const total = memberTasks.length;
    return { total, completed, inProgress, todo };
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Team"
        subtitle={`Team ${teamName} — ${members.length} member${members.length !== 1 ? "s" : ""}`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((m) => {
          const stats = memberStats(m.id);
          const isLeader = m.role === "leader";
          return (
            <Card key={m.id} className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-semibold shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {m.name}
                    </h3>
                    {isLeader && (
                      <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{m.role}</p>
                </div>
              </div>

              {/* Task stats */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CircleDashed className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.todo}
                  </p>
                  <p className="text-xs text-gray-500">To Do</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.inProgress}
                  </p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
                  <p className="text-xs text-gray-500">Done</p>
                </div>
              </div>

              {stats.total > 0 && (
                <div className="mt-4">
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{
                        width: `${(stats.completed / stats.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">
                    {stats.completed} of {stats.total} tasks done
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
