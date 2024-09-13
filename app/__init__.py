from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from .configs import config
from flask import Flask

import os

db = SQLAlchemy()
migrate = Migrate()
app = Flask(__name__, 
        template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates"),
        static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "static"),
        static_url_path="/static"
        )

app.config.from_object(config.Config)
app.secret_key = app.config["GOOGLE_CLIENT_SECRET"]


def create_app():

    db.init_app(app)
    migrate.init_app(app, db)

    from app import models
    from app import routes

    with app.app_context():
        db.create_all()
    return app