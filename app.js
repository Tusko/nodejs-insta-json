const puppeteer = require("puppeteer");

exports.fetch = async settings => {
  return new Promise(async (resolve, reject) => {
    if (!settings.username) {
      await reject(Error("Username is missing"));
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--font-render-hinting=none",
        "--enable-font-antialiasing",
        "--disable-setuid-sandbox",
        "--proxy-server='direct://'",
        "--proxy-bypass-list=*",
        "--enable-features=NetworkService"
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

      await page.on("requestfailed", request =>
        reject(Error(request.failure().errorText))
      );

      await page.on("error", err => reject(Error(err)));

      if (fetchUrl.headers().status === "404") {
        await reject(Error("Page not found"));
      }

      if (fetchUrl._url.includes("login")) {
        await reject(Error("Redirected to login page"));
      }

      const _sharedData = await page.evaluate("_sharedData");

      if (!_sharedData) {
        await reject(Error(`Loading error`));
      }
      if (
        _sharedData.entry_data.ProfilePage[0].graphql.user.is_private === true
      ) {
        await reject(Error(`The profile '${settings.username}' is private`));
      }

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

      await resolve(imageList);
    } catch (e) {
      // console.log("\x1b[45m", "App Error", e);
      reject(e);
    } finally {
      await browser.close();
    }
  });
};
