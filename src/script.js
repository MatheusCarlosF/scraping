import puppeteer from 'puppeteer';
import bot from './telegramBot.js'

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: false
    });
    const page = await browser.newPage();
    const page2 = await browser.newPage();

    await page.goto("https://www.terabyteshop.com.br/promocoes");
    const data = await page.evaluate(() => {
        const items = [];
    
        const names = document.querySelectorAll('a.prod-name[title]');
        const links = document.querySelectorAll('a.prod-name[href]');
        const prices = document.querySelectorAll('.prod-new-price span');
    
        for (let i = 0; i < names.length; i++) {
            const name = names[i].getAttribute('title');
            const link = links[i].getAttribute('href');
            const price = prices[i].textContent;
    
            items.push({ name, link, price });
        }
    
        return items;
    });
    // console.log(data);
    
    await page2.goto("https://www.kabum.com.br/ofertas/ofertadodia");
    const data2 = await page2.evaluate(() => {
        const nextDataElement = document.getElementById('__NEXT_DATA__');
        const nextDataContent = nextDataElement.textContent;

        const kabumProducts = JSON.parse(nextDataContent).props.pageProps.data.listingData.products.data.map((item) => {
            return {
                code: item.code,
                name: item.name,
                price: `R$ ${item.priceWithDiscount.toFixed(2)}`,
                image: item.image,
                link: `https://www.kabum.com.br/produto/${item.code}`,
            };
        });
        return kabumProducts
    });
    const products = [...data, ...data2];
    // console.log(products)

    await browser.close();
    let currentIndex = 0;

    if (products.length > 0) {
        const intervalId = setInterval(async () => {
            if (currentIndex < products.length) {
                const currentProduct = products[currentIndex];
                const message = `📌 ${currentProduct.name}\n\n💰 Preço: *${currentProduct.price}* À vista \n\n🔗 Link: ${currentProduct.link}`;
                await bot.telegram.sendMessage(-1001897461812, message, {
                    parse_mode: "Markdown",
                });
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, 3000); // 10 segundos em milissegundos
    } else {
        await bot.telegram.sendMessage(
            -1001897461812,
            "Não há produtos disponíveis."
        );
    }
})();

