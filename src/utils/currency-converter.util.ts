import { ErrorHandler } from './error-handler.util';

export class CurrencyConverter {
    private ratesCache: Map<string, { rates: any; timestamp: number }> = new Map();
    private cacheDuration = 1800000; // 30 minutes

    private get apiKey(): string {
        const { config } = require('../config/config');
        return config.currencyApi.apiKey;
    }

    private get baseUrl(): string {
        const { config } = require('../config/config');
        return config.currencyApi.baseUrl;
    }

    private async getExchangeRates(baseCurrency: string): Promise<any> {
        const cached = this.ratesCache.get(baseCurrency);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < this.cacheDuration) {
            return cached.rates;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${this.apiKey}/latest/${baseCurrency.toUpperCase()}`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            if (data.result !== 'success') {
                throw new Error(`Exchange rate API error: ${data['error-type'] || 'Unknown'}`);
            }

            this.ratesCache.set(baseCurrency, {
                rates: data.conversion_rates,
                timestamp: now,
            });

            return data.conversion_rates;
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            if (cached) {
                console.warn('Using expired cache due to API failure');
                return cached.rates;
            }
            throw error;
        }
    }

    async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
        const fromUpper = fromCurrency.toUpperCase();
        const toUpper = toCurrency.toUpperCase();

        if (fromUpper === toUpper) return amount;

        try {
            const rates = await this.getExchangeRates(fromUpper);
            const toRate = rates[toUpper];

            if (!toRate) {
                console.warn(`Exchange rate not found for ${toUpper}`);
                return amount;
            }

            return amount * toRate;
        } catch (error) {
            console.error('Currency conversion failed:', error);
            return amount;
        }
    }

    /**
     * Static helper method for converting currency with error handling
     */
    static async convertCurrencyWithFallback(
        amount: number,
        fromCurrency: string,
        toCurrency: string
    ): Promise<number> {
        const converter = new CurrencyConverter();
        try {
            return await converter.convertCurrency(amount, fromCurrency, toCurrency);
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: 'CurrencyConverter',
                method: 'convertCurrencyWithFallback',
                data: { amount, fromCurrency, toCurrency }
            });
            return amount;
        }
    }

    /**
     * Format bank balance with display currency conversions
     */
    static async formatWithDisplayCurrency(bankBalance: any): Promise<any> {
        const result = { ...bankBalance };
        const targetCurrency = bankBalance.displayCurrency || 'KWD';
        
        result.currentBalanceInDisplay = await this.convertCurrencyWithFallback(
            bankBalance.currentBalance || 0,
            bankBalance.currency || targetCurrency,
            targetCurrency
        );

        if (bankBalance.finalBalance !== undefined && bankBalance.finalBalance !== null) {
            result.finalBalanceInDisplay = await this.convertCurrencyWithFallback(
                bankBalance.finalBalance,
                bankBalance.currency || targetCurrency,
                targetCurrency
            );
        }

        return result;
    }
}
