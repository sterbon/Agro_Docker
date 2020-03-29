import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import ecc from 'eosjs-ecc'
import createHash from 'create-hash';
import {
    parseEOS,
    toEOSString,
    notifySuccess
} from '../utils';
var CryptoJS = require("crypto-js");

// const sha512 = data => createHash('sha512').update(data).digest('hex');
// var salt = CryptoJS.lib.WordArray.random(128 / 8);
var salt = CryptoJS.lib.WordArray.create();

const nodeFetch = require('node-fetch');

var currKey = "";
// 5JdPutdYAYWcjZFsYudKMuLUY8xtnvSBvFg8Cgnbdaxg5rC3h2v
const network = {
    blockchain: 'eos',
    chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
    host: 'jungle2.cryptolions.io',
    port: 443,
    keyProvider: 'EOS8QfBmtgZbXpJLDDCtNgf7teKT14wXxDkRYV5iZkNx86WNzUjh5',
    protocol: 'https',
    expireInSeconds: 60,
    broadcast: true,
    verbose: false,
    sign: true
};

// Necessary??
// export const loginHistoryExists = () => !!localStorage.getItem("lastLoginAt");
// const setLoginHistory = () => localStorage.setItem("lastLoginAt", new Date().getTime());

// Retrieving multi-index data
export async function getCropDetailsTable() {
    try {
        const rpc = new JsonRpc(process.env.REACT_APP_EOS_HTTP_ENDPOINT, { nodeFetch });
        const result = await rpc.get_table_rows({
            "json": true,
            "code": "cardgameacc",
            "scope": "cardgameacc",
            "table": "crpdetail",
            "limit": 20,
        });
        // const result = await rpc.get_account('sterbon23451')
        return (result)
    } catch (err) {
        console.error(err);
    }
}

export async function getDetailsByCropId(cropId) {
    try {
        const rpc = new JsonRpc(process.env.REACT_APP_EOS_HTTP_ENDPOINT, { nodeFetch });

        const result = await rpc.get_table_rows({
            "json": true,
            "code": "cardgameacc",
            "scope": "cardgameacc",
            "table": "crpdetail",
            "limit": 1,
            "lower_bound": cropId,
        });
        return result

    } catch (err) {
        console.error(err);
    }
}

export async function getTransactionDetails() {
    try {
        const rpc = new JsonRpc(process.env.REACT_APP_EOS_HTTP_ENDPOINT, { nodeFetch });
        const result = await rpc.get_table_rows({
            "json": true,
            "code": "cardgameacc",
            "scope": "cardgameacc",
            "table": "trxdetail",
        });
        return result
    } catch (err) {
        console.error(err);
    }
}

export async function getAccount(account_name) {
    try {
        const rpc = new JsonRpc(process.env.REACT_APP_EOS_HTTP_ENDPOINT, { nodeFetch });
        // const result = await rpc.get_account('hellokittu15');
        const result = await rpc.get_account(account_name)
        if (result.account_name)
            return true

    } catch (e) {
        console.log(e);
        if (e instanceof RpcError)
            // console.log(JSON.stringify(e.json, null, 2));
            return false
    }
}

//Generating private and public keys
// export const generateKeys = () => {
//     ecc.randomKey().then(x => {
//         var private_key = x;
//         var public_key = ecc.privateToPublic(private_key);
//         console.log(private_key, public_key)
//         return (private_key, public_key)
//     })
// }

// Create new account on jungle Testnet
export const createNewAccount = async (account_name, password, public_key, private_key) => {

    localStorage.clear();
    var owner_publicKey = public_key
    var active_publicKey = public_key

    const signatureProvider = new JsSignatureProvider(['5JpWT4ehouB2FF9aCfdfnZ5AwbQbTtHBAwebRXt94FmjyhXwL4K']);
    const rpc = new JsonRpc(process.env.REACT_APP_EOS_HTTP_ENDPOINT, { nodeFetch });
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

    if (getAccount(account_name)) {
        try {
            const result = await api.transact(
                {
                    actions: [
                        {
                            account: 'eosio',
                            name: 'newaccount',
                            authorization: [
                                {
                                    actor: 'cardgameacc',
                                    permission: 'active',
                                },
                            ],
                            data: {
                                creator: 'cardgameacc',
                                name: account_name,
                                owner: {
                                    threshold: 1,
                                    keys: [
                                        {
                                            key: owner_publicKey,
                                            weight: 1,
                                        },
                                    ],
                                    accounts: [],
                                    waits: [],
                                },
                                active: {
                                    threshold: 1,
                                    keys: [
                                        {
                                            key: active_publicKey,
                                            weight: 1,
                                        },
                                    ],
                                    accounts: [],
                                    waits: [],
                                },
                            },
                        },
                        {
                            account: 'eosio',
                            name: 'buyrambytes',
                            authorization: [
                                {
                                    actor: 'cardgameacc',
                                    permission: 'active',
                                },
                            ],
                            data: {
                                payer: 'cardgameacc',
                                receiver: account_name,
                                bytes: 8192,
                            },
                        },
                        {
                            account: 'eosio',
                            name: 'delegatebw',
                            authorization: [
                                {
                                    actor: 'cardgameacc',
                                    permission: 'active',
                                },
                            ],
                            data: {
                                from: 'cardgameacc',
                                receiver: account_name,
                                stake_net_quantity: '1.0000 EOS',
                                stake_cpu_quantity: '1.0000 EOS',
                                transfer: false,
                            },
                        },
                    ],
                },
                {
                    blocksBehind: 3,
                    expireSeconds: 30,
                }
            );
            console.log('transaction_id is : ', result.transaction_id);
            storeKeys(private_key, account_name, password)
            return result.transaction_id;
        } catch (err) {
            console.log('error is : ___', err);
        }
    }

    else
        return ('Account cannot be created')

};

// Storing pvt keys to local storage 
export const storeKeys = (pvtKey, uName, password) => {

    // localStorage.clear()
    var currPvt = CryptoJS.AES.encrypt(pvtKey, password).toString();

    var passwordKey512Bits = CryptoJS.PBKDF2(password, salt, {
        keySize: 512 / 32
    });
    console.log("PBKDF2", passwordKey512Bits.toString(CryptoJS.enc.Hex));
    var cred = [passwordKey512Bits.toString(CryptoJS.enc.Hex), currPvt];

    localStorage.setItem(uName, JSON.stringify(cred))
    console.log(localStorage)

}

export const login = (username, password) => {
    var storedCred = JSON.parse(localStorage.getItem(username));
    console.log("stored cred=", storedCred);

    let passHash = storedCred[0];

    let pvtHash = storedCred[1];
    var authPasswordKey = CryptoJS.PBKDF2(password, salt, {
        keySize: 512 / 32
    });

    console.log("passHash = ", passHash);
    console.log("authPWKEY = ", authPasswordKey.toString(CryptoJS.enc.Hex));

    if (authPasswordKey.toString(CryptoJS.enc.Hex) === passHash) {
        var bytes = CryptoJS.AES.decrypt(pvtHash, password);
        var originalText = bytes.toString(CryptoJS.enc.Utf8);

        console.log('Logged in!')
        console.log(originalText)
        console.log(Object.entries(localStorage)[0][0])
        currKey = originalText
    }
    else
        console.error("Bad Password")
}

export const logout = (account_name) => {
    if (getAccount(account_name)) {
        logout();
    }
}

// export const sendTokens = ({toAccount, amount, memo}) => {
//     const transactionOptions = { authorization:[`${userAccount.name}@${userAccount.authority}`] };
//     return userEosConnection.transfer(
//         userAccount.name,
//         toAccount,
//         toEOSString(amount),
//         memo,
//         transactionOptions
//     ).then(trx => {
//         return trx.transaction_id;
//     });
// };


// Signing transactions
export async function uploadCrop(data) {
    // const defaultPrivateKey = login(password)
    console.log("Default Private Key:", currKey)
    const userName = Object.entries(localStorage)[0][0]
    console.log(userName)
    // const defaultPrivateKey = localStorage.getItem("privateKey")
    const signatureProvider = new JsSignatureProvider([currKey]);
    const rpc = new JsonRpc(process.env.REACT_APP_EOS_HTTP_ENDPOINT, { nodeFetch });
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

    const result = await api.transact({

        "actions": [
            {
                "account": "cardgameacc",
                "name": "uploadcrop",
                "authorization": [
                    {
                        "actor": userName,
                        "permission": "active"
                    }
                ],
                "data": {
                    "producer": userName,
                    "cropName": data.pname,
                    "cropAmount": data.camount,
                    "imageHash": "QmImageHash",
                    "price": data.price,
                    "dateOfHarvest": data.harvest,
                    "dateOfSow": data.sow,
                    "fertilizers": data.fertilizer
                },
            }]
    },
        {
            "blocksBehind": 3,
            "expireSeconds": 30,
        }).then(notifySuccess('Uploading'));
    console.log("Uploading Result: ", result)
    return result
}

export async function buyCrop(productId) {
    console.log(productId)
    const userName = localStorage.getItem("username")
    const signatureProvider = new JsSignatureProvider([currKey]);
    const rpc = new JsonRpc(process.env.REACT_APP_EOS_HTTP_ENDPOINT, { nodeFetch });
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

    const result = await api.transact({

        "actions": [
            {
                "account": "cardgameacc",
                "name": "buycrop",
                "authorization": [
                    {
                        "actor": userName,
                        "permission": "active"
                    }
                ],
                "data": {
                    "buyer": userName,
                    "cropPid": productId, //is this correct?
                    "price": "1.0000 JUNGLE",
                    "memo": "Buy crop"
                },

            }
        ]
    },
        {
            "blocksBehind": 3,
            "expireSeconds": 30,
        })
    console.log("Buying Result: ", result)
    return result
}