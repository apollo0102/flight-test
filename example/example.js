
/*
 * THESE ARE BASIC EXAMPLES TO INTERACT WITH THE WALLET. 
 * IT IS IMPORTANT TO NOTE, THAT THERE ARE NO ERROR CHECKING IN THESE EXAMPLES
 * THEY JUST GIVE A GOOD HINT AS TO HOW TO INTERACT WITH THE WALLET. 
 * BUT THEY ARE NOT GOOD CODE.
*/

const { ethers, Contract } = require("ethers");
require("dotenv").config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RINKEBY_URL);
const _signer = new ethers.Wallet(process.env.PRIVATE_KEY);
const signer = _signer.connect(provider);


const { abi } = require("../artifacts/contracts/Wallet.sol/Wallet.json"); // abi to use the multi-sig wallet. 
const { bytecode } = require("../artifacts/contracts/Wallet.sol/Wallet.json");

// This is a wallet that was deployed with deployWallet. 
// This is for the example, in reality, it needs to be saved in a database. 
const walletAddress = "0xBC3cca0e8641797e494c948b819E72B082fC2F3B";

// DEPLOYING THE WALLET. When the user clicks the "create new wallet" button. 
// NOTE: This is highly inefficient for production, this is only for this project. 
const deployWallet = async () => {
    const owner1 = signer.address;
    const owner2 = "0xb172f70266cF082EB38C0B7FDE42fe5c8028429A";
    const owners = [owner1, owner2];
    const threshold = 1;
    try {
        const walletFactory = new ethers.ContractFactory(abi, bytecode, signer);
        const wallet = await walletFactory.deploy(owners, threshold);
        // The output of this address needs to be saved in a database, a key - value pair. Key = wallet address, value = owners.
        console.log(`Wallet succesfully created, address -> ${wallet.address}`);
    } catch (e) {
        console.error(e);
    }
}


// This function makes a transaction request.  REMEMBER: A transaction is only sending eth.
const txRequest = async () => {
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    const to = "0x36D77ade43707c7eD9ede3E5f62f19235d7a1d6c";
    const value = ethers.utils.parseEther("0.1");
    try {
        await wallet.transactionRequest(to, value);
        console.log("success");
    } catch (e) {
        console.log(e);
    }

}

//This function approves a transaction. If threshold is met, it executes it.
const txApproval = async () => {
    // owner2 needs to sign this transaction, becuase owner1 already signed the first. 
    const _owner2 = new ethers.Wallet(process.env.OWNER_2_PK);
    const owner2 = _owner2.connect(provider);
    const wallet = new ethers.Contract(walletAddress, abi, owner2);
    // If you check the struct Transaction, it returns = address to, uint256 value, uint256 index, uint256 signatures, bool approved.
    const pendingTransactionsData = await wallet.pendingTransactionsData();
    /*
   struct Transaction {
        address to;
        uint256 value;
        uint256 index;
        uint256 signatures;
        bool approved;
    }
   */
    // Outputs the result of the struct.
    console.log(`pending transactions data --> ${pendingTransactionsData}`);
    const index = 0; //index varies per transaction. 
    try {
        await wallet.transactionApproval(0);
        console.log("success");
    } catch (e) {
        console.log(e);
    }
}

// Request to update the threshold
const updateThresholdRequest = async (newThreshold) => {
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    try {
        await wallet.updatethresholdRequest(newThreshold);
        console.log("success");
    } catch (e) {
        console.log(e);
    }

}

// Approves to update the threshold. There needs to be enough signatures by the owners.
const updateThresholdApproval = async (index) => {
    // owner2 needs to sign this transaction, becuase owner1 already signed the first. 
    const _owner2 = new ethers.Wallet(process.env.OWNER_2_PK);
    const owner2 = _owner2.connect(provider);
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    const pendingUpdateThreshold = await wallet.pendingUpdatethresholdData();
    /*
    struct UpdateThreshold {
        uint256 threshold;
        uint256 index;
        uint256 signatures;
        bool approved;
    }
    */
    // Outputs the result of the struct.
    console.log(`pending update threshold data --> ${pendingUpdateThreshold}`);
    try {
        await wallet.updatethresholdApproval(index);
        console.log("success");
    } catch (e) {
        console.log(e);
    }
}


// request to remove an owner.
const removeOwnerRequest = async (ownerToRemove) => {
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    try {
        await wallet.removeOwnerRequest(ownerToRemove);
        console.log("success");
    } catch (e) {
        console.log(e);
    }
}

// Approves to remove an owner. There needs to be enough signatures by the owners.
const removeOwnerApproval = async (index) => {
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    try {
        await wallet.removeOwnerApproval(index);
        console.log("success");
    } catch (e) {
        console.log(e);
    }
}


// request to add an owner.
const addOwnerRequest = async (ownerToAdd) => {
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    try {
        await wallet.addOwnerRequest(ownerToAdd);
        console.log("success");
    } catch (e) {
        console.log(e);
    }
}

// Approves to add an owner. There needs to be enough signatures by the owners.
const addOwnerApproval = async (index) => {
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    try {
        await wallet.addOwnerApproval(index);
        console.log("success");
    } catch (e) {
        console.log(e);
    }
}

// Basic helper functions and relevant display info for the contract.
const helpers = async () => {
    const wallet = new ethers.Contract(walletAddress, abi, signer);
    const totalOwners = await wallet.totalOwners();
    console.log(`total owners --> ${totalOwners.toString()}`);

    const getOwnersAddres = await wallet.getOwnersAddress();
    console.log(`owner addresses --> ${getOwnersAddres}`);

    const walletBalance = await provider.getBalance(walletAddress);
    console.log(`Wallet's balance --> ${ethers.utils.formatEther(walletBalance)} Eth`);

    const threshold = await wallet.threshold();
    console.log(`threshold --> ${threshold}`);
}
