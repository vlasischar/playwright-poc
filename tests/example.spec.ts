import { test, expect } from "@playwright/test";

const url = "https://the-internet.herokuapp.com";
const goToUrl = async (page, path) => await page.goto(`${url}${path}`);

test("Interacting with elements", async ({ page }) => {
  goToUrl(page, "/checkboxes");
  await page.waitForLoadState("networkidle");

  const checkboxes = page.locator('[type="checkbox"]');
  const firstCheckbox = checkboxes.nth(0);

  await expect(await checkboxes.count()).toEqual(2);
  await expect(firstCheckbox).not.toBeChecked();
  await firstCheckbox.check();
  await expect(firstCheckbox).toBeChecked();
});

test("Windows support", async ({ page, context }) => {
  goToUrl(page, "/windows");

  let [newPage] = await Promise.all([
    context.waitForEvent("page"),
    page.locator('[href="/windows/new"]').click(),
  ]);

  await newPage.waitForLoadState();
  const newWindowElement = newPage.locator("h3");

  expect(newPage.url()).toContain("/windows/new");
  await expect(newWindowElement).toHaveText("New Window");
});

test.describe("Handling Alerts in browser", () => {
  test.beforeEach(async ({ page }) => {
    goToUrl(page, "/javascript_alerts");
  });

  test('Click "OK" on JS Alert', async ({ page }) => {
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toBe("I am a JS Alert");
      dialog.accept();
    });

    const button = page.locator("button >> text=Click for JS Alert");
    await button.click();

    const result = page.locator("#result");
    await expect(result).toHaveText("You successfully clicked an alert");
  });

  test('Click "OK" on JS Confirm', async ({ page }) => {
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toBe("I am a JS Confirm");
      dialog.accept();
    });

    const button = page.locator("button >> text=Click for JS Confirm");
    await button.click();

    const result = page.locator("#result");
    await expect(result).toHaveText("You clicked: Ok");
  });

  test('Click "Cancel" on JS Confirm', async ({ page }) => {
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toBe("I am a JS Confirm");
      dialog.dismiss();
    });

    const button = page.locator("button >> text=Click for JS Confirm");
    await button.click();

    const result = page.locator("#result");
    await expect(result).toHaveText("You clicked: Cancel");
  });

  test("Fill JS Prompt", async ({ page }) => {
    page.on("dialog", (dialog) => {
      expect(dialog.message()).toBe("I am a JS prompt");
      dialog.accept("This is a test text");
    });

    const button = page.locator("button >> text=Click for JS Prompt");
    await button.click();

    const result = page.locator("#result");
    await expect(result).toHaveText("You entered: This is a test text");
  });
});

test("Iframe support", async ({ page }) => {
  goToUrl(page, "/iframe");

  const frame = page.frameLocator("#mce_0_ifr");
  const frameBody = frame.locator("body");

  await frameBody.fill("");
  await frameBody.fill("Some text");

  await expect(frameBody).toHaveText("Some text");
});

test("Waiting for lazy elements", async ({ page }) => {
  goToUrl(page, "/dynamic_loading/2");

  await page.getByText("Start").click();

  const finish = page.locator("#finish");

  // Elements is loading longer then global timeout: 5_000
  await expect(finish).toBeVisible({ timeout: 10_000 });
  await expect(finish).toHaveText("Hello World!");
});

test.use({
  baseURL: "https://reqres.in",
});

test("GET /api/users/2 returns user with correct email and ID", async ({
  request,
}) => {
  const response = await request.get("/api/users/2");

  await expect(response).toBeOK();

  const body = await response.json();

  const { email, id } = body.data;
  expect(typeof email).toBe("string");
  expect(typeof id).toBe("number");
  expect(email).toEqual("janet.weaver@reqres.in");
  expect(id).toEqual(2);
});

test("should add elements upon click", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/add_remove_elements/");
  await page.getByRole("button", { name: "Add Element" }).click();
  await page.getByRole("button", { name: "Add Element" }).click();
  await page.getByRole("button", { name: "Add Element" }).click();

  const elements = page.locator(".added-manually");
  await expect(elements).toHaveCount(3);
});
test("should remove elements upon click", async ({ page }) => {
  await page.goto("https://the-internet.herokuapp.com/add_remove_elements/");
  await page.getByRole("button", { name: "Add Element" }).click();
  await page.getByRole("button", { name: "Add Element" }).click();
  await page.getByRole("button", { name: "Add Element" }).click();

  const elements = page.locator(".added-manually");
  await expect(elements).toHaveCount(3);

  await page.getByRole("button", { name: "Delete" }).first().click();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await page.getByRole("button", { name: "Delete" }).first().click();
  await expect(elements).toHaveCount(0);
});

test("Check for broken images", async ({ page }) => {
  // Navigate to the Broken Images page
  goToUrl(page, "/broken_images");

  // Find the example div and its child img elements
  const exampleDiv = await page.waitForSelector(".example");
  const images = await exampleDiv.$$("img");

  // Verify that there are three images
  expect(images.length).toBe(3);
  // Loop through each image and check if it's broken
  for (const image of images) {
    const imageStatus = await image.evaluate((img) => img.complete);
    expect(imageStatus).toBe(true);
  }
});

test("Dropdown", async ({ page }) => {
  goToUrl(page, "/dropdown");
  const optionTexts = ["Please select an option", "Option 1", "Option 2"];

  const dropdown = await page.waitForSelector("#dropdown");
  const options = await dropdown.$$("option");
  expect(options.length).toBe(3);

  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    const text = await option.evaluate((el) => el.textContent);
    expect(text).toBe(optionTexts[i]);
  }
});

test("File download", async ({ page }) => {
  // Navigate to the target webpage
  goToUrl(page, "/download");

  // Find the download link and click it
  // Replace the selector with the appropriate one for the link on your page
  const downloadLinkSelector = 'a[href$=".txt"]'; // This example assumes a link ending with .txt
  await page.click(downloadLinkSelector);

  // Set up a download listener
  const [download] = await Promise.all([
    page.waitForEvent("download"), // Wait for the download event
    page.click(downloadLinkSelector), // Click the download link again
  ]);

  // Specify the download path
  const path = `./downloads/${await download.suggestedFilename()}`;

  // Save the downloaded file
  await download.saveAs(path);

  console.log(`File downloaded and saved to: ${path}`);
});

test("Homepage screenshot", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  expect(await page.screenshot()).toMatchSnapshot("pw-homepage.png");
});
