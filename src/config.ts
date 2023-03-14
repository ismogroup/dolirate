export const config = {
    API_PORT: 3000,
    VERSION: '0.9.0',
    DEBUG: true
  }

export type DoliConfig = {
    dbhost: string;
    dbport: number;
    dbuser: string;
    dbname: string;
    dbpasswd: string;
    dbprefix: string;
}

export type ApiLayerConfig = {
    apikey: string
}

export const doliconfig:DoliConfig = {
    dbhost: typeof process.env.MYSQL_HOST === "undefined" ? 'mysql' : process.env.MYSQL_HOST,
    dbport: typeof process.env.MYSQL_PORT === "undefined" ? 3306 : parseInt(process.env.MYSQL_PORT),
    dbuser: typeof process.env.DOLI_DB_USER === "undefined" ? 'mysql' : process.env.DOLI_DB_USER,
    dbpasswd: typeof process.env.DOLI_DB_PASSWORD === "undefined" ? 'mysql' : process.env.DOLI_DB_PASSWORD,
    dbprefix: typeof process.env.DOLI_DB_PREFIX === "undefined" ? 'llx_' : process.env.DOLI_DB_PREFIX,
    dbname: typeof process.env.DOLI_DB_NAME === "undefined" ? 'dolismo' : process.env.DOLI_DB_NAME,
}

export const apilayerconfig:ApiLayerConfig = {
    apikey: typeof process.env.API_LAYER_KEY === "undefined" ? 'tobefilled' : process.env.API_LAYER_KEY
}