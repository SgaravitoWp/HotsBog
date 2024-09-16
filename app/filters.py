from datetime import datetime
import pandas as pd
import warnings

# Ignorar posibles alertas
warnings.filterwarnings("ignore")

def set_common_values(thefts, thefts_filter):
    """
    Verifica si hay valores comunes entre dos listas de hurtos.
    
    Args:
        thefts (list): Lista de hurtos.
        thefts_filter (list): Lista de hurtos a filtrar.

    Returns:
        bool: `True` si hay elementos comunes, `False` en caso contrario.
    """
    return bool(set(thefts) & set(thefts_filter))

def filter_data(data, filters):
    """
    Filtra los datos según las fechas y los hurtos especificados en los filtros.

    Args:
        data (list of dicts): Datos a filtrar, donde cada dict representa una fila con una fecha y hurtos.
        filters (dict): Filtros que incluyen `startDate`, `endDate` y `thefts`. `startDate` y `endDate` deben estar en formato '%Y-%m-%d'.

    Returns:
        list of dicts: Datos filtrados, con fechas formateadas en 'día de mes de año'.
    """
    # Convierte los datos en un DataFrame
    df = pd.DataFrame(data)

    # Convierte las fechas en filtros a objetos datetime
    filters["startDate"] = datetime.strptime(filters["startDate"], "%Y-%m-%d")
    filters["endDate"] = datetime.strptime(filters["endDate"], "%Y-%m-%d")
    df["date"] = pd.to_datetime(df["date"])

    # Filtra el DataFrame por el rango de fechas
    date_df = df[(df['date'] >= filters["startDate"]) & (df['date'] <= filters["endDate"])]

    # Filtra el DataFrame por los hurtos especificados
    final_df = date_df[date_df.apply(lambda row: set_common_values(row["thefts"], filters["thefts"]), axis=1)]

    # Formatea las fechas
    final_df.loc[:, "date"] = final_df["date"].apply(lambda date: date.strftime('%d de %B de %Y'))
    
    # Devuelve el DataFrame como una lista de diccionarios
    return final_df.to_dict(orient="records")
