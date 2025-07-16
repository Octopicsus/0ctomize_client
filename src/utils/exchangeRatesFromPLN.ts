import axios from "axios";

export interface ExchangeRates {
    [currencyCode: string]: number;
}

export async function getExchangeRatesFromPLN(targetCurrency: string): Promise<ExchangeRates> {
    try {
        const { data } = await axios.get('https://www.floatrates.com/daily/pln.json');

        const rates: ExchangeRates = {};

        if (targetCurrency.toLowerCase() === 'pln') {
            rates['pln'] = 1;
            Object.entries(data).forEach(([currencyCode, currencyData]: [string, any]) => {
                if (currencyData.rate) {
                    rates[currencyCode] = 1 / currencyData.rate;
                }
            });
        } else {
            const targetRate = data[targetCurrency.toLowerCase()]?.rate;
            if (!targetRate) {
                throw new Error(`Currency ${targetCurrency} not found in PLN rates`);
            }

            rates['pln'] = targetRate;
            rates[targetCurrency.toLowerCase()] = 1;

            Object.entries(data).forEach(([currencyCode, currencyData]: [string, any]) => {
                if (currencyCode !== targetCurrency.toLowerCase() && currencyData.rate) {
                    rates[currencyCode] = (1 / currencyData.rate) * targetRate;
                }
            });
        }

        return rates;
    } catch (error) {
        throw new Error(`Failed to fetch exchange rates for ${targetCurrency}`);
    }
}
