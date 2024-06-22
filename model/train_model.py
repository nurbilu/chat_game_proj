import os
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.layers import Input, Embedding, LSTM, Dense, Bidirectional, Concatenate
from tensorflow.keras.models import Model
import json
import glob

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

# Function to read jsonl files
def read_jsonl(file_path):
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            data.append(json.loads(line))
    return data

# Function to extract text from jsonl data
def extract_text_from_jsonl(data):
    texts = []
    for entry in data:
        if 'text' in entry:
            texts.append(entry['text'])
        else:
            print(f"Entry without 'text' field: {entry}")  # Debug statement
    return texts

# Clone the repository (if not already cloned)
if not os.path.exists('fireball'):
    os.system('git clone https://github.com/zhudotexe/fireball.git')

# Load all jsonl files
jsonl_files = glob.glob('fireball/*.jsonl')
texts = []

for file in jsonl_files:
    jsonl_data = read_jsonl(file)
    print(f"Processing file: {file}, Number of entries: {len(jsonl_data)}")  # Debug statement
    if jsonl_data:
        print(f"First entry: {jsonl_data[0]}")  # Print the first entry for debugging
    texts.extend(extract_text_from_jsonl(jsonl_data))

# Check if texts list is populated
if not texts:
    raise ValueError("No text data found in the jsonl files.")

# Load structured data from provided CSV files
classes = pd.read_csv('csvfiles/classes.csv')
equipment = pd.read_csv('csvfiles/equipment.csv')
monsters = pd.read_csv('csvfiles/monsters.csv')
races = pd.read_csv('csvfiles/races.csv')
spells = pd.read_csv('csvfiles/spells.csv')

# Preprocess text data
tokenizer = Tokenizer()
tokenizer.fit_on_texts(texts)
total_words = len(tokenizer.word_index) + 1

# Create input sequences
input_sequences = []
for line in texts:
    token_list = tokenizer.texts_to_sequences([line])[0]
    for i in range(1, len(token_list)):
        n_gram_sequence = token_list[:i+1]
        input_sequences.append(n_gram_sequence)

# Check if input_sequences list is populated
if not input_sequences:
    raise ValueError("No input sequences generated from the text data.")

max_sequence_len = max([len(x) for x in input_sequences])
input_sequences = pad_sequences(input_sequences, maxlen=max_sequence_len, padding='pre')
input_sequences = np.array(input_sequences)
xs, labels = input_sequences[:,:-1], input_sequences[:,-1]
ys = tf.keras.utils.to_categorical(labels, num_classes=total_words)

# Generate placeholder structured data for the example
structured_data = np.random.random((input_sequences.shape[0], 10))  # Replace with actual features

# Build the model
text_input = Input(shape=(max_sequence_len-1,), name='text_input')
x = Embedding(total_words, 100, input_length=max_sequence_len-1)(text_input)
x = Bidirectional(LSTM(150, return_sequences=True))(x)
x = Bidirectional(LSTM(100))(x)

structured_input = Input(shape=(10,), name='structured_input')  # Adjust shape based on structured data features
y = Dense(128, activation='relu')(structured_input)
y = Dense(64, activation='relu')(y)

combined = Concatenate()([x, y])
z = Dense(256, activation='relu')(combined)
output = Dense(total_words, activation='softmax')(z)

model = Model(inputs=[text_input, structured_input], outputs=output)
model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
# Save the model to a file named 'dnd_model.h5'
model.save('dnd_model.h5')
