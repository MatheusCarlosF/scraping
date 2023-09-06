const axios = require("axios");
const cheerio = require("cheerio");

const bot = require("./telegramBot"); // Importe o bot do arquivo telegramBot.js

async function fetchData() {
    return await axios.get("https://www.kabum.com.br/ofertas/ofertadodia");
}

const main = async function () {
    const content = await fetchData();
    const $ = cheerio.load(content.data);
    let products = [];
    const kabumProducts = JSON.parse(
        $("#__NEXT_DATA__").text()
    ).props.pageProps.data.listingData.products.data.map((item) => {
        return {
            code: item.code,
            name: item.name,
            price: item.price,
            image: item.image,
            link: `https://www.kabum.com.br/produto/${item.code}`,
        };
    });
    products = [...kabumProducts];

    let currentIndex = 0;

    // Verifica se há pelo menos um produto antes de enviar
    if (products.length > 0) {
        // Define um intervalo de 10 segundos para enviar os produtos
        const intervalId = setInterval(async () => {
            if (currentIndex < products.length) {
                const currentProduct = products[currentIndex];
                const message = `${currentProduct.name}\n\nPreço: *R$ ${currentProduct.price}*\n\nLink: ${currentProduct.link}`;
                // Envie a mensagem com os detalhes do produto atual
                await bot.telegram.sendMessage(1930678813, message, {
                    parse_mode: "Markdown",
                });
                currentIndex++;
            } else {
                // Se todos os produtos foram enviados, encerre o intervalo
                clearInterval(intervalId);
            }
        }, 10000); // 10 segundos em milissegundos
    } else {
        // Se não houver produtos, envie uma mensagem informando
        await bot.telegram.sendMessage(
            1930678813,
            "Não há produtos disponíveis."
        );
    }
};

main();
