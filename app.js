const puppeteer = require("puppeteer");

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const { scrollHeight } = document.body;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

exports.fetch = async settings => {
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
    const timeLabel = "Browser: ";
    console.time(timeLabel);

    await page.emulate({
      name: "MacBook Pro 2018 1440x900",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
      viewport: {
        deviceScaleFactor: 2,
        width: 1440,
        height: 900
      }
    });
    // await page.setRequestInterception(true);

    const fetchUrl = await page.goto(
      `https://instagram.com/${settings.username}`,
      { waitUntil: "networkidle2" }
    );

    if (fetchUrl.headers().status === "404") {
      return { error: "Page not found" };
    }

    // await page.on("request", req => {
    //   if (
    //     req.resourceType() === "stylesheet" ||
    //     req.resourceType() === "font"
    //   ) {
    //     req.abort();
    //   }
    // });

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
      await autoScroll(page);

      const imageList = await page.evaluate(() => {
        const arr = [];
        // page.waitFor(500);
        const images = [...document.getElementsByTagName("img")];
        images.forEach((img, i) => {
          if (i !== 0 && img && img.naturalWidth >= 250)
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

      console.timeEnd(timeLabel);
      return await imageList;
    } catch (err) {
      console.error(err);
    }
  } catch (err) {
    return await err;
  } finally {
    await browser.close();
  }
};
