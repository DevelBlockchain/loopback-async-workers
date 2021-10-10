# bywise-node

# enverioment file
```
DB_NAME=blockine
DB_USER=blockine
DB_PASS=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MY_HOST=https://n0.bywise.org
LIST_HOSTS=["https://n0.bywise.org","https://n1.bywise.org","https://n2.bywise.org","https://n3.bywise.org"]
KEY_PATH=./server.key
CERT_PATH=./server.crt
PORT=443
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