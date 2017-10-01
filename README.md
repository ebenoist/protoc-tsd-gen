# tsd-protoc-gen

Output ts definition files based on protocol buffer schemas

## Usage
```
protoc -I . --tsd_out=./tmp/ ./msg.proto --plugin=./bin/protoc-gen-tsd
```
