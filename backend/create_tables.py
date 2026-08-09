# from app.database import Base, engine

# # Import models so SQLAlchemy knows them
# from app.models.team import Team
# from app.models.member import Member
# from app.models.task import Task


# print("Creating tables...")

# Base.metadata.create_all(bind=engine)

# print("Tables created successfully")

from app.database import Base, engine

from app.models.team import Team
from app.models.member import Member
from app.models.task import Task

print(engine.url)

Base.metadata.create_all(bind=engine)

print("Done")