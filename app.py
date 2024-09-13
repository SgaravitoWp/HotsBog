import app

def main():
    flask_app = app.create_app()
    return flask_app

if __name__ == "__main__":
    flask_app = main()
    flask_app.run(debug=False)  