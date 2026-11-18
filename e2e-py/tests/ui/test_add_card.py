import allure
from playwright.sync_api import Page, expect

from pages.board_page import BoardPage
from support.expected import TODO

pytestmark = [allure.epic('UI · Playwright'), allure.feature('Add card')]


def test_adds_a_card_on_enter(page: Page, api):
    board = BoardPage(page).open()

    response = board.add_card('To Do', 'New card')

    assert response.status == 201
    page.reload()
    expect(board.cards('To Do')).to_have_text([*TODO, 'New card'])
    assert api.titles('To Do') == [*TODO, 'New card']


def test_does_not_create_a_card_when_cancelled_with_escape(page: Page, api):
    board = BoardPage(page).open()
    creates = []
    page.on(
        'request',
        lambda r: creates.append(r) if r.url.endswith('/api/cards') and r.method == 'POST' else None,
    )

    board.column('To Do').get_by_role('button', name='+').click()
    field = page.get_by_label('New card title for To Do')
    field.fill('Never saved')
    field.press('Escape')

    expect(field).to_be_hidden()
    expect(board.cards('To Do')).to_have_text(TODO)
    assert creates == []
    assert api.titles('To Do') == TODO
