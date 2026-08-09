export interface Member {
  id: number;
  name: string;
  role: string;
  access_token?: string;
}

export interface Team {
  id: number;
  name: string;
  leader?: Member;
  members?: Member[];
}

export interface Task {
  id: number;
  team_id: number;
  member_id: number | null;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export type TaskStatus = "todo" | "in_progress" | "done";

export const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Completed",
};
