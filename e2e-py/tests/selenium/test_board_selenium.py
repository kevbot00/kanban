import allure
from support.expected import BACKLOG, DONE, IN_PROGRESS, TODO

pytestmark = [allure.epic('UI · Selenium'), allure.feature('Board')]


def test_renders_columns_and_cards_in_order(board):
    assert board.column_titles() == ['To Do', 'In Progress', 'Done', 'Backlog']
    assert board.card_titles('To Do') == TODO
    assert board.card_titles('In Progress') == IN_PROGRESS
    assert board.card_titles('Done') == DONE
    assert board.card_titles('Backlog') == BACKLOG


def test_adds_a_card_on_enter(board, driver, api):
    board.add_card('To Do', 'Selenium card')

    board.wait.until(lambda _: api.titles('To Do') == [*TODO, 'Selenium card'])
    driver.refresh()
    board.wait_for_cards('To Do', [*TODO, 'Selenium card'])


def test_opens_a_card_with_its_description(board):
    board.open_card('To Do', TODO[0])

    assert board.modal_title() == TODO[0]
    assert board.modal_description() == 'Persist the board state to localStorage so it is saved.'

    board.close_modal()


def test_moves_a_card_to_another_column(board, api):
    board.drag_card('To Do', TODO[0], 'In Progress')

    board.wait.until(lambda _: api.titles('In Progress') == [TODO[0], *IN_PROGRESS])
    assert api.titles('To Do') == TODO[1:]
    board.wait_for_cards('In Progress', [TODO[0], *IN_PROGRESS])
    board.wait_for_cards('To Do', TODO[1:])
