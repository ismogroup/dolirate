# Dolirate

Simple update tool for updating Dolibarr currency rates.

## Node 18+ (or 16+ with fetch enable)
You need to define this environment variables.  
|variable|usage|default|
|--------|-----|-------|
|MYSQL_HOST|fqdn of mysql server|mysql|
|MYSQL_PORT|port of the mysql server|3306|
|DOLI_DB_USER|the user with access to the Dolibarr database|mysql|
|DOLI_DB_PASSWORD|the password associated with the user|mysql|
|DOLI_DB_PREFIX|the table prefix|llx_|
|DOLI_DB_NAME|the name of the database|dolismo|
|API_LAYER_KEY|api key for https://apilayer.com/marketplace/exchangerates_data-api|tobefilled|

install the required dependencies and build.  
```sh
npm i && npm run build 
```
Run the Express server.
```sh
node dist/index.cjs
``` 
For updating the currency rates visit http://locahost:3000/updaterates with any method  
```sh 
curl http://localhost:3000/updaterates
```

## Command line
Without running an Express server you can run the tool from the command line.  
Define the same environment variables:  
|variable|usage|default|
|--------|-----|-------|
|MYSQL_HOST|fqdn of mysql server|mysql|
|MYSQL_PORT|port of the mysql server|3306|
|DOLI_DB_USER|the user with access to the Dolibarr database|mysql|
|DOLI_DB_PASSWORD|the password associated with the user|mysql|
|DOLI_DB_PREFIX|the table prefix|llx_|
|DOLI_DB_NAME|the name of the database|dolismo|
|API_LAYER_KEY|api key for https://apilayer.com/marketplace/exchangerates_data-api|tobefilled|

Install and build the app.
```sh
npm i && npm run build
```
Run the tool from the command line.
```sh
node dist/cli.cjs
```

## Docker
This is the easiest way.  
Create an .env file with the required environment variables and run the image.  
```sh
docker run -p 3000:3000 --env-file .vscode/env -it dolirate:latest
```

## Full Docker stack
See docker-compose.yml at https://github.com/ismogroup/dolidock for a complete stack with this tool.  
A simple cron job is set in crontabui:  
```sh
/usr/bin/curl http://dolirate:3000/updaterates
```