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

Creamos el DTO payment session
# creamos el dto, e instlamos clas-transformer y class-validator : npm i class-transformer class-validator / yarn add class-transformer class-validator 
Configuramos global pipes en main
Modificamos el servicio para utilizar nuestro dto para el pago

Probamos webhook de stripe
Seguimos la documentacion de stripe para hacer login
https://docs.stripe.com/stripe-cli/install?install-method=windows
No suatenticamos
stripe login
hacemos pruebas del webhook
https://docs.stripe.com/stripe-cli/use-cli
stripe listen --forward-to localhost:3003/payments/webhook
ejecutamos el proceso y lo dejamos en consola
Desde otra consola Con stripe trigger checkout --help vemos todos los eventos disponibles
probamos payment_intent.succeeded
stripe trigger payment_intent.succeeded
Con esto logramos que stripe invoque nuestro metodo

Configuramos main para enviar el body como un buffer
creamos un servicio stripeWebhook para ser invocado desde weebhook

implementar el webhook
y hacemos pruebas


agregamos una validacion al servicio webbook, para identificar el tipo de evento y ejecutar x Accion
finalizamos la configuracion de webhook
Configuramos un forwarder usando hookdeck
creamos las configuraciones dentro del sitio
al crear la coneccion nos retorna url para colocar en stripe (https://hkdk.events/854z3xuvvnir58)

instalamos el CLI de hookdeck en la PC
yarn global add hookdeck-cli
hookdeck login
hookdeck listen [PORT] stripe-to-localhost (donde PORT es el de la aplciacion en este caso 3003)

luego de esto creamo un evento de escucha en stride
nos retorna una secret key y la reemplazamos en el service

una vez configurado porbamos, creamos una session
abrimos link
ahcemos el pago
y chequeamos que se haya ejecuta el evento
https://dashboard.stripe.com/acct_1StVT2H4RF4RZHjH/test/workbench/overview

enviar y recibir el id de la orden
Agregamos el orderId para trasladarlo en la metadata de stripe
hacemo una nueva session pay para probar