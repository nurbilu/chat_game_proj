# game_mchnics_blueprint.py
from flask import Blueprint, request, jsonify

game_mchnics_blueprint = Blueprint('game_mchnics', __name__)

# Sample endpoint
@game_mchnics_blueprint.route('/roll_dice', methods=['POST'])
def roll_dice():
    data = request.json
    dice_type = data.get('dice_type', 'd20')
    result = roll_dice_logic(dice_type)
    return jsonify({'result': result})

def roll_dice_logic(dice_type):
    import random
    if dice_type == 'd20':
        return random.randint(1, 20)
    # Add more dice types if needed
    return random.randint(1, 6)
