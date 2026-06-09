from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_cors import CORS
import os

app = Flask(__name__)

app.config['SECRET_KEY'] = 'aef72057d1f7493705dfcf3692802e86'

# database - الجزء المعدل
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    # استخدام PostgreSQL على Render
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # استخدام SQLite محلياً
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, '..', 'mydb.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# uploads
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, '..', 'uploads', 'submissions')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# init extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

db.init_app(app)
bcrypt.init_app(app)
login_manager.init_app(app)

CORS(
    app,
    origins=["http://localhost:5173",
             "https://med-events-2.onrender.com"],
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

from .models import User
from . import routes