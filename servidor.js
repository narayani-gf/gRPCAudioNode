const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader")
const dotenv = require('dotenv')
const fs = require('fs')
const PROTO_PATH = "./proto/audio.proto"

// Carga la configuración del archivo .env
dotenv.config()

// Carga la implementación del archivo proto para JS
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const audioProto = grpc.loadPackageDefinition(packageDefinition);

// Crea un servidor gRPC
const server = new grpc.Server();
server.addService(audioProto.AudioService.service, {downloadAudio: downloadAudioImpl});

// Inicia el servidor en el puerto SERVER_PORT
server.bindAsync(`localhost:${process.env.SERVER_PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Servidor gRPC en ejecucion en el puerto ${process.env.SERVER_PORT}`)
});

// Implementación de proto
function downloadAudioImpl(call) {
    // Se crea un stream en chunk de 1024
    const stream = fs.createReadStream(`./recursos/${call.request.nombre}`, {highWaterMark: 1024})

    console.log(`\n\nEnviando el archivo: ${call.request.nombre}`)
    stream.on('data', function (chunk) {
        call.write({data: chunk})
        process.stdout.write('.');
    }).on('end', function() {
        call.end()
        stream.close()
        console.log ('\nEnvio de datos terminado.')
    })
}