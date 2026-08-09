import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader,
  Card,
  Button,
  Input,
  Textarea,
  Select,
  StatusBadge,
  Spinner,
  ErrorState,
  EmptyState,
} from "../components/ui";
import type { Task, Member, TaskStatus } from "../types";
import { Plus, Trash2, X, Pencil } from "lucide-react";

export default function Tasks() {
  const { session, isLeader } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memberId, setMemberId] = useState<string>("");
  const [status, setStatus] = useState<TaskStatus>("todo");

  const loadData = useCallback(async () => {
    if (!session) return;
    try {
      const [allTasks, team] = await Promise.all([
        api.getTasks(),
        api.getTeam(session.teamId),
      ]);
      const teamTasks = allTasks.filter((t) => t.team_id === session.teamId);
      setTasks(teamTasks);
      setMembers(team.members || []);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMemberId("");
    setStatus("todo");
    setEditingTask(null);
    setShowForm(false);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setMemberId(task.member_id ? String(task.member_id) : "");
    setStatus(task.status as TaskStatus);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, {
          title,
          description: description || null,
          member_id: memberId ? Number(memberId) : null,
          status,
        });
      } else {
        await api.createTask({
          title,
          description: description || null,
          team_id: session!.teamId,
          member_id: memberId ? Number(memberId) : null,
        });
      }
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.deleteTask(taskId);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  const columns: { key: TaskStatus; label: string }[] = [
    { key: "todo", label: "To Do" },
    { key: "in_progress", label: "In Progress" },
    { key: "done", label: "Completed" },
  ];

  const memberName = (id: number | null) =>
    id ? members.find((m) => m.id === id)?.name || "Unassigned" : "Unassigned";

  return (
    <div className="p-8">
      <PageHeader
        title="Tasks"
        subtitle="Manage your team's tasks and track progress."
        action={
          isLeader && (
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          )
        }
      />

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={resetForm}
          />
          <Card className="relative w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingTask ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                placeholder="e.g. Build login API"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <Textarea
                label="Description"
                placeholder="Describe the task..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Assign to"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </Select>
                {editingTask && (
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as TaskStatus)
                    }
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                  </Select>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  {editingTask ? "Save Changes" : "Create Task"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-700">
                  {col.label}
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {colTasks.length === 0 ? (
                  <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl py-8 text-center">
                    <p className="text-sm text-gray-400">No tasks</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <Card key={task.id} className="p-4 group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">
                          {task.title}
                        </h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isLeader && (
                            <>
                              <button
                                onClick={() => openEdit(task)}
                                className="text-gray-400 hover:text-gray-700 p-1"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="text-gray-400 hover:text-red-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {memberName(task.member_id)}
                        </span>
                        <StatusBadge status={task.status} />
                      </div>
                      {/* Status changer */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value)
                          }
                          className="w-full text-xs px-2.5 py-2 border border-gray-200 rounded-md outline-none focus:border-black bg-white"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Completed</option>
                        </select>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
