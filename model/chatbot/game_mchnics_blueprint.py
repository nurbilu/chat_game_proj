# game_mchnics_blueprint.py
from flask import Blueprint, request, jsonify
import random
import logging

game_mchnics_blueprint = Blueprint('game_mchnics', __name__)

@game_mchnics_blueprint.route('/fetch_game_data', methods=['POST'])
def fetch_game_data():
    username = request.json['username']
    collections = ['Races', 'Spells', 'Equipment', 'Monsters', 'Classes']
    game_data = {}
    for collection in collections:
        game_data[collection] = json.loads(json_util.dumps(list(db[collection].find())))
    return jsonify(game_data)

# Sample endpoint
@game_mchnics_blueprint.route('/roll_dice', methods=['POST'])
def roll_dice():
    try:
        data = request.json
        logging.info(f"Received roll_dice request with data: {data}")  # Log incoming request data
        dice_types = data.get('dice_types', ['d20'])
        num_dice = data.get('num_dice', [1])
        modifier = data.get('modifier', 0)
        
        results = []
        for dice_type, count in zip(dice_types, num_dice):
            dice_size = int(dice_type[1:])
            results.extend([random.randint(1, dice_size) for _ in range(count)])
        
        total = sum(results) + modifier
        
        return jsonify({
            'results': results,
            'total': total,
            'modifier': modifier
        })
    except Exception as e:
        logging.error(f"Error rolling dice: {e}")
        return jsonify({'error': str(e)}), 500