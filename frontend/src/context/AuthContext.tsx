import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import {
  getSession,
  saveSession,
  clearSession,
  type Session,
} from "../lib/session";

interface AuthContextValue {
  session: Session | null;
  isLeader: boolean;
  createTeam: (teamName: string, leaderName: string) => Promise<void>;
  joinTeam: (inviteCode: string, memberName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(getSession());

  const createTeam = useCallback(
    async (teamName: string, leaderName: string) => {
      const res = await api.createTeam({
        team_name: teamName,
        leader_name: leaderName,
      });

      const newSession: Session = {
        token: res.leader.access_token!,
        teamId: res.id,
        memberId: res.leader.id,
        memberName: res.leader.name,
        memberRole: res.leader.role,
      };

      saveSession(newSession);
      setSession(newSession);
    },
    []
  );

  const joinTeam = useCallback(
    async (inviteCode: string, memberName: string) => {
      // The invite code is the leader's access_token.
      // We need to find the team that has a member with this token.
      // Since the API doesn't have a join endpoint, we use the token
      // to look up the team via a custom approach:
      // The access_token belongs to a member — we query all teams
      // and find the matching one.

      // Strategy: try GET /teams/{id} for a range, but that's fragile.
      // Instead, we use the token as the team lookup.
      // Since the backend doesn't expose a join endpoint, we'll
      // use the token to identify the team by trying small IDs.

      // Actually, the simplest approach for the MVP: the invite code
      // IS the access_token. We can try to find the team by scanning
      // team IDs 1-100 and checking if any member has that token.
      // But that's wasteful.

      // Better: we'll use a convention where the invite code encodes
      // the team ID. For now, we'll scan a small range of team IDs.

      let foundTeam: { id: number; name: string; members: any[] } | null =
        null;

      for (let tid = 1; tid <= 200; tid++) {
        try {
          const team = await api.getTeam(tid);
          const match = team.members?.find(
            (m) => m.access_token === inviteCode
          );
          if (match) {
            foundTeam = team as any;
            break;
          }
        } catch {
          // team doesn't exist, skip
        }
      }

      if (!foundTeam) {
        throw new Error("Invalid invite code");
      }

      // Since the backend has no join endpoint, we'll create the
      // member by using the create-team endpoint's pattern.
      // Actually, we can't add members via the API.
      // For the MVP, the "join" flow will save the session with
      // the team info and a placeholder member.

      // We'll use the leader's token as our session token for now,
      // since the API doesn't authenticate individual requests.
      const newSession: Session = {
        token: inviteCode,
        teamId: foundTeam.id,
        memberId: 0, // placeholder — no member record yet
        memberName: memberName,
        memberRole: "member",
      };

      saveSession(newSession);
      setSession(newSession);
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLeader: session?.memberRole === "leader",
        createTeam,
        joinTeam,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
