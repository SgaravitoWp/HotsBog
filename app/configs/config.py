import os
from pathlib import Path
from dotenv import load_dotenv

# Carga las variables de entorno.
load_dotenv()

class Config:
    """
    Clase de configuración para la aplicación. Define varias configuraciones 
    necesarias para la autenticación de Google, la base de datos y la API de Google Maps.
    """

    # ID del cliente de Google para autenticación OAuth 2.0
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    
    # Secreto del cliente de Google para autenticación OAuth 2.0
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # URI de redirección para autenticación OAuth 2.0
    REDIRECT_URI = os.getenv("REDIRECT_URI")
    
    # URI de la base de datos SQLite
    # La base de datos se encuentra en la carpeta 'instances' y se llama 'Thefts.db'
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{Path(__file__).resolve().parent.parent / 'instances' / 'Thefts.db'}"
    
    # Clave de API de JavaScript de Google Maps
    MAPS_JAVASCRIPT_API_KEY = os.getenv("MAPS_JAVASCRIPT_API_KEY")
