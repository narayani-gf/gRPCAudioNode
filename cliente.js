const grpc = require("@grpc/grpc-js")
const protoLoader = require("@grpc/proto-loader")
const dotenv = require('dotenv')
const PROTO_PATH = "./proto/audio.proto";
const portAudio = require('naudiodon');

// Carga la configuración del archivo .env
dotenv.config()

// Carga la implementación del archivo proto para JS
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const audioProto = grpc.loadPackageDefinition(packageDefinition);

// Crea un cliente gRPC
const stub = new audioProto.AudioService(`localhost:${process.env.SERVER_PORT}`, grpc.credentials.createInsecure())

// Reproduce el stream mientras lo descarga
nombre_archivo = 'anyma.wav'
streamAudio(stub, nombre_archivo)

// Función que recibe el stream y lo reproduce mientras lo descarga
function streamAudio(stub, nombre_archivo) {
    // Crea un reproductor de audio como un WritableStream
    var ao = new portAudio.AudioIO({
        outOptions: {
            channelCount: 2,
            sampleFormat: portAudio.SampleFormat16Bit,
            sampleRate: 48000
        }
    });
    
    ao.start();

    console.log(`\nReproduciendo el archivo: ${nombre_archivo}`)

    // Usando el stub, realizamos la llamada streaming RPC
    stub.downloadAudio({
        nombre: nombre_archivo
    }).on('data', (DataChunkResponse) => {
        process.stdout.write('.')
        ao.write(DataChunkResponse.data)
    }).on('end', function(){
        console.log('\nRecepcion de datos correcta.')
    })
}