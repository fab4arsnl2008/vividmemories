
import os
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Use an absolute path to the file
        file_path = os.path.abspath('gallery.html')
        page.goto(f'file://{file_path}')
        maternity_section = page.locator("#gallery-maternity")
        maternity_section.screenshot(path="jules-scratch/verification/maternity_verification.png")
        engagement_section = page.locator("#gallery-engagement")
        engagement_section.screenshot(path="jules-scratch/verification/engagement_verification.png")
        family_section = page.locator("#gallery-family")
        family_section.screenshot(path="jules-scratch/verification/family_verification.png")
        browser.close()

run()
