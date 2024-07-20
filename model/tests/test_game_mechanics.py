import unittest
from flask import Flask
from model.chatbot.game_mchnics_blueprint import game_mchnics_blueprint

class GameMechanicsTestCase(unittest.TestCase):
    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(game_mchnics_blueprint)
        self.client = self.app.test_client()

    def test_process_game_logic(self):
        response = self.client.post('/process_game_logic', json={'user_input': 'play', 'context': ''})
        self.assertEqual(response.status_code, 200)
        self.assertIn('Starting your game based on previous interactions...', response.get_data(as_text=True))

    def test_handle_combat(self):
        response = self.client.post('/handle_combat', json={'user_input': 'attack', 'game_state': {}})
        self.assertEqual(response.status_code, 200)
        self.assertIn('Combat starts! What\'s your first move?', response.get_data(as_text=True))

if __name__ == '__main__':
    unittest.main()
