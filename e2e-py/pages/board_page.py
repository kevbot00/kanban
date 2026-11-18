import allure
from playwright.sync_api import Locator, Page, Response


class BoardPage:
    def __init__(self, page: Page):
        self.page = page
        self.board = page.get_by_test_id('board')

    @allure.step('Open the board')
    def open(self) -> 'BoardPage':
        self.page.goto('/')
        return self

    def column(self, title: str) -> Locator:
        return self.board.get_by_test_id('column').filter(
            has=self.page.get_by_test_id('column-title').get_by_text(title, exact=True)
        )

    def column_list(self, title: str) -> Locator:
        return self.column(title).get_by_test_id('column-list')

    def cards(self, column_title: str) -> Locator:
        return self.column(column_title).get_by_test_id('card')

    @allure.step("Add '{title}' to {column_title}")
    def add_card(self, column_title: str, title: str) -> Response:
        self.column(column_title).get_by_role('button', name='+').click()
        field = self.page.get_by_label(f'New card title for {column_title}')
        field.fill(title)
        with self.page.expect_response(
            lambda r: r.url.endswith('/api/cards') and r.request.method == 'POST'
        ) as info:
            field.press('Enter')
        return info.value

    @allure.step('Drag the card onto the target')
    def drag_card(self, card: Locator, target: Locator) -> Response:
        src, dst = card.bounding_box(), target.bounding_box()
        assert src and dst, 'could not get bounding boxes for drag'
        sx, sy = src['x'] + src['width'] / 2, src['y'] + src['height'] / 2
        ex, ey = dst['x'] + dst['width'] / 2, dst['y'] + dst['height'] / 2

        with self.page.expect_response(
            lambda r: '/api/cards/' in r.url and r.request.method == 'POST'
        ) as info:
            self.page.mouse.move(sx, sy)
            self.page.mouse.down()
            self.page.mouse.move(sx, sy + 10, steps=5)
            self.page.mouse.move(ex, ey, steps=20)
            self.page.mouse.move(ex, ey)
            self.page.mouse.up()
        return info.value
