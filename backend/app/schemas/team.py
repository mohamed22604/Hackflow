from pydantic import BaseModel


class TeamCreate(BaseModel):
    team_name: str
    leader_name: str


class LeaderResponse(BaseModel):
    id: int
    name: str
    role: str
    access_token: str


class TeamResponse(BaseModel):
    id: int
    name: str
    leader: LeaderResponse


