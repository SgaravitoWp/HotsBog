import app

def main():
    """
    Crea una instancia de la aplicación Flask utilizando la función `create_app` del módulo `app`.

    Returns:
        Flask: La instancia de la aplicación Flask creada.
    """
    flask_app = app.create_app()
    return flask_app

if __name__ == "__main__":
    """
    Punto de entrada principal del script. Crea la instancia de la aplicación Flask y la ejecuta.
    
    La aplicación se ejecuta en modo de depuración desactivado.
    """
    flask_app = main()
    flask_app.run(debug=False)
