import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, StatCard, StatusBadge, Spinner, ErrorState } from "../components/ui";
import type { Task, Member } from "../types";
import { CircleCheck as CheckCircle2, CircleDashed, Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { session } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!session) return;
    try {
      const [allTasks, team] = await Promise.all([
        api.getTasks(),
        api.getTeam(session.teamId),
      ]);
      const teamTasks = allTasks.filter((t) => t.team_id === session.teamId);
      setTasks(teamTasks);
      setTeamName(team.name);
      setMembers(team.members || []);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  const completed = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const total = tasks.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const memberName = (id: number | null) =>
    id ? members.find((m) => m.id === id)?.name || "Unassigned" : "Unassigned";

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        subtitle={`Team ${teamName} — here's what's happening right now.`}
      />

      {/* Welcome card */}
      <Card className="p-7 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {session?.memberName}!
          </h2>
          <p className="text-gray-500 mt-2">
            {total} tasks total — {completed} completed, {inProgress} in
            progress, {todo} to do.
          </p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-4xl font-bold text-black">{progress}%</p>
          <p className="text-sm text-gray-500 mt-1">Overall progress</p>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Tasks"
          value={total}
          sublabel="All tasks"
        />
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {completed}
              </p>
              <p className="text-sm text-emerald-600 mt-1 font-medium">
                {total > 0 ? Math.round((completed / total) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {inProgress}
              </p>
              <p className="text-sm text-blue-600 mt-1 font-medium">
                {total > 0 ? Math.round((inProgress / total) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <CircleDashed className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">To Do</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{todo}</p>
              <p className="text-sm text-amber-600 mt-1 font-medium">
                {total > 0 ? Math.round((todo / total) * 100) : 0}% of total
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.8fr)] gap-5">
        {/* Recent tasks */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-5">Recent Tasks</h3>
          {recentTasks.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">
              No tasks yet. Create one from the Tasks page.
            </p>
          ) : (
            <div className="space-y-1">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0"
                >
                  <StatusBadge status={task.status} />
                  <p className="font-medium text-sm flex-1 truncate">
                    {task.title}
                  </p>
                  <span className="text-sm text-gray-500 hidden sm:block">
                    {memberName(task.member_id)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right column */}
        <div className="space-y-5">
          {/* Progress */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-black" />
              <h3 className="text-lg font-bold">Project Progress</h3>
            </div>
            <p className="text-4xl font-bold text-black">{progress}%</p>
            <div className="w-full h-2.5 bg-gray-200 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-500 text-sm mt-4">
              {completed} of {total} tasks completed
            </p>
          </Card>

          {/* Team members */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-5">Team Members</h3>
            {members.length === 0 ? (
              <p className="text-gray-400 text-sm">No members found.</p>
            ) : (
              <div className="space-y-4">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {m.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
