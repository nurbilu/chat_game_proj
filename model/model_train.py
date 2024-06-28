import pandas as pd

# Load data from CSV files
classes_df = pd.read_csv('model/csvfiles/classes.csv')
equipment_df = pd.read_csv('model/csvfiles/equipment.csv')
monsters_df = pd.read_csv('model/csvfiles/monsters.csv')
races_df = pd.read_csv('model/csvfiles/races.csv')
spells_df = pd.read_csv('model/csvfiles/spells.csv')

# Preprocess data
def preprocess_data(df):
    # Handle missing values
    df.fillna('', inplace=True)
    # Convert JSON-like strings to dictionaries
    for col in df.columns:
        if df[col].dtype == 'object':
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

# Feature Engineering
def extract_features(df):
    # Example: Extracting features from the 'ability_bonuses' column in races_df
    if 'ability_bonuses' in df.columns:
        df['ability_bonuses'] = df['ability_bonuses'].apply(lambda x: sum([bonus['bonus'] for bonus in x]) if isinstance(x, list) else 0)
    return df

races_df = extract_features(races_df)

# Display the first few rows of each dataframe to verify feature extraction
print(races_df.head())
