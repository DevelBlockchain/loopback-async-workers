# bywise-node

# enverioment file
```
DB_NAME=blockine
DB_USER=blockine
DB_PASS=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=8080
KEY_PATH='./server.key'
CERT_PATH='./server.crt'
BSCSCAN_API='XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
GAS_PRICE='10000000000'
API_RPC=''
MASTER_NODE=true
IS_MAINNET=false
SEED="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

# install dependencies
```sh
cd api/
npm install
```

# start docker
```sh
docker run -d -p 80:80 docker/getting-started
```

# to run
run docker-compose
```sh
docker-compose up
```