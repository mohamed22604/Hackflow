from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)

    team_id = Column(
        Integer,
        ForeignKey("teams.id", ondelete="CASCADE"),
        nullable=False
    )

    name = Column(String(100), nullable=False)

    role = Column(
        String(20),
        nullable=False,
        default="member"
    )

    access_token = Column(
        String(255),
        unique=True,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Team relationship
    team = relationship(
        "Team",
        back_populates="members",
        foreign_keys=[team_id]
    )

    # Tasks assigned to this member
    tasks = relationship(
        "Task",
        back_populates="member",
        foreign_keys="Task.member_id"
    )