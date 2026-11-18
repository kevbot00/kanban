import json

import allure
import httpx


def _body(raw: bytes):
    if not raw:
        return None
    try:
        return json.loads(raw)
    except ValueError:
        return raw.decode(errors='replace')


def attach_exchange(response: httpx.Response) -> None:
    request = response.request
    if request.method == 'GET':
        return
    response.read()
    allure.attach(
        json.dumps({'request': _body(request.content), 'response': _body(response.content)}, indent=2),
        name=f'{request.method} {request.url.path} {response.status_code}',
        attachment_type=allure.attachment_type.JSON,
    )


def attach_screenshot(png: bytes) -> None:
    allure.attach(png, name='screenshot', attachment_type=allure.attachment_type.PNG)


def failed(request) -> bool:
    report = getattr(request.node, 'rep_call', None)
    return bool(report and report.failed)
