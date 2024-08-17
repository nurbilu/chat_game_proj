# game_mchnics_blueprint.py
from flask import Blueprint, request, jsonify

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
        result = roll_dice_logic(dice_type)
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def roll_dice_logic(dice_type):
    import random
    if dice_type == 'd20':
        return random.randint(1, 20)
    # Add more dice types if needed
    return random.randint(1, 6)