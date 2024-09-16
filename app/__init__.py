from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import timedelta
from .configs import config
from flask import Flask
import os

# Inicializa las instancias de SQLAlchemy y Flask-Migrate
db = SQLAlchemy()
migrate = Migrate()

# Crea la aplicación Flask
app = Flask(__name__, 
        template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates"),
        static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "static"),
        static_url_path="/static"
        )
"""
Crea la aplicación Flask con las siguientes configuraciones:
- template_folder: Ruta a la carpeta de plantillas.
- static_folder: Ruta a la carpeta de archivos estáticos.
- static_url_path: URL para acceder a los archivos estáticos.
"""

# Configura la aplicación Flask
app.config.from_object(config.Config)
"""
Carga la configuración desde el objeto `Config`.
"""
app.secret_key = app.config["GOOGLE_CLIENT_SECRET"]
"""
Establece la clave secreta para la sesión utilizando el valor de `GOOGLE_CLIENT_SECRET` en la configuración.
"""
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=10)
"""
Configura la duración de la sesión permanente a 10 minutos.
"""

def create_app():
    """
    Crea y configura una instancia de la aplicación Flask.
    
    Inicializa las extensiones `SQLAlchemy` y `Flask-Migrate` con la aplicación.
    Importa los módulos de `models` y `routes`.
    Crea todas las tablas de la base de datos si no existen.
    
    Returns:
        Flask: La instancia de la aplicación Flask configurada.
    """
    db.init_app(app)
    migrate.init_app(app, db)
    
    from app import models
    from app import routes
    
    with app.app_context():
        db.create_all()
    return app
