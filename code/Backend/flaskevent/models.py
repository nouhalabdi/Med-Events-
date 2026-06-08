
from flaskevent import db, login_manager
from flask_login import UserMixin

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')  # user or organizer

    events = db.relationship("Event", backref="creator", lazy=True)
    def __repr__(self):
        return f"User('{self.username}' , '{self.email}' , '{self.role}')"

    def is_admin(self):
        return self.role == 'admin'
    
    def is_organizer(self):
        return self.role == 'organizer'



class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300))
    details = db.Column(db.Text)
    date = db.Column(db.String(50))

    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    
    registrations = db.relationship("EventRegistration", backref="event", lazy=True)

    
    comments = db.relationship("Comment", backref="event", lazy=True)




class EventRegistration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'))
    status = db.Column(db.String(20), default="pending")
    payment_status = db.Column(db.String(20), default="unpaid")

    user = db.relationship("User")
    
    user = db.relationship("User")





class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"))

    text = db.Column(db.Text)            
    rating = db.Column(db.Integer)      

    user = db.relationship("User")      


class EventReviewer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    user = db.relationship("User", backref="reviewed_events")


class GuestSpeaker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    role = db.Column(db.String(20), default="guest")




class ScientificSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    guest_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    submission_id = db.Column(db.Integer, db.ForeignKey("submission.id"))
    
    title = db.Column(db.String(200))
    location = db.Column(db.String(100))
    time = db.Column(db.String(50))

    event = db.relationship("Event", backref="sessions")
    guest = db.relationship("User", foreign_keys=[guest_id])
    submission = db.relationship("Submission", backref="sessions")


class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    abstract = db.Column(db.Text, nullable=False)
    contribution_type = db.Column(db.String(20), nullable=False)

    pdf_path = db.Column(db.String(200))
    status = db.Column(db.String(20), default="Submitted")
    organizer_approved = db.Column(db.Boolean, default=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)

    payment_status = db.Column(db.String(20), default="unpaid")

    user = db.relationship('User', backref='submissions')
    event = db.relationship('Event', backref='submissions')

    reviews = db.relationship(
    "SubmissionReview",
    backref="submission",
    lazy=True
    )

    @property
    def average_score(self):
        if not self.reviews or len(self.reviews) == 0:
            return None
        return round(
            sum(r.score for r in self.reviews) / len(self.reviews),
            2
        )
class SubmissionReview(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    submission_id = db.Column(
        db.Integer,
        db.ForeignKey("submission.id"),
        nullable=False
    )

    reviewer_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    score = db.Column(db.Float, nullable=False)

    reviewer = db.relationship("User")
