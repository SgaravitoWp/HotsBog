from flask import session, abort, redirect, jsonify, request, render_template
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from pip._vendor import cachecontrol
from google.oauth2 import id_token
from functools import wraps
from .models import Theft
from app import app
import requests
import os

flow = Flow.from_client_secrets_file(
    client_secrets_file=os.path.join(os.path.join(os.path.dirname(os.path.abspath(__file__)), "configs", "google_auth.json")),
    scopes=["https://www.googleapis.com/auth/userinfo.profile", 
            "https://www.googleapis.com/auth/userinfo.email", 
            "openid"],
    redirect_uri=app.config["REDIRECT_URI"]
)

def check_auth(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)
        else:
            return function()
    return wrapper

@app.route("/login")
def login():
    authorization_url, state = flow.authorization_url(prompt='select_account')
    session["state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    flow.fetch_token(code=request.args["code"])
    if not session["state"] == request.args["state"]:
        abort(500)
    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = Request(session=cached_session)

    id_info = id_token.verify_oauth2_token(
        id_token=credentials.id_token,
        request=token_request,
        audience=app.config["GOOGLE_CLIENT_ID"]
    )

    session["google_id"] = id_info.get("sub")
    session["given_name"] = id_info.get("given_name")
    session["family_name"] = id_info.get("family_name")
    session["email"] = id_info.get("email")
    session["picture_link"] = id_info.get("picture")
    return redirect("/home")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/")
def index():
    if "google_id" not in session:
        return render_template('index.html')
    else:
        return redirect("home")

@app.route("/home")
@check_auth
def home():
    return render_template('home.html', **session)

@app.route("/report")
@check_auth
def report():
    return render_template('report.html')

@app.route("/report-data", methods=['POST'])
@check_auth
def report_data():
    data = request.get_json()
    report_record = dict()
    report_record["name"] = session["given_name"]
    report_record["family_name"] = session["family_name"]
    report_record["email"] = session["email"]
    report_record["date"] = data["date_input"]
    report_record["thefts"] = ",".join(data["selected_values"])
    report_record["latitude"] = 3
    report_record["longitude"] = 4

    try:
        Theft.create(**report_record)
    except Exception as e:
        print(e)
        return jsonify({"status": "error"})
    else:
        return jsonify({"status": "success"})

@app.errorhandler(404)
def page_not_found(e):
    return render_template('not_found.html'), 404

@app.errorhandler(401)
def page_unauthorized(e):
    return render_template('unauthorized.html'), 401

