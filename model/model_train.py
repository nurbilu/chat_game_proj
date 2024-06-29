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
greet_user_prompts_df = pd.DataFrame(list(db.greet_user_prompts.find()))  # New collection
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
greet_user_prompts_df = preprocess_data(greet_user_prompts_df)  # Preprocess new collection
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

# Save game styles to MongoDB
game_styles_collection = db.game_styles
game_styles_collection.delete_many({})  # Clear the collection
game_styles_collection.insert_many([{"style": style, "classes": classes} for style, classes in game_styles.items()])

# Save other dataframes to MongoDB
def save_to_mongo(collection, df):
    if not df.empty:
        collection.delete_many({})  # Clear the collection
        collection.insert_many(df.to_dict(orient='records'))

save_to_mongo(db.classes, classes_df)
save_to_mongo(db.equipment, equipment_df)
save_to_mongo(db.monsters, monsters_df)
save_to_mongo(db.races, races_df)
save_to_mongo(db.spells, spells_df)
save_to_mongo(db.greet_user_prompts, greet_user_prompts_df)
save_to_mongo(db.user_inputs, user_inputs_df)