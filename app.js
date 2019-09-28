const puppeteer = require("puppeteer");

exports.fetch = async settings => {
  const timeLabel = "Browser: ";
  console.time(timeLabel);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--font-render-hinting=none",
      "--enable-font-antialiasing",
      "--disable-setuid-sandbox",
      "--proxy-server='direct://'",
      "--proxy-bypass-list=*"
    ],
    sloMo: 0
  });
  const page = await browser.newPage();

  try {
    await page.emulate({
      name: "MacBook Pro 2018 1440x900",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
      viewport: {
        deviceScaleFactor: 2,
        width: 1600,
        height: 1080
      }
    });
    await page.setRequestInterception(true);

    await page.on("request", source => {
      const ends2Ignore = [
        "manifest.json",
        ".png",
        ".ico",
        "/bz",
        "/falco",
        "/logging_client_events"
      ];
      if (ends2Ignore.some(e => source.url().endsWith(e))) source.abort();
      else source.continue();
    });

    const fetchUrl = await page.goto(
      `https://instagram.com/${settings.username}`,
      { waitUntil: "networkidle2" }
    );

    if (fetchUrl.headers().status === "404") {
      return { error: "Page not found" };
    }

    const _sharedData = await page.evaluate("_sharedData");
    if (
      _sharedData.entry_data.ProfilePage[0].graphql.user.is_private === true
    ) {
      return {
        error: `The profile '${settings.username}' is private. Can't fetch images`
      };
    }

    try {
      await page.waitFor(500);

      const imageList = await page.evaluate(() => {
        const arr = [];
        const wrap = document.getElementsByTagName("article");
        const images = [...wrap[0].getElementsByTagName("img")];
        images.forEach(img => {
          if (img && img.naturalWidth >= 250)
            arr.push({
              src: img.src,
              sizes: {
                width: img.naturalWidth,
                height: img.naturalHeight
              }
            });
        });
        return arr;
      });

      return await imageList;
    } catch (err) {
      console.error(err);
    }
  } catch (err) {
    return await err;
  } finally {
    console.timeEnd(timeLabel);
    await browser.close();
  }
  return { error: "Browser error" };
};
