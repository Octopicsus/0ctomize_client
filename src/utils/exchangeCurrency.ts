import axios from "axios";

export async function convert(from: string, to: string, amount: number): Promise<number> {
    const { data } = await axios.get(`https://www.floatrates.com/daily/${from.toLowerCase()}.json`);
    const rate = data[to.toLowerCase()]?.rate;

    if (!rate) throw new Error(`Exchange rate not found for ${from} to ${to}`);

    return Math.round(amount * rate);
}



