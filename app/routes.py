from flask import session, abort, redirect, jsonify, request, render_template
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
from google.oauth2 import id_token
from .filters import filter_data
from dotenv import load_dotenv
from functools import wraps
from .models import Theft
from app import app
import requests

# Carga las variables de entorno.
load_dotenv()

# Configura el flujo de autenticación de Google OAuth
flow = Flow.from_client_config(
    client_config={
        "web": {
            "client_id": app.config["GOOGLE_CLIENT_ID"],
            "project_id": "hotsbog-flask-app",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": app.config["GOOGLE_CLIENT_SECRET"],
            "redirect_uris": [app.config["REDIRECT_URI"]],
        }
    },
    scopes=[
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
    ],
    redirect_uri = app.config["REDIRECT_URI"]
)

def check_auth(function):
    """
    Decorador para verificar si el usuario está autenticado.

    Args:
        function (function): Función a la que se aplicará el decorador.

    Returns:
        function: Función envuelta que aborta con 401 si no hay sesión, 
                  o ejecuta la función original si la sesión es válida.
    """
    @wraps(function)
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)
        else:
            return function(*args, **kwargs)
    return wrapper

@app.route("/login")
def login():
    """
    Redirige al usuario a la página de autenticación de Google.

    Returns:
        Response: Redirección a la URL de autorización de Google.
    """
    authorization_url, state = flow.authorization_url(prompt='select_account')
    session["state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    """
    Maneja el callback de Google después de la autenticación.

    Returns:
        Response: Redirección a la página de inicio si la autenticación es exitosa,
                  o error si la autenticación falla.
    """
    try:
        flow.fetch_token(code=request.args["code"])
        if session["state"] != request.args["state"]:
            return abort(500, "Invalid state")
        credentials = flow.credentials
    except Exception as e:
        print(f"Error during OAuth callback: {e}")
        return abort(500, "OAuth token error")

    try:
        request_session = requests.session()
        cached_session = cachecontrol.CacheControl(request_session)
        token_request = Request(session=cached_session)

        id_info = id_token.verify_oauth2_token(
            id_token=credentials.id_token,
            request=token_request,
            audience=app.config["GOOGLE_CLIENT_ID"],
            clock_skew_in_seconds=10,
        )
    except ValueError as e:
        print(f"Token verification failed: {e}")
        return abort(401, "Invalid token")

    session["google_id"] = id_info.get("sub")
    session["given_name"] = id_info.get("given_name")
    session["family_name"] = id_info.get("family_name")
    session["email"] = id_info.get("email")
    session["picture_link"] = id_info.get("picture")

    return redirect("/home")

@app.route("/logout")
def logout():
    """
    Cierra la sesión del usuario y redirige a la página de inicio.

    Returns:
        Response: Redirección a la página de inicio.
    """
    session.clear()
    return redirect("/")

@app.route("/")
def index():
    """
    Muestra la página de inicio o redirige a la página de inicio de sesión si el usuario no está autenticado.

    Returns:
        Response: Renderiza la plantilla de inicio o redirige a la página de inicio de sesión.
    """
    if "google_id" not in session:
        return render_template('index.html')
    return redirect("home")

@app.route("/home")
@check_auth
def home():
    """
    Muestra la página de inicio de la aplicación para usuarios autenticados.

    Returns:
        Response: Renderiza la plantilla de inicio con información de sesión.
    """
    return render_template('home.html', **session)

@app.route("/report")
@check_auth
def report():
    """
    Muestra la página de reporte de hurto para usuarios autenticados.

    Returns:
        Response: Renderiza la plantilla de reporte con la clave API de JavaScript de Google Maps.
    """
    return render_template('report.html', maps_javascript_api_key=app.config["MAPS_JAVASCRIPT_API_KEY"])

@app.route("/report-theft", methods=['POST'])
@check_auth
def report_theft():
    """
    Recibe y guarda un nuevo reporte de hurto en la base de datos.

    Returns:
        Response: JSON con el estado de la operación (éxito o error).
    """
    data = request.get_json()
    report_record = {
        "name": session["given_name"],
        "family_name": session["family_name"],
        "email": session["email"],
        "date": data["dateInput"],
        "thefts": ",".join(data["selectedValues"]),
        "latitude": data["latitude"],
        "longitude": data["longitude"]
    }

    try:
        Theft.create(**report_record)
    except:
        return jsonify({"status": "error"}), 500
    else:
        return jsonify({"status": "success"}), 201

@app.route("/fetch-reports", methods=['POST'])
@check_auth
def fetch_reports():
    """
    Recupera y filtra los reportes de hurto según los filtros proporcionados.

    Returns:
        Response: JSON con los reportes filtrados y el estado de la operación (éxito o error).
    """
    filters = request.get_json()
    try:
        reports = Theft.query.all() 
        reports = [{
            "date": report.date,
            "thefts": report.thefts.split(","), 
            "lat": report.latitude,
            "lng": report.longitude,
        }
        for report in reports
        ]
        if reports: 
            data = filter_data(reports, filters)
        else:
            data = reports
    except:
        return jsonify({"status": "error"}), 500
    else:
        return jsonify({"data": data , "status": "success"}), 200

@app.route('/map')
@check_auth
def map():
    """
    Muestra la página del mapa para usuarios autenticados.

    Returns:
        Response: Renderiza la plantilla del mapa con la clave API de JavaScript de Google Maps.
    """
    return render_template('map.html', maps_javascript_api_key=app.config["MAPS_JAVASCRIPT_API_KEY"])

@app.errorhandler(404)
def page_not_found(e):
    """
    Maneja el error 404 - Página no encontrada.

    Returns:
        Response: Renderiza la plantilla de página no encontrada.
    """
    return render_template('not-found.html'), 404

@app.errorhandler(401)
def page_unauthorized(e):
    """
    Maneja el error 401 - No autorizado.

    Returns:
        Response: Renderiza la plantilla de no autorizado.
    """
    return render_template('unauthorized.html'), 401
