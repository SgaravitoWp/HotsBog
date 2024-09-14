import pandas as pd
from datetime import datetime

def common_values(thefts, thefts_filter):

    thefts = thefts.split(",") 

    return bool(set(thefts) & set(thefts_filter))
    

def filter_data(data, filters):

    df = pd.DataFrame(data)

    filters["startDate"] = datetime.strptime(filters["startDate"], "%Y-%m-%d")
    filters["endDate"] = datetime.strptime(filters["endDate"], "%Y-%m-%d")
    df["date"] = pd.to_datetime(df["date"])

    date_df = df[(df['date'] >= filters["startDate"]) & ( df['date'] <= filters["endDate"])]
    final_df = date_df[date_df.apply(lambda row: common_values(row["thefts"], filters["thefts"]), axis=1)]

    return final_df.to_dict(orient="records")


# data = [
#     {"date": "2024-09-15", "thefts": "Dispositivo Electronico,Bien Monetario,Vehiculo"},
#     {"date": "2024-09-15", "thefts": "Vehiculo,Otros"},
#     {"date": "2024-09-15", "thefts": "Dispositivo Electronico,Bien Monetario,Vehiculo,Otros"},
#     {"date": "2024-09-15", "thefts": "Dispositivo Electronico"},
# ]

    
# filters = {
#     "startDate": "2024-09-12",
#     "endDate": "2024-09-23",
#     "thefts": ["Vehiculo"]
# }
    
# print(filter_data(data, filters))