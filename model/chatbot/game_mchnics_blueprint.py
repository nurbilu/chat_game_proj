# game_mchnics_blueprint.py
from flask import Blueprint, request, jsonify
import random

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
        dice_type = data.get('dice_type', 'd20')
        num_dice = data.get('num_dice', 1)
        modifier = data.get('modifier', 0)
        
        dice_size = int(dice_type[1:])
        results = [random.randint(1, dice_size) for _ in range(num_dice)]
        total = sum(results) + modifier
        
        return jsonify({
            'results': results,
            'total': total,
            'modifier': modifier
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500