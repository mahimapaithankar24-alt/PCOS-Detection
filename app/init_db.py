from app.database import Base, engine

from app.users.user_models import User
from app.users.profile_models import UserProfile
from app.assessments.assessment_model import PCOSAssessment 


def init_db():
    Base.metadata.create_all(bind=engine)
