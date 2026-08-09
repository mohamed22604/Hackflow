from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import secrets

from app.database import get_db
from app.models.team import Team
from app.models.member import Member
from app.schemas.team import TeamCreate, TeamResponse

router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)


@router.post("/", response_model=TeamResponse)
def create_team(
    data: TeamCreate,
    db: Session = Depends(get_db)
):
    team = Team(
        name=data.team_name
    )

    db.add(team)
    db.flush()

    leader = Member(
        team_id=team.id,
        name=data.leader_name,
        role="leader",
        access_token=secrets.token_urlsafe(32)
    )

    db.add(leader)
    db.commit()

    db.refresh(team)
    db.refresh(leader)

    return {
        "id": team.id,
        "name": team.name,
        "leader": leader
    }


@router.get("/{team_id}")
def get_team(
    team_id: int,
    db: Session = Depends(get_db)
):
    team = db.query(Team).filter(
        Team.id == team_id
    ).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    members = db.query(Member).filter(
        Member.team_id == team.id
    ).all()

    return {
        "id": team.id,
        "name": team.name,
        "members": [
            {
                "id": member.id,
                "name": member.name,
                "role": member.role
            }
            for member in members
        ]
    }