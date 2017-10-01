const pluginPB = require('google-protobuf/google/protobuf/compiler/plugin_pb');

function readIn() {
  let buffer = [];
  let len = 0;

  process.stdin.on('readable', function() {
    let chunk;
    while ((chunk = process.stdin.read())) {
      buffer.push(chunk);
      len += chunk.length;
    }
  });

  return new Promise((fulfill, reject) => {
    process.stdin.on('end', function() {
      fulfill(Buffer.concat(buffer, len));
    });

    process.stdin.on('error', function(e) {
      reject(e);
    });
  });
}

const TYPES = [
  'unknown', // 0
  'number', // 1
  'number', // 2
  'number', // 3
  'number', // 4
  'number', // 5
  'number', // 6
  'number', // 7
  'boolean', // 8
  'string', // 9
  'Object', // 10
  'Object', // 11 // MESSAGE
  'Uint8Array', // 12 // BYTES
  'number', // 13
  'number', // 14 // ENUM
  'number', // 15
  'number', // 16
  'number', // 17
  'number', // 18
];


function buildTSD(descriptor) {
  let contents = '';

  descriptor.getMessageTypeList().forEach((type) => {
    contents += `export interface I${type.getName()} {\n`

    type.getFieldList().forEach((field) => {
      if (field.getType() === 11 || field.getType() === 14) {
        contents += `  ${field.getName()}?: I${field.getTypeName().slice(1)};\n`
      } else {
        contents += `  ${field.getName()}?: ${TYPES[field.getType()]};\n`
      }
    });

    contents += '}\n\n'
  });

  descriptor.getEnumTypeList().forEach((enumType) => {
    contents += `export enum ${enumType.getName()} {\n`

    enumType.getValueList().forEach((value) => {
      contents += `  ${value.getName()} = ${value.getNumber()};\n`
    });

    contents += '}\n\n'
  });

  return contents;
}

readIn().then((buf) => {
  const typedInputBuff = new Uint8Array(buf.length);
  typedInputBuff.set(buf);
  const codeGenRequest = pluginPB.CodeGeneratorRequest.deserializeBinary(typedInputBuff);
  const codeGenResponse = new pluginPB.CodeGeneratorResponse();

  const fileToDescriptor = {};

  codeGenRequest.getProtoFileList().forEach((protoFileDescriptor) => {
    const file = new pluginPB.CodeGeneratorResponse.File();
    file.setName(protoFileDescriptor.getName() + '.d.ts');
    file.setContent(buildTSD(protoFileDescriptor));
    codeGenResponse.addFile(file);
  });


  process.stdout.write(new Buffer(codeGenResponse.serializeBinary()));
});
