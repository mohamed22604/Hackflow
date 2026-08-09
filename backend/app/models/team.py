from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    # Team members
    members = relationship(
        "Member",
        back_populates="team",
        cascade="all, delete-orphan"
    )

    # Team tasks
    tasks = relationship(
        "Task",
        back_populates="team",
        cascade="all, delete-orphan"
    )