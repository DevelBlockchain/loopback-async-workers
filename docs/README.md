# Bywise Node

## Account Settings

- Set balance
```json
{
  "name": "setBalance", // Command
  "input": [
    "BWS1TU88437CC2CA0eacBfDDDeCcC5857E7b7cDca235A6", // Address
    "1000" // Value
  ]
}
```

- Add balance
```json
{
  "name": "addBalance", // Command
  "input": [
    "BWS1TU88437CC2CA0eacBfDDDeCcC5857E7b7cDca235A6", // Address
    "1000" // Value
  ]
}
```

- Sub balance
```json
{
  "name": "subBalance", // Command
  "input": [
    "BWS1TU88437CC2CA0eacBfDDDeCcC5857E7b7cDca235A6", // Address
    "1000" // Value
  ]
}
```

- Set Info Address
```json
{
  "name": "setInfo", // Command
  "input": [
    "name", // Field
    "Felipe Martins" // Value
  ]
}
```
Field | Exemple
------------ | ------------
name | Felipe Martins
url | https://info.me/felipe
bio | I am a creator of Bywise...
photo | data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD......
publicKey | 4AAQSkZJRgABAQAASABIAAD4AAQSkZJRgABAQAASABIAAD......

## Config Settings

- Set Config
```json
{
  "name": "setConfig", // Command
  "input": [
    "string", // Value type
    "fee", // Config's name
    "0" // Value
  ]
}
```

Field | Type | Description
------------ | ------------
sizeLimit | string | fee calc
fee | string | fee calc
validator | address | set validator address
adminAddress | address | set admin address
executeLimit | number | Max operations per transaction command

### Fee Setting

Parameters | Description
------------ | ------------
size | tx.data.length
amount | amount in transaction
cost | computational cost
