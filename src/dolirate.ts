import { ApiLayerConfig, config, DoliConfig } from './config.js'
import { createConnection, Connection, ResultSetHeader } from 'mysql2/promise'
import type { IsoCode } from '@sctg/currencies'

export type Currency =
    {
        basecurrency: IsoCode,
        currency: IsoCode,
        exchangeid: number,
        entity: number,
        fk_user: number
    }

export type Rates = {
    [key in Partial<IsoCode>]: number
}

export type ExchangeRatesResult = {
    "base": IsoCode,
    "date": string,
    "rates": Rates,
    "success": boolean,
    "timestamp": number
}

const log = config.DEBUG ? console.log : function () { }

/**
 * Create a mysql connection with the given config
 * @param config 
 * @returns 
 */
export function getMysqlConnection(config: DoliConfig): Promise<Connection> {
    log(`open MySql connection to ${config.dbhost}`)
    return createConnection({
        password: config.dbpasswd,
        user: config.dbuser,
        database: config.dbname,
        host: config.dbhost
    })
}

/** Query the Dolibarr database for reading the base currency and the currencies used*/
export function getCurrencies(config: DoliConfig): Promise<Currency[]> {
    return new Promise<Currency[]>((resolve, reject) => {
        getMysqlConnection(config).then(connection => {
            const query = `SELECT C.value as basecurrency, M.code as currency, M.rowid as exchangeid, M.entity as entity, M.fk_user as fk_user FROM ${config.dbprefix}const C, ${config.dbprefix}multicurrency M WHERE C.name = 'MAIN_MONNAIE';`
            log(`query: ${query}`)
            connection.query(query).then(res => {
                const currencies = res[0] as Currency[]
                connection.end().then(() => {
                    log(JSON.stringify(currencies, null, 2))
                    resolve(currencies)
                }).catch(err => {
                    reject(err)     //connection.end
                })
            }).catch(err => {
                reject(err) //query
            })
        }).catch(err => {
            reject(err) //getMysqlConnection
        })
    })
}

/**
 * retrieve a comma separated string of all needed currencies
 * @param currencies 
 * @returns 
 */
function parseSymbols(currencies: Currency[]): string {
    let symbols = `${currencies[0].currency}`;
    for (let i = 1; i < currencies.length; i++) {
        symbols += `,${currencies[i].currency}`
    }
    return symbols
}

/**
 * 
 * @param config 
 * @param currencies 
 * @returns retrieve the latest rates from apilayer
 */
export function getApiLayerRates(config: ApiLayerConfig, currencies: Currency[]): Promise<ExchangeRatesResult> {
    const symbols = parseSymbols(currencies)
    const url = new URL(`https://api.apilayer.com/exchangerates_data/latest?base=${currencies[0].basecurrency}&symbols=${symbols}`)
    log(`retrieve rates from apiLayer`)
    return new Promise<ExchangeRatesResult>((resolve, reject) => {
        fetch(url, {
            redirect: 'follow',
            headers: { apikey: config.apikey }
        }).then(response => {
            response.json().then(value => {
                log(`rates:\n${JSON.stringify(value, null, 2)}`)
                resolve(value as ExchangeRatesResult)
            })
        })
    })
}

/**
 * 
 * @param currency 
 * @param currencies 
 * @returns the id of currency
 */
function getCurrencyId(currency: IsoCode, currencies: Currency[]): number | null {
    const retCur = currencies.find(_currency => _currency.currency === currency)
    if (typeof retCur !== "undefined") {
        return retCur.exchangeid
    } else {
        return null
    }
}

/**
 * 
 * @returns a now in Mysql style
 */
function getMysqlNow(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * 
 * @param currencies 
 * @param rates 
 * @returns a string with all values like (dd,ddd),(ee,eee),(ff,fff)
 */
function getRatesValue(currencies: Currency[], rates: Rates) {
    const _rates = Object.getOwnPropertyNames(rates) as Partial<IsoCode>[]
    let values = ''
    const data_sync = getMysqlNow()
    _rates.forEach(_rate => {
        if (_rate !== currencies[0].basecurrency) {
            const fk_multicurrency = getCurrencyId(_rate, currencies)
            const _values = `('${data_sync}',${rates[_rate]},${fk_multicurrency},${currencies[0].entity})`
            values += _values + ','
        }
    });
    return values.substring(0, values.length - 1) + ';'
}

/**
 * Insert the rates into dolibarr db
 * @param config 
 * @param exchangeRatesResult 
 * @param currencies 
 * @returns 
 */
export function insertRatesIntoDolibar(config: DoliConfig,
    exchangeRatesResult: ExchangeRatesResult,
    currencies: Currency[]): Promise<[ResultSetHeader, any]> {

    let query = `INSERT INTO ${config.dbprefix}multicurrency_rate(date_sync, rate, fk_multicurrency, entity) VALUES`
    query += getRatesValue(currencies, exchangeRatesResult.rates)
    log(`${query}`)
    return new Promise<[ResultSetHeader, any]>((resolve, reject) => {
        getMysqlConnection(config).then(connection => {
            const result = connection.query<ResultSetHeader>(query)
            connection.end().then(() => {
                resolve(result)
            }).catch(err => {
                reject(err)
            })
        }).catch(err => {
            reject(err)
        })
    })
}

export function addLiveRatesIntoDolibar(config: DoliConfig, apiconfig: ApiLayerConfig) {
    return new Promise<ResultSetHeader>((resolve, reject) => {
        getCurrencies(config).then(currencies => {
            getApiLayerRates(apiconfig, currencies).then(apiRates => {
                insertRatesIntoDolibar(config, apiRates, currencies).then(result => {
                    resolve(result[0])
                }).catch(err => {
                    reject(err)
                })
            }).catch(err => { reject(err) })
        }).catch(err => {
            reject(err)
        })
    })
}
