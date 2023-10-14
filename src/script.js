import puppeteer from 'puppeteer';
import bot from './telegramBot.js';

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        headless: false
    });
    const page = await browser.newPage();
    await page.goto("https://www.kabum.com.br/ofertas/ofertadodia");
    const data = await page.evaluate(() => {
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
    const products = data;
    
    await browser.close();
    
    let currentIndex = 0;

    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (products.length > 0) {
        const intervalId = setInterval(async () => {
            if (currentIndex < products.length) {
                const currentProduct = products[currentIndex];
                const message = `📌 ${currentProduct.name}\n\n💰 Preço: *${currentProduct.price}* À vista \n\n🔗 Link: ${currentProduct.link}`;
                await bot.telegram.sendMessage(chatId, message, {
                    parse_mode: "Markdown",
                });
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, 3000);
    } else {
        await bot.telegram.sendMessage(
            chatId,
            "Não há produtos disponíveis."
        );
    }
})();

