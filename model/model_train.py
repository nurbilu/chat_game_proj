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
classes_df = pd.DataFrame(list(db.classes.find()))
equipment_df = pd.DataFrame(list(db.equipment.find()))
monsters_df = pd.DataFrame(list(db.monsters.find()))
races_df = pd.DataFrame(list(db.races.find()))
spells_df = pd.DataFrame(list(db.spells.find()))
prompts_df = pd.DataFrame(list(db.prompts.find()))  # New collection
user_inputs_df = pd.DataFrame(list(db.user_inputs.find()))  # New collection

# Preprocess data
def preprocess_data(df):
    # Explicitly cast object columns to string before filling NaN values
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype('string')
    df.fillna('', inplace=True)
    # Convert JSON-like strings to dictionaries
    for col in df.columns:
        if df[col].dtype == 'string':
            try:
                df[col] = df[col].apply(eval)
            except:
                pass
    return df

classes_df = preprocess_data(classes_df)
equipment_df = preprocess_data(equipment_df)
monsters_df = preprocess_data(monsters_df)
races_df = preprocess_data(races_df)
spells_df = preprocess_data(spells_df)
prompts_df = preprocess_data(prompts_df)  # Preprocess new collection
user_inputs_df = preprocess_data(user_inputs_df)  # Preprocess new collection

# Feature Engineering
def extract_features(df):
    # Example: Extracting features from the 'ability_bonuses' column in races_df
    if 'ability_bonuses' in df.columns:
        df['ability_bonuses'] = df['ability_bonuses'].apply(lambda x: sum([bonus['bonus'] for bonus in x]) if isinstance(x, list) else 0)
    return df

races_df = extract_features(races_df)

# Display the first few rows of each dataframe to verify feature extraction
print(races_df.head())

# Create character game styles
def create_game_styles():
    warrior_fighter = classes_df[classes_df['name'].isin(['Fighter', 'Barbarian', 'Paladin'])]
    rogue_druid = classes_df[classes_df['name'].isin(['Rogue', 'Druid', 'Ranger'])]
    mage_sorcerer = classes_df[classes_df['name'].isin(['Wizard', 'Sorcerer', 'Warlock'])]

    return {
        "warrior_fighter": warrior_fighter.to_dict(orient='records'),
        "rogue_druid": rogue_druid.to_dict(orient='records'),
        "mage_sorcerer": mage_sorcerer.to_dict(orient='records')
    }

game_styles = create_game_styles()
print(game_styles)

# Serialization
def serialize_data(data, filename):
    with open(filename, 'w') as file:
        json.dump(data, file)

# Deserialization
def deserialize_data(filename):
    with open(filename, 'r') as file:
        return json.load(file)

# Serialize game styles to a JSON file
serialize_data(game_styles, 'game_styles.json')

# Deserialize game styles from the JSON file
loaded_game_styles = deserialize_data('game_styles.json')
print(loaded_game_styles)