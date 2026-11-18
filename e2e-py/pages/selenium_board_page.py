import allure
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from support.config import WEB_URL

BOARD = (By.CSS_SELECTOR, "[data-testid='board']")
COLUMN_TITLES = (By.CSS_SELECTOR, "[data-testid='column-title']")
CARD = (By.CSS_SELECTOR, "[data-testid='card']")
COLUMN_LIST = (By.CSS_SELECTOR, "[data-testid='column-list']")
MODAL = (By.CSS_SELECTOR, "[data-testid='card-modal']")
MODAL_TITLE = (By.CSS_SELECTOR, "[data-testid='card-modal-title']")
MODAL_DESCRIPTION = (By.CSS_SELECTOR, "[data-testid='card-modal-description-textarea']")
MODAL_CLOSE = (By.CSS_SELECTOR, "[data-testid='card-modal-close-button']")


class SeleniumBoardPage:
    def __init__(self, driver: WebDriver, timeout: float = 5):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    @allure.step('Open the board')
    def open(self) -> 'SeleniumBoardPage':
        self.driver.get(WEB_URL)
        self.wait.until(EC.visibility_of_element_located(CARD))
        return self

    def column_titles(self) -> list[str]:
        return [el.text for el in self.driver.find_elements(*COLUMN_TITLES)]

    def column(self, title: str) -> WebElement:
        return self.driver.find_element(
            By.XPATH,
            f"//div[@data-testid='column'][h2[@data-testid='column-title' and normalize-space()='{title}']]",
        )

    def card_titles(self, column_title: str) -> list[str]:
        return [el.text for el in self.column(column_title).find_elements(*CARD)]

    @allure.step('Wait for {column_title} to show {expected}')
    def wait_for_cards(self, column_title: str, expected: list[str]) -> None:
        self.wait.until(
            lambda _: self.card_titles(column_title) == expected,
            f'{column_title} never showed {expected}',
        )

    @allure.step("Add '{title}' to {column_title}")
    def add_card(self, column_title: str, title: str) -> None:
        self.column(column_title).find_element(By.XPATH, ".//button[normalize-space()='+']").click()
        field = self.wait.until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, f"input[aria-label='New card title for {column_title}']")
            )
        )
        field.send_keys(title, Keys.ENTER)

    @allure.step("Open '{card_title}'")
    def open_card(self, column_title: str, card_title: str) -> None:
        card = next(
            el for el in self.column(column_title).find_elements(*CARD) if el.text == card_title
        )
        card.click()
        self.wait.until(EC.visibility_of_element_located(MODAL))

    def modal_title(self) -> str:
        return self.driver.find_element(*MODAL_TITLE).text

    def modal_description(self) -> str:
        return self.driver.find_element(*MODAL_DESCRIPTION).get_attribute('value')

    @allure.step('Close the card modal')
    def close_modal(self) -> None:
        self.driver.find_element(*MODAL_CLOSE).click()
        self.wait.until(EC.invisibility_of_element_located(MODAL))

    @allure.step("Drag '{card_title}' from {column_title} to {to_column_title}")
    def drag_card(self, column_title: str, card_title: str, to_column_title: str) -> None:
        card = next(
            el for el in self.column(column_title).find_elements(*CARD) if el.text == card_title
        )
        target = self.column(to_column_title).find_element(*COLUMN_LIST)
        dx = (target.rect['x'] + target.rect['width'] / 2) - (card.rect['x'] + card.rect['width'] / 2)
        dy = (target.rect['y'] + target.rect['height'] / 2) - (card.rect['y'] + card.rect['height'] / 2)

        steps = 20
        actions = ActionChains(self.driver, duration=10)
        actions.move_to_element(card).click_and_hold().pause(0.1)
        actions.move_by_offset(0, 10).pause(0.05)
        for _ in range(steps):
            actions.move_by_offset(dx / steps, (dy - 10) / steps).pause(0.02)
        actions.pause(0.1).release().perform()
