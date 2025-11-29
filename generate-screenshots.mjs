import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';
import http from 'http';

const apps = [
  { name: 'react-state-props', port: 5173 },
  { name: 'context-api', port: 5174 },
  { name: 'redux-toolkit', port: 5175 },
  { name: 'rtk-query', port: 5176 },
  { name: 'zustand', port: 5177 },
  { name: 'recoil', port: 5178 },
  { name: 'jotai', port: 5179 },
];

async function checkServer(port, maxRetries = 30, retryDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          resolve(res.statusCode);
        });
        req.on('error', reject);
        req.setTimeout(500, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      return true;
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
  return false;
}

async function waitForServers() {
  console.log('Checking if all apps are running...\n');
  const checks = apps.map(async (app) => {
    const isRunning = await checkServer(app.port);
    if (isRunning) {
      console.log(`✓ ${app.name} is running on port ${app.port}`);
      return true;
    } else {
      console.error(`✗ ${app.name} is not running on port ${app.port}`);
      return false;
    }
  });

  const results = await Promise.all(checks);
  const allRunning = results.every((result) => result === true);

  if (!allRunning) {
    console.error('\n❌ Some apps are not running. Please start all apps first:');
    console.error('   pnpm -w run preview:all');
    console.error('   or');
    console.error('   make preview\n');
    process.exit(1);
  }

  console.log('\n✓ All apps are running! Starting screenshot generation...\n');
}

async function checkForErrors(page) {
  try {
    // Check for error banners - try multiple selectors
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '[class*="error"]',
      '[class*="Error"]',
      'div:has-text("Failed")',
      'div:has-text("Error")',
    ];
    
    for (const selector of errorSelectors) {
      try {
        const errorBanner = await page.locator(selector).first();
        const isVisible = await errorBanner.isVisible({ timeout: 500 }).catch(() => false);
        if (isVisible) {
          const errorText = await errorBanner.textContent().catch(() => '');
          if (errorText && errorText.trim().length > 0 && 
              (errorText.includes('Failed') || errorText.includes('Error') || errorText.includes('error'))) {
            return `Error banner visible: ${errorText.trim()}`;
          }
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function waitForErrorsToClear(page, maxWaitTime = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    const error = await checkForErrors(page);
    if (!error) {
      // No error found, wait an additional 2 seconds to ensure it's fully cleared
      await page.waitForTimeout(2000);
      return true;
    }
    // Error still visible, wait a bit and check again
    await page.waitForTimeout(500);
  }
  
  // After max wait time, check one more time
  const finalError = await checkForErrors(page);
  if (finalError) {
    return false; // Error still present
  }
  
  // Wait final 2 seconds to ensure it's cleared
  await page.waitForTimeout(2000);
  return true;
}

async function saveScreenshot(page, appName, filename, skipOnError = true) {
  // Always wait for errors to clear before taking screenshot
  // This ensures we never capture error banners in screenshots
  if (skipOnError) {
    const errorsCleared = await waitForErrorsToClear(page, 7000);
    if (!errorsCleared) {
      // Double-check for any remaining errors
      const error = await checkForErrors(page);
      if (error) {
        console.log(`  ⚠ Skipping ${filename} - error still present: ${error}`);
        throw new Error(`Cannot take screenshot - error present: ${error}`);
      }
    }
  }

  const screenshotPath = join(
    process.cwd(),
    'screenshots',
    appName,
    filename
  );
  
  mkdirSync(join(process.cwd(), 'screenshots', appName), {
    recursive: true,
  });

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  console.log(`  ✓ Saved: ${filename}`);
}

async function takeScreenshot(appName, port, browser) {
  const page = await browser.newPage();
  
  try {
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Navigate to the app
    await page.goto(`http://localhost:${port}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Wait for content to load
    await page.waitForTimeout(3000);

    console.log(`\n📸 Taking screenshots for ${appName}...`);

    // 1. Initial state screenshot
    await saveScreenshot(page, appName, '01-initial.png');

    // Add delay before starting operations
    await page.waitForTimeout(3000);

    // 2. Create Post
    console.log('  Creating a new post...');
    let createSuccess = false;
    try {
      // Wait for form to be visible
      await page.waitForSelector('#title', { timeout: 5000 });
      await page.waitForTimeout(1000);
      
      // Fill in the form
      await page.fill('#userId', '1');
      await page.waitForTimeout(300);
      await page.fill('#title', 'Screenshot Test Post');
      await page.waitForTimeout(300);
      await page.fill('#body', 'This is a test post created during screenshot generation to demonstrate the create functionality.');
      
      await page.waitForTimeout(1000);
      
      // Take screenshot of filled form
      await saveScreenshot(page, appName, '02-create-form-filled.png');
      
      // Submit the form
      const createButton = page.locator('button:has-text("Create Post")');
      await createButton.waitFor({ state: 'visible', timeout: 5000 });
      await createButton.click();
      
      // Wait for the post to be created - wait for form to reset or success indicator
      // Increased delay to allow API to complete
      await page.waitForTimeout(5000);
      
      // Wait for any error banners to auto-dismiss (they clear after 2 seconds)
      const errorsCleared = await waitForErrorsToClear(page, 7000);
      
      // Check for persistent errors
      if (!errorsCleared) {
        const error = await checkForErrors(page);
        if (error) {
          throw new Error(error);
        }
      }
      
      // Verify form was reset (indicates success)
      const titleValue = await page.inputValue('#title').catch(() => '');
      if (titleValue === '') {
        createSuccess = true;
        // Take screenshot after creation (errors should be cleared by now)
        await saveScreenshot(page, appName, '03-after-create.png');
      } else {
        throw new Error('Form was not reset after create - operation may have failed');
      }
    } catch (error) {
      console.log(`  ✗ Could not create post: ${error.message}`);
      console.log(`  ⚠ Skipping screenshots for create operation`);
    }

    // Add delay between operations to prevent API rate limiting
    await page.waitForTimeout(3000);

    // 3. Edit Post (only if create was successful or posts exist)
    console.log('  Editing a post...');
    let editSuccess = false;
    try {
      // Wait a bit for posts to load after create
      await page.waitForTimeout(2000);
      
      // Find edit buttons - try multiple selectors
      const editButtons = page.locator('button[aria-label^="Edit post"], button[aria-label*="Edit"]');
      await editButtons.first().waitFor({ state: 'visible', timeout: 5000 });
      
      const count = await editButtons.count();
      
      if (count > 0) {
        // Take screenshot before edit
        await saveScreenshot(page, appName, '03-before-edit.png', false);
        
        // Click edit button
        await editButtons.first().click();
        
        // Wait for edit form to appear
        await page.waitForSelector('#title', { timeout: 5000 });
        await page.waitForTimeout(2000);
        
        // Verify we're in edit mode (form should have existing data)
        const titleValue = await page.inputValue('#title');
        if (!titleValue || titleValue.trim() === '') {
          throw new Error('Edit form did not load with existing data');
        }
        
        // Take screenshot of edit form
        await saveScreenshot(page, appName, '04-edit-form.png');
        
        // Modify the title and body
        await page.fill('#title', 'Updated: Screenshot Test Post');
        await page.waitForTimeout(300);
        await page.fill('#body', 'This post has been updated during screenshot generation to demonstrate the edit functionality.');
        
        await page.waitForTimeout(3000);
        
        // Take screenshot of modified form
        await saveScreenshot(page, appName, '05-edit-form-modified.png');
        
        // Submit the update
        const updateButton = page.locator('button:has-text("Update Post")');
        await updateButton.waitFor({ state: 'visible', timeout: 5000 });
        await updateButton.click();
        
        // Wait for update to complete - increased delay for API
        await page.waitForTimeout(5000);
        
        // Wait for any error banners to auto-dismiss (they clear after 2 seconds)
        const errorsCleared = await waitForErrorsToClear(page, 7000);
        
        // Check for persistent errors - if error persists, skip screenshot
        if (!errorsCleared) {
          const error = await checkForErrors(page);
          if (error) {
            throw new Error(error);
          }
        }
        
        // Verify edit form is closed (indicates success)
        const formVisible = await page.locator('form').first().isVisible().catch(() => false);
        if (!formVisible || !(await page.locator('button:has-text("Update Post")').isVisible().catch(() => false))) {
          editSuccess = true;
          // Take screenshot after update (errors should be cleared by now)
          await saveScreenshot(page, appName, '06-after-edit.png');
        } else {
          throw new Error('Edit form still visible - update may have failed');
        }
      } else {
        console.log('  ⚠ No posts found to edit');
      }
    } catch (error) {
      console.log(`  ✗ Could not edit post: ${error.message}`);
      console.log(`  ⚠ Skipping screenshots for edit operation`);
    }

    // Add delay between operations
    await page.waitForTimeout(3000);

    // 4. Pagination
    console.log('  Testing pagination...');
    try {
      // Wait for pagination to be available
      await page.waitForTimeout(2000);
      
      // Check if pagination exists
      const nextButton = page.locator('button[aria-label="Go to next page"]');
      const isVisible = await nextButton.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isVisible && !(await nextButton.isDisabled())) {
        // Take screenshot before pagination
        await saveScreenshot(page, appName, '07-before-pagination.png', false);
        
        // Click next page
        await nextButton.click();
        await page.waitForTimeout(4000);
        
        // Verify we're on a different page (check if prev button is now enabled)
        const prevButton = page.locator('button[aria-label="Go to previous page"]');
        const prevEnabled = await prevButton.isEnabled().catch(() => false);
        
        if (prevEnabled) {
          // Take screenshot after pagination
          await saveScreenshot(page, appName, '08-after-pagination.png', false);
          
          // Go back to first page
          await prevButton.click();
          await page.waitForTimeout(5000);
        } else {
          throw new Error('Pagination did not work - still on same page');
        }
      } else {
        console.log('  ⚠ Pagination not available or already on last page');
      }
    } catch (error) {
      console.log(`  ✗ Could not test pagination: ${error.message}`);
      console.log(`  ⚠ Skipping screenshots for pagination`);
    }

    // Add delay before delete operation
    await page.waitForTimeout(3000);

    // 5. Delete Post
    console.log('  Deleting a post...');
    try {
      // Wait for posts to load
      await page.waitForTimeout(2000);
      
      // Find delete buttons
      const deleteButtons = page.locator('button[aria-label^="Delete post"]');
      await deleteButtons.first().waitFor({ state: 'visible', timeout: 5000 });
      
      const count = await deleteButtons.count();
      
      if (count > 0) {
        // Set up dialog handler BEFORE clicking delete
        let dialogHandled = false;
        page.once('dialog', async (dialog) => {
          dialogHandled = true;
          await dialog.accept();
        });
        
        // Get initial post count for verification
        const initialPostCount = count;
        
        // Take screenshot before delete
        await saveScreenshot(page, appName, '09-before-delete.png', false);
        
        // Click delete button (will trigger confirmation dialog)
        await deleteButtons.first().click();
        
        // Wait for dialog to appear and be handled
        await page.waitForTimeout(3000);
        
        if (!dialogHandled) {
          throw new Error('Delete confirmation dialog did not appear');
        }
        
        // Wait for deletion to complete - increased delay for API
        await page.waitForTimeout(5000);
        
        // Wait for any error banners to auto-dismiss (they clear after 2 seconds)
        const errorsCleared = await waitForErrorsToClear(page, 7000);
        
        // Check for persistent errors - if error persists, skip screenshot
        if (!errorsCleared) {
          const error = await checkForErrors(page);
          if (error) {
            throw new Error(error);
          }
        }
        
        // Verify post was deleted (check if delete button count decreased)
        const newDeleteButtons = page.locator('button[aria-label^="Delete post"]');
        const newCount = await newDeleteButtons.count();
        
        if (newCount < initialPostCount) {
          // Take screenshot after delete (errors should be cleared by now)
          await saveScreenshot(page, appName, '10-after-delete.png');
        } else {
          throw new Error('Post count did not decrease - deletion may have failed');
        }
      } else {
        console.log('  ⚠ No posts found to delete');
      }
    } catch (error) {
      console.log(`  ✗ Could not delete post: ${error.message}`);
      console.log(`  ⚠ Skipping screenshots for delete operation`);
    }

    // Add delay before dark mode toggle
    await page.waitForTimeout(2000);

    // 6. Dark mode screenshots
    console.log('  Taking dark mode screenshots...');
    try {
      const darkModeButton = page.locator('button[aria-label*="dark mode"], button[aria-label*="Dark mode"], button[aria-label*="Switch"]');
      await darkModeButton.waitFor({ state: 'visible', timeout: 5000 });
      
      await darkModeButton.click();
      await page.waitForTimeout(1500);
      
      // Verify dark mode is active
      const htmlClasses = await page.locator('html').getAttribute('class');
      if (htmlClasses && htmlClasses.includes('dark')) {
        // Take dark mode screenshot
        await saveScreenshot(page, appName, '11-dark-mode.png', false);
        
        // Toggle back to light mode
        await darkModeButton.click();
        await page.waitForTimeout(1000);
      } else {
        throw new Error('Dark mode was not activated');
      }
    } catch (error) {
      console.log(`  ✗ Could not toggle dark mode: ${error.message}`);
      console.log(`  ⚠ Skipping dark mode screenshot`);
    }

    console.log(`✓ Completed screenshots for ${appName}\n`);

  } catch (error) {
    throw error;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('Starting screenshot generation...\n');
  
  // Wait for all servers to be available
  await waitForServers();

  const browser = await chromium.launch({ headless: true });

  let successCount = 0;
  let failCount = 0;

  try {
    for (const app of apps) {
      try {
        await takeScreenshot(app.name, app.port, browser);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to screenshot ${app.name}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✓ Successfully generated screenshots for: ${successCount} apps`);
    if (failCount > 0) {
      console.log(`✗ Failed: ${failCount} apps`);
      process.exit(1);
    } else {
      console.log('✓ All screenshots generated successfully!');
    }
  } catch (error) {
    console.error('Error generating screenshots:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
