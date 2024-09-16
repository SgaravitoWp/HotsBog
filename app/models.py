from app import db

class Theft(db.Model):
    """
    Modelo para representar un reporte de hurto en la base de datos.
    
    Atributos:
        id (int): Identificador único del reporte.
        name (str): Nombre de la persona afectada.
        family_name (str): Apellido de la persona afectada.
        email (str): Correo electrónico de la persona afectada.
        date (str): Fecha del hurto en formato de cadena.
        latitude (float): Latitud del lugar del hurto.
        longitude (float): Longitud del lugar del hurto.
        thefts (str): Descripción de los objetos hurtados.
    """
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    family_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    thefts = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        """
        Representación en cadena del objeto Theft.

        Returns:
            str: Representación en cadena del reporte con su id.
        """
        return f'<Report {self.id}>'

    @classmethod
    def create(cls, name, family_name, email, date, latitude, longitude, thefts):
        """
        Crea un nuevo reporte de hurto y lo guarda en la base de datos.

        Args:
            name (str): Nombre de la persona afectada.
            family_name (str): Apellido de la persona afectada.
            email (str): Correo electrónico de la persona afectada.
            date (str): Fecha del hurto en formato de cadena.
            latitude (float): Latitud del lugar del hurto.
            longitude (float): Longitud del lugar del hurto.
            thefts (str): Descripción de los objetos hurtados.
        """
        new_report = cls(
            name=name,
            family_name=family_name,
            email=email,
            date=date,
            latitude=latitude,
            longitude=longitude,
            thefts=thefts
        )
        db.session.add(new_report)
        db.session.commit()
