# payments-ms

Creamos el microservicio desde 0, con el siguiente comando: nest new payments-ms ... seleccionamos el tipo de package manager en este caso usare yarn
Instalamos joi: npm i dotenv joi // yarn add dotenv joi

generar un resource nest g res payments --no-spec para que no genere los archivos de pruebas, generamos un rest api, no crear crud endopint

desarrollo de los endpoint

1. ejecutar `npm run start:dev || yarn start:dev`

#Configuracion de stripe (stripe secret key)
https://dashboard.stripe.com/acct_1StVT2H4RF4RZHjH/test/dashboard
Agregamos la secret key a variables de entorno
instalamos el paquete ene l proyecto npm install stripe --save // yarn add stripe --save
Agregamos stripe al servicio

Crear session de pago
Creamos un pago de prueba, retornardo la url de pago aceptado y visualizamos la transaaccione en stripe