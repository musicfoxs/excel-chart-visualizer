#!/usr/bin/env python3
"""
Browser automation script to test the reading assessment dashboard.
Uploads docx files and captures screenshots of all tabs.
"""

import time
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

# File paths
INNOVATION_DIR = Path("/Users/zhuxuankai/myProject/创新")
TRADITIONAL_DIR = Path("/Users/zhuxuankai/myProject/传统")
OUTPUT_DIR = Path("/Users/zhuxuankai/myProject/screenshots")
APP_URL = "http://localhost:5174"

# Create output directory
OUTPUT_DIR.mkdir(exist_ok=True)

def main():
    with sync_playwright() as p:
        # Launch browser in headful mode to see what's happening
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        )
        page = context.new_page()
        
        print("📸 Step 1: Navigating to app...")
        page.goto(APP_URL, wait_until='networkidle')
        time.sleep(2)
        
        # Take initial screenshot
        page.screenshot(path=OUTPUT_DIR / "01_initial_load.png")
        print("✓ Initial screenshot saved")
        
        # Find and click on the 创新组 upload area
        print("\n📸 Step 2: Uploading 创新组 files...")
        
        # Try to find file input for 创新组
        # Look for file input elements
        file_inputs = page.query_selector_all('input[type="file"]')
        print(f"Found {len(file_inputs)} file input elements")
        
        if len(file_inputs) >= 2:
            # Upload to first input (创新组)
            innovation_files = list(INNOVATION_DIR.glob("*.docx"))
            innovation_files_str = [str(f) for f in innovation_files]
            print(f"Uploading {len(innovation_files)} innovation files...")
            
            file_inputs[0].set_input_files(innovation_files_str)
            time.sleep(1)
            
            # Upload to second input (传统组)
            print("\n📸 Step 3: Uploading 传统组 files...")
            traditional_files = list(TRADITIONAL_DIR.glob("*.docx"))
            traditional_files_str = [str(f) for f in traditional_files]
            print(f"Uploading {len(traditional_files)} traditional files...")
            
            file_inputs[1].set_input_files(traditional_files_str)
            time.sleep(2)
        else:
            print("❌ Error: Could not find enough file inputs")
            # Take screenshot for debugging
            page.screenshot(path=OUTPUT_DIR / "error_no_file_inputs.png")
        
        # Wait for charts to render
        print("\n📸 Step 4: Waiting for charts to render...")
        time.sleep(5)
        
        # Take screenshot after upload
        page.screenshot(path=OUTPUT_DIR / "02_after_upload.png")
        print("✓ After upload screenshot saved")
        
        # Define tabs to check
        tabs = [
            {"name": "爱上阅读", "id": "tab1"},
            {"name": "学会阅读", "id": "tab2"},
            {"name": "个体差异", "id": "tab3"},
            {"name": "总体对比", "id": "tab4"}
        ]
        
        # Try to find and click each tab
        print("\n📸 Step 5: Taking screenshots of each tab...")
        
        for i, tab in enumerate(tabs, 1):
            print(f"\nProcessing tab {i}: {tab['name']}")
            
            # Try different selectors for tabs
            # Option 1: By text content
            try:
                tab_element = page.query_selector(f'text="{tab["name"]}"')
                if tab_element:
                    tab_element.click()
                    time.sleep(2)
                    page.screenshot(path=OUTPUT_DIR / f"{i+2}_{tab['name']}.png")
                    print(f"✓ Screenshot saved for {tab['name']}")
            except Exception as e:
                print(f"Could not click tab by text: {e}")
            
            # Option 2: Try by common tab patterns
            # Try button, a, or div with tab text
            selectors = [
                f'button:has-text("{tab["name"]}")',
                f'a:has-text("{tab["name"]}")',
                f'[role="tab"]:has-text("{tab["name"]}")',
                f'.tab:has-text("{tab["name"]}")',
                f'#tab-{i}',
                f'[data-tab="{i}"]'
            ]
            
            for selector in selectors:
                try:
                    element = page.query_selector(selector)
                    if element:
                        element.click()
                        time.sleep(2)
                        page.screenshot(path=OUTPUT_DIR / f"{i+2}_{tab['name']}.png")
                        print(f"✓ Screenshot saved for {tab['name']} via {selector}")
                        break
                except:
                    continue
        
        # Keep browser open for manual inspection
        print("\n✅ All done! Browser will stay open for manual inspection.")
        print(f"📁 Screenshots saved to: {OUTPUT_DIR}")
        
        # Wait before closing
        time.sleep(10)
        
        browser.close()

if __name__ == "__main__":
    main()