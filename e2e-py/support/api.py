import allure
import httpx

from support.db import SEEDED_BOARD_ID


class KanbanApi:
    def __init__(self, client: httpx.Client):
        self.client = client

    def board(self, board_id: str = SEEDED_BOARD_ID) -> dict:
        response = self.client.get(f'/boards/{board_id}')
        response.raise_for_status()
        return response.json()

    def column(self, title: str) -> dict:
        return next(c for c in self.board()['columns'] if c['title'] == title)

    def titles(self, column_title: str) -> list[str]:
        return [card['title'] for card in self.column(column_title)['cards']]

    def card_id(self, column_title: str, card_title: str) -> str:
        return next(
            c['id'] for c in self.column(column_title)['cards'] if c['title'] == card_title
        )

    @allure.step('Create a card')
    def create_card(self, body: dict) -> httpx.Response:
        return self.client.post('/cards', json=body)

    @allure.step('Update card {card_id}')
    def update_card(self, card_id: str, body: dict) -> httpx.Response:
        return self.client.patch(f'/cards/{card_id}', json=body)

    @allure.step('Move card {card_id} to index {to_index}')
    def move_card(self, card_id: str, to_column_id: str, to_index: int) -> httpx.Response:
        return self.client.post(
            f'/cards/{card_id}/move',
            json={'toColumnId': to_column_id, 'toIndex': to_index},
        )
