from flask import Blueprint, request, jsonify

game_mchnics_blueprint = Blueprint('game_mechanics', __name__)

@game_mchnics_blueprint.route('/process_game_logic', methods=['POST'])
def process_game_logic():
    user_input = request.json['user_input']
    context = request.json['context']
    if "play" in user_input.lower():
        return jsonify("Starting your game based on previous interactions...")
    return jsonify(user_input)

@game_mchnics_blueprint.route('/handle_combat', methods=['POST'])
def handle_combat():
    user_input = request.json['user_input']
    game_state = request.json.get('game_state', {})
    if not game_state.get('combat', False):
        game_state['combat'] = True
        return jsonify("Combat starts! What's your first move?")
    return jsonify("You swing your sword at the enemy!")