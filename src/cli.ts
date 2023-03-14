import { doliconfig, apilayerconfig } from './config.js'
import { addLiveRatesIntoDolibar } from './dolirate.js'
addLiveRatesIntoDolibar(doliconfig, apilayerconfig).then(result => {
    console.log(JSON.stringify(result, null, 2))
})