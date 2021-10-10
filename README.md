# bywise-node

# enverioment file
```
DB_NAME=blockine
DB_USER=blockine
DB_PASS=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=8080
MY_HOST=http://vps34497.publiccloud.com.br:8080
LIST_HOSTS=["http://vps34407.publiccloud.com.br:8080","http://vps34469.publiccloud.com.br:8080","http://vps34496.publiccloud.com.br:8080","http://vps34497.publiccloud.com.br:8080"]
KEY_PATH=./server.key
CERT_PATH=./server.crt
BSCSCAN_API=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GAS_PRICE=10000000000
API_RPC=XXXXXXXXXXXXXXXXXXX
CREATE_BLOCKS=false
CREATE_SLICES=false
IS_MAINNET=false
SEED=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

# install new instance
```sh
apt-get install git npm docker-compose
git clone https://github.com/DevelBlockchain/bywise-node.git
cd bywise-node/api
npm i
cd ..
nano .env
docker-compose up
```