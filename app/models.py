from app import db

class Theft(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    family_name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    thefts= db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<Report {self.id}>'

    @classmethod
    def create(cls, name, family_name, email, date, latitude, longitude, thefts):
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