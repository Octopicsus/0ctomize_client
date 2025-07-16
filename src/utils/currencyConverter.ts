import axios from "axios";
import { convert } from "./exchangeCurrency";

export interface ExchangeRates {
    [currencyCode: string]: number;
}

export async function getExchangeRates(targetCurrency: string): Promise<ExchangeRates> {
    try {
        const { data } = await axios.get(`https://www.floatrates.com/daily/${targetCurrency.toLowerCase()}.json`);
        
        const rates: ExchangeRates = {};
        rates[targetCurrency.toLowerCase()] = 1;
        
        Object.entries(data).forEach(([currencyCode, currencyData]: [string, any]) => {
            if (currencyData.rate) {
                rates[currencyCode] = 1 / currencyData.rate;
            }
        });
        
        if (targetCurrency.toLowerCase() !== 'pln') {
            try {
                const plnData = await axios.get('https://www.floatrates.com/daily/pln.json');
                const targetInPln = plnData.data[targetCurrency.toLowerCase()];
                if (targetInPln?.rate) {
                    rates['pln'] = targetInPln.rate;
                }
            } catch (plnError) {
                console.warn('Could not fetch PLN rates:', plnError);
            }
        }
        
        return rates;
    } catch (error) {
        throw new Error(`Failed to fetch exchange rates for ${targetCurrency}`);
    }
}

export async function convertAmount(
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
): Promise<number> {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    
    try {
        return await convert(fromCurrency, toCurrency, amount);
    } catch (error) {
        return amount;
    }
}

export function getCurrencySign(currencyCode: string, currencies: any[]): string {
    const currency = currencies.find(curr => curr.code === currencyCode);
    return currency ? currency.sign : currencyCode;
}
