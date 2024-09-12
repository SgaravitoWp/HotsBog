from flask import Flask, session, abort, redirect, request, render_template
from google_auth_oauthlib.flow import Flow
import google.auth.transport.requests
from pip._vendor import cachecontrol
from google.oauth2 import id_token
from functools import wraps
from configs import config
import requests
import os

app = Flask(__name__, 
            template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "templates"),
            static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "static"),
            static_url_path="/static"
            )

app.config.from_object(config.Config)
app.secret_key = app.config["GOOGLE_CLIENT_SECRET"]

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
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)

@app.route("/callback")
def callback():
    print(request.url)
    print(request.args)
    flow.fetch_token(code=request.args["code"])
    if not session["state"] == request.args["state"]:
        abort(500)
    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)

    id_info = id_token.verify_oauth2_token(
        id_token=credentials.id_token,
        request=token_request,
        audience=app.config["GOOGLE_CLIENT_ID"],
    )

    session["google_id"] = id_info.get("sub")
    session["given_name"] = id_info.get("given_name")
    session["family_name"] = id_info.get("family_name")
    session["picture_link"] = id_info.get("picture")
    return redirect("/home")


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

@app.route("/")
def index():
    return render_template('index.html')

@app.route("/home")
@check_auth
def home():
    return render_template('home.html', **session)

if __name__ == "__main__":
    app.run(debug=True)