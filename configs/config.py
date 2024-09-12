import json
import os


with open(os.path.join(os.path.dirname(__file__), "google_auth.json"), "r") as js:
    google_auth_data = json.load(js)

class Config:

    GOOGLE_CLIENT_ID = google_auth_data.get("web").get("client_id")
    GOOGLE_CLIENT_SECRET = google_auth_data.get("web").get("client_secret")
    REDIRECT_URI = google_auth_data.get("web").get("redirect_uris")[0]