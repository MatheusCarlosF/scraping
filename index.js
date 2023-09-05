const axios = require("axios");
const cheerio = require("cheerio");

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
    console.log(`main  products:`, products);
};

main();
