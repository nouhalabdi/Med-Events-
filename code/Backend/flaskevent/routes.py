from flask import request, jsonify
from flaskevent import app, db, bcrypt
from flask_login import login_user, logout_user, login_required, current_user
import os  #pdf
from werkzeug.utils import secure_filename
from flask import send_from_directory
from flask_cors import cross_origin

from flaskevent.models import User, Event, EventRegistration, Comment , EventReviewer , GuestSpeaker , ScientificSession , Submission ,SubmissionReview


# AUTH 

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 400

    hashed = bcrypt.generate_password_hash(data['password']).decode("utf-8")
    user = User(username=data['username'], email=data['email'], password=hashed)
    db.session.add(user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Account created successfully!'})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()

    if user and bcrypt.check_password_hash(user.password, data['password']):
        login_user(user)
        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })

    return jsonify({'success': False, 'message': 'Invalid email or password'}), 400


@app.route("/api/logout", methods=["POST"])
def logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})


@app.route("/api/test")
def test():
    return jsonify({'message': 'Server is working!'})


@app.route('/api/check-auth')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user':{
                'id':current_user.id,
                'username':current_user.username,
                'email':current_user.email,
                'role':current_user.role
            }
        })
    else:
        return jsonify({'authenticated': False})
    

@app.route("/api/admin/register", methods=["POST"])
def register_admin():
    if not current_user.is_admin():
        return jsonify({'success': False, 'message': 'Access denied'}), 403




    data = request.get_json()

    if not data or 'username' not in data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'All fields are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'success': False, 'message': 'Email already exists'}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 400

    hashed = bcrypt.generate_password_hash(data['password']).decode("utf-8")
    user = User(username=data['username'], email=data['email'], password=hashed , role = 'organizer')
    db.session.add(user)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Account created successfully!'})

@app.route("/api/admin/organizers", methods=["GET"])
@login_required
def get_organizers():
    if not current_user.is_admin():
        return jsonify({"error": "Access denied"}), 403

    organizers = User.query.filter_by(role="organizer").all()

    return jsonify([
        {
            "id": o.id,
            "username": o.username,
            "email": o.email
        }
        for o in organizers
    ])


# EVENTS 
# Get ALL events
@app.route("/events", methods=["GET"])
def get_events():
    events = Event.query.all()
    return jsonify([
        {
            "id": e.id,
            "title": e.title,
            "description": e.description,
            "details": e.details,
            "date": e.date,
            "creator_id": e.creator_id
        }
        for e in events
    ])

# Create Event (Organizer only)
@app.route("/event", methods=["POST"])
@login_required  
def create_event():
    if current_user.role != "organizer":
        return jsonify({"error": "Only organizers can create events"}), 403

    data = request.json
    event = Event(
        title=data["title"],
        description=data.get("description"),
        details=data.get("details"),
        date=data.get("date"),
        creator_id=current_user.id
    )
    db.session.add(event)
    db.session.commit()
    return jsonify({"message": "Event created!"}), 201

# Update event
@app.route("/event/<int:id>", methods=["PUT"])
@login_required
def update_event(id):
    event = Event.query.get_or_404(id)

    if event.creator_id != current_user.id:
        return jsonify({"error": "You cannot edit this event"}), 403

    data = request.json
    event.title = data["title"]
    event.description = data["description"]
    event.details = data.get("details")
    event.date = data["date"]
    db.session.commit() 

    return jsonify({"message": "Event updated!"})


# Delete event
@app.route("/event/<int:id>", methods=["DELETE"])
@login_required
def delete_event(id):
    event = Event.query.get_or_404(id)

    if event.creator_id != current_user.id:
        return jsonify({"error": "You cannot delete this event"}), 403

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": "Event deleted!"})

# Get single event
@app.route('/event/<int:id>', methods=["GET"])
def get_event(id):
    event = Event.query.get(id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    return jsonify({
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "details": event.details,
        "date": event.date,
        "creator_id": event.creator_id
    })


# 1) Register user for an event
@app.route("/event/<int:event_id>/register", methods=["POST"])
@login_required
def register_event(event_id):
    print("USER:", current_user.is_authenticated)
    if current_user.role == "organizer":
        return jsonify({"error": "Organizers cannot register"}), 403

   
    existing = EventRegistration.query.filter_by(
        user_id=current_user.id,
        event_id=event_id
    ).first()

    if existing:
        return jsonify({"message": "You already registered"}), 200

    registration = EventRegistration(user_id=current_user.id, event_id=event_id ,status="pending",
        payment_status="unpaid")
    db.session.add(registration)
    db.session.commit()

    return jsonify({"message": "Registration submitted successfully!"})



# 2) Get all participants of an event (Organizer only)

@app.route("/event/<int:event_id>/participants")
@login_required
def get_participants(event_id):
    event = Event.query.get(event_id)

    if event.creator_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify([
        {
            "id": r.id,
            "username": r.user.username,
            "email": r.user.email,
            "status": r.status,
            "payment": r.payment_status
        }
        for r in event.registrations
    ])



# 3) Approve participation request
@app.route("/registration/<int:reg_id>/approve", methods=["PUT"])
@login_required
def approve_participant(reg_id):

    reg = EventRegistration.query.get(reg_id)

    # Only event owner can approve registrations
    if reg.event.creator_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    reg.status = "accepted"
    db.session.commit()

    return jsonify({"message": "Participant approved"})


# 4) Reject participation request
@app.route("/registration/<int:reg_id>/reject", methods=["PUT"])
@login_required
def reject_participant(reg_id):

    reg = EventRegistration.query.get(reg_id)

    if reg.event.creator_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    reg.status = "rejected"
    db.session.commit()

    return jsonify({"message": "Participant rejected"})

# 5) Add a comment (text + stars)
@app.route("/event/<int:event_id>/comment", methods=["POST"])
@login_required
def add_comment(event_id):

    data = request.json

    new_comment = Comment(
        user_id=current_user.id,
        event_id=event_id,
        text=data.get("text"),
        rating=data.get("rating")
    )

    db.session.add(new_comment)
    db.session.commit()

    return jsonify({"message": "Comment added!"})

# 6) Get all comments for an event
@app.route("/event/<int:event_id>/comments", methods=["GET"])
def get_comments(event_id):

    comments = Comment.query.filter_by(event_id=event_id).all()

    return jsonify([
        {
            "username": c.user.username,
            "text": c.text,
            "rating": c.rating
        }
        for c in comments
    ])
@app.route("/registration/<int:reg_id>/payment", methods=["PUT"])
@login_required
def update_payment(reg_id):
    reg = EventRegistration.query.get(reg_id)

    if reg.event.creator_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    reg.payment_status = request.json["payment_status"]
    db.session.commit()

    return jsonify({"message": "Payment updated"})
@app.route("/api/my-registrations")
@login_required
def my_regs():
    regs = EventRegistration.query.filter_by(user_id=current_user.id).all()

    return jsonify([
        {
            "event": r.event.title,
            "status": r.status,
            "payment": r.payment_status
        }
        for r in regs
    ])
@app.route("/api/is-participant")
@login_required
def is_participant():
    reg = EventRegistration.query.filter(
        EventRegistration.user_id == current_user.id,
        EventRegistration.status == "accepted"
    ).first()

    return jsonify({
        "isParticipant": bool(reg)
    })


@app.route("/event/<int:event_id>/create-reviewer", methods=["POST"])
@login_required
def create_reviewer(event_id):
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return {"error": "Missing fields"}, 400

    event = Event.query.get_or_404(event_id)

    if event.creator_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    #  FIX: check if email exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return {"error": "Email already exists"}, 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")

    reviewer = User(
        username=username,
        email=email,
        password=hashed,
        role="reviewer"
    )

    db.session.add(reviewer)
    db.session.commit()

    link = EventReviewer(
        event_id=event.id,
        user_id=reviewer.id
    )
    db.session.add(link)
    db.session.commit()

    return {"message": "Reviewer created successfully"}, 201
@app.route("/event/<int:event_id>/reviewers", methods=["GET"])
@login_required
def get_event_reviewers(event_id):
    event = Event.query.get_or_404(event_id)

    reviewers = (
        db.session.query(User)
        .join(EventReviewer, EventReviewer.user_id == User.id)
        .filter(EventReviewer.event_id == event_id)
        .all()
    )

    return jsonify([
        {
            "id": r.id,
            "username": r.username,
            "email": r.email
        }
        for r in reviewers
    ])
@app.route("/event/<int:event_id>/create-session", methods=["POST"])
@login_required
def create_session(event_id):

    if current_user.role != "organizer":
        return {"error": "Unauthorized"}, 403

    event = Event.query.get_or_404(event_id)
    if event.creator_id != current_user.id:
        return {"error": "Access denied"}, 403

    data = request.json
    

    # Guest
    guest_email = data["guest_email"]
    guest_user = User.query.filter_by(email=guest_email).first()

    if not guest_user:
        hashed = bcrypt.generate_password_hash(data["guest_password"]).decode("utf-8")
        guest_user = User(
            username=data["guest_name"],
            email=guest_email,
            password=hashed,
            role="guest"
        )
        db.session.add(guest_user)
        db.session.commit()

    session = ScientificSession(
        event_id=event_id,
        guest_id=guest_user.id,
        submission_id=data.get("submission_id"),
        title=data["title"],
        location=data["location"],
        time=data["time"]
    )

    db.session.add(session)
    db.session.commit()

    return {"message": "Session created successfully"}, 201
@app.route("/event/<int:event_id>/sessions")
def get_event_sessions(event_id):

    sessions = ScientificSession.query.filter_by(event_id=event_id).all()

    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "location": s.location,
            "time": s.time,

            #  guest
            "guest": {
                "username": s.guest.username,
                "email": s.guest.email
            } if s.guest else None,

            # paper (submission)
            "paper": {
                "title": s.submission.title,
                "author": s.submission.user.username,
                "score": s.submission.average_score,
                "pdf": s.submission.pdf_path
            } if s.submission else None
        }
        for s in sessions
    ])

@app.route("/guest/sessions")
@login_required
def guest_sessions():
    if current_user.role != "guest":
        return {"error": "Unauthorized"}, 403

    sessions = ScientificSession.query \
        .join(Event) \
        .filter(ScientificSession.guest_id == current_user.id) \
        .all()

    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "time": s.time,
            "location": s.location,
            "event_title": s.event.title
        }
        for s in sessions
    ])


#submission

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Submit a submission (User and author)

@app.route("/event/<int:event_id>/submission", methods=["POST"])
@login_required
def submit_paper(event_id):


    try:
        title = request.form.get("title")
        abstract = request.form.get("abstract")
        contribution_type = request.form.get("contribution_type")
        payment_status = request.form.get("payment_status")

        pdf = request.files.get("pdf")

        if not pdf:
            return jsonify({"error": "PDF required"}), 400

        if not allowed_file(pdf.filename):
            return jsonify({"error": "Only PDF files allowed"}), 400

        import uuid
        filename = f"{uuid.uuid4()}_{secure_filename(pdf.filename)}"

        upload_folder = app.config.get("UPLOAD_FOLDER")
        if not upload_folder:
            raise Exception("UPLOAD_FOLDER not configured")

        path = os.path.join(upload_folder, filename)
        pdf.save(path)

        submission = Submission(
            title=title,
            abstract=abstract,
            contribution_type=contribution_type,
            pdf_path=filename,
            payment_status=payment_status,
            user_id=current_user.id,
            event_id=event_id
        )

        db.session.add(submission)
        db.session.commit()

        return jsonify({"message": "Submission created"}), 201

    except Exception as e:
        print(" SUBMISSION ERROR:", e)
        return jsonify({"error": str(e)}), 500


# Get submissions for an event (Organizer only)

@app.route("/event/<int:event_id>/submissions", methods=["GET"])
@login_required

def get_submissions(event_id):
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Event not found"}), 404

    if event.creator_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    submissions = [
        {
            "id": s.id,
            "title": s.title,
            "author": s.user.username,
            "abstract": s.abstract,
            "contribution_type": s.contribution_type,
            "pdf_path": s.pdf_path,
            "status": s.status,
            "average": s.average_score,
            "payment_status": s.payment_status,
            "user_username": s.user.username,
            "organizer_approved": s.organizer_approved
        }
        for s in event.submissions
    ]
    return jsonify(submissions)

# Approve submission
@app.route("/submission/<int:sub_id>/approve", methods=["PUT"])
@login_required
def approve_submission(sub_id):
    sub = Submission.query.get(sub_id)
    if sub.event.creator_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    
    sub.organizer_approved = True
    sub.status = "pending"

    user = sub.user
    if user.role == "user":
        user.role = "author"
    db.session.commit()
    return jsonify({
        "message": "Submission approved",
        "submission": {"id": sub.id, "status": sub.status, "organizer_approved": sub.organizer_approved}
    })
#submission payment
@app.route("/submission/<int:id>/payment", methods=["PUT"])
@login_required
def update_submission_payment(id):
    submission = Submission.query.get_or_404(id)

    if current_user.role != "organizer":
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    submission.payment_status = data.get("payment_status")

    db.session.commit()
    return jsonify({"success": True})


# Reject submission
@app.route("/submission/<int:sub_id>/reject", methods=["PUT"])
@login_required
def reject_submission(sub_id):
    sub = Submission.query.get(sub_id)
    if sub.event.creator_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    db.session.delete(sub)
    db.session.commit()
    return jsonify({
        "message": "Submission rejected"
      
    })

# Get my submissions (for Author)
@app.route("/my-submissions", methods=["GET"])
@login_required
def get_my_submissions():
    if current_user.role != 'author':
        return jsonify({"error": "Access denied"}), 403
    subs = Submission.query.filter_by(user_id=current_user.id,organizer_approved= True).all()
    return jsonify([
        {"id": s.id, "title": s.title, "event": {"title": s.event.title}, "status": s.status,"average_score": s.average_score, "pdf_path": s.pdf_path}
        for s in subs
    ])


@app.route('/uploads/submissions/<filename>')
@login_required  
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route("/reviewer/submissions", methods=["GET"])
@login_required
def reviewer_submissions():
    if current_user.role != "reviewer":
        return jsonify({"error": "Unauthorized"}), 403

    event_ids = (
        db.session.query(EventReviewer.event_id)
        .filter(EventReviewer.user_id == current_user.id)
        .subquery()
    )

    subs = Submission.query.filter(
        Submission.event_id.in_(event_ids),
        Submission.organizer_approved == True,
        Submission.status == "pending"
    ).all()

    return jsonify([
    {
        "id": s.id,
        "title": s.title,
        "author": s.user.username,
        "event": {"title": s.event.title},
        "status": s.status,
        "score": s.average_score,
        "pdf_path": s.pdf_path
    }
     for s in subs
    ])

@app.route("/submission/<int:sub_id>/review", methods=["POST"])
@login_required
def review_submission(sub_id):
    if current_user.role != "reviewer":
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    if not data or data.get("score") in [None, ""]:
        return {"error": "Score is required"}, 400

    score = float(data["score"])
    if score < 0 or score > 20:
        return {"error": "Score must be between 0 and 20"}, 400

    sub = Submission.query.get_or_404(sub_id)

    existing = SubmissionReview.query.filter_by(
        submission_id=sub_id,
        reviewer_id=current_user.id
    ).first()

    if existing:
        return {"error": "Already reviewed"}, 400

    review = SubmissionReview(
        submission_id=sub_id,
        reviewer_id=current_user.id,
        score=score
    )

    db.session.add(review)
    db.session.commit()
    avg = sub.average_score
    if avg is not None:
        sub.status = "accepted" if avg >= 10 else "rejected"
    db.session.commit()
    return {
        "message": "Review submitted",
        "average": avg
    }



@app.route("/event/<int:event_id>/accepted-submissions", methods=["GET"])
@login_required
def accepted_submissions(event_id):
    event = Event.query.get_or_404(event_id)

    if event.creator_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    subs = Submission.query.filter_by(
        event_id=event_id,
        status="accepted"
    ).all()

    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "author": s.user.username,
            "average_score": s.average_score,
            "pdf_path": s.pdf_path
        }
        for s in subs
    ])


@app.route("/organizer/event/<int:event_id>/submissions")
@login_required
def organizer_event_submissions(event_id):

    if current_user.role != "organizer":
        return jsonify({"error": "Unauthorized"}), 403

    submissions = Submission.query.filter_by(event_id=event_id).all()

    return jsonify([
        {
            "id": s.id,
            "title": s.title,
            "author": s.user.username,
            "email": s.user.email,
            "contribution_type": s.contribution_type,
            "average_score": s.average_score,
            "pdf_path": s.pdf_path,
            "payment_status": s.payment_status,
            "organizer_approved": s.organizer_approved,
            "status": s.status
        }
        for s in submissions
    ])



@app.route("/event/<int:event_id>/public-submissions")
def public_submissions(event_id):
    sessions = ScientificSession.query.filter_by(event_id=event_id).all()

    return jsonify([
        {
            "title": s.submission.title,
            "author": s.submission.user.username,
            "pdf": s.submission.pdf_path,
            "session": s.title,
            "time": s.time,
            "location": s.location
        }
        for s in sessions if s.submission
    ])
