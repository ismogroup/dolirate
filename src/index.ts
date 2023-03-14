import cors from 'cors'
import express from 'express'
import { config, doliconfig, apilayerconfig } from './config.js'
import { addLiveRatesIntoDolibar } from './dolirate.js'

const app = express()

app.use(express.json())

app.use(cors())

app.get('/', (req, res) => res.send(`Dolirate v${config.VERSION}`))

app.get('/updaterates', (req, res) => {
    addLiveRatesIntoDolibar(doliconfig, apilayerconfig).then(result=>{
        res.json(result)
    }).catch(err=>{
        res.status(500).send(err)
    })
})

app.listen(config.API_PORT, () => console.log(`Dolirate v${config.VERSION}`))