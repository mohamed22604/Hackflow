from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    team_id: int
    member_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    member_id: Optional[int] = None
    status: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    team_id: int
    member_id: Optional[int]
    title: str
    description: Optional[str]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

