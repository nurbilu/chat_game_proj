import os
import json
from pymongo import MongoClient
import pandas as pd
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB

# Fetch data from MongoDB collections
def fetch_data(collection_name):
    return pd.DataFrame(list(db[collection_name].find()))

classes_df = fetch_data('classes')
equipment_df = fetch_data('equipment')
monsters_df = fetch_data('monsters')
races_df = fetch_data('races')
spells_df = fetch_data('spells')
greet_user_prompts_df = fetch_data('greet_user_prompts')
user_inputs_df = fetch_data('user_inputs')
game_styles_df = fetch_data('game_styles')

# Preprocess data
def preprocess_data(df):
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype(str)
    df.fillna('', inplace=True)
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                df[col] = df[col].apply(json.loads)
            except (json.JSONDecodeError, TypeError):
                pass
    return df

classes_df = preprocess_data(classes_df)
equipment_df = preprocess_data(equipment_df)
monsters_df = preprocess_data(monsters_df)
races_df = preprocess_data(races_df)
spells_df = preprocess_data(spells_df)
greet_user_prompts_df = preprocess_data(greet_user_prompts_df)
user_inputs_df = preprocess_data(user_inputs_df)
game_styles_df = preprocess_data(game_styles_df)

# Feature Engineering
def extract_features(df):
    if 'ability_bonuses' in df.columns:
        df['ability_bonuses'] = df['ability_bonuses'].apply(lambda x: sum([bonus['bonus'] for bonus in x]) if isinstance(x, list) else 0)
    return df

races_df = extract_features(races_df)

# Display the first few rows of each dataframe to verify feature extraction
print(races_df.head())

# Save dataframes to MongoDB
def save_to_mongo(collection_name, df):
    collection = db[collection_name]
    if not df.empty:
        collection.delete_many({})
        collection.insert_many(df.to_dict(orient='records'))

save_to_mongo('classes', classes_df)
save_to_mongo('equipment', equipment_df)
save_to_mongo('monsters', monsters_df)
save_to_mongo('races', races_df)
save_to_mongo('spells', spells_df)
save_to_mongo('greet_user_prompts', greet_user_prompts_df)
save_to_mongo('user_inputs', user_inputs_df)
save_to_mongo('game_styles', game_styles_df)
