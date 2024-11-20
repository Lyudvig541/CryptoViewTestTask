import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { useState } from 'react';
import BigNumber from "bignumber.js";
import Web3 from 'web3';

export default function Test() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [showPage,setShowPage] = useState(""); // Default to 18 decimals
  const [balance, setBalance] = useState(null);


  const [transfers, setTransfers] = useState([]);
  const web3 = new Web3('https://sepolia.infura.io/v3/f864adcf545345aa826964f93b39f7a1'); // Replace with your Infura Project ID

  // ERC-20 Token ABI
  const tokenABI = [{"inputs":[{"internalType":"address","name":"safeAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]
  const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);


  const fetchTokenBalance = async () => {
    if (!walletAddress || !tokenAddress) {
      alert('Please enter both wallet address and token address');
      return;
    }

    try {
      // Connect to Ethereum network

      // Create contract instance
      console.log(tokenContract,"tokenContract")
      // Fetch token balance
      console.log(tokenContract.methods,111111)
      await tokenContract.methods.balanceOf(walletAddress).call().then((b)=>{
        setBalance(+(b + "")/10**18);
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
      console.error('Error fetching token balance:', error);
      alert('Failed to fetch token balance. Please check inputs.');
    }
  };

  const fetchTransfers = async () => {
    try {
      const latestBlockBigNumber = await web3.eth.getBlockNumber();

      // Convert latestBlock to BigNumber (using BigNumber.js)
      const latestBlock = new BigNumber(latestBlockBigNumber);

      // Specify the range of blocks to scan for events (scan the last 1000 blocks for performance)
      const startBlock = latestBlock.minus(10);
      console.log(startBlock,"startBlock")

      const startBlockString = startBlock.toString();  // Ensure we pass a valid string for the block range

      const events = await tokenContract.getPastEvents("Transfer", {
        fromBlock: startBlockString, // Correct the fromBlock to string
        toBlock: "latest",
      });

      const sortedEvents = events.sort((a, b) => {
        b.blockNumber - a.blockNumber
      });

      const lastFiveTransfers = sortedEvents.slice(0, 5).map((event) => ({
        from: event.returnValues.from,
        to: event.returnValues.to,
        value: web3.utils.fromWei(event.returnValues.value, "ether"),
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: event.timestamp, // We will add timestamp after fetching the block data
      }));

      for (let i = 0; i < lastFiveTransfers.length; i++) {
        const block = await web3.eth.getBlock(lastFiveTransfers[i].blockNumber);
        lastFiveTransfers[i].timestamp = new Date(block.timestamp * 1000).toLocaleString(); // Convert to human-readable timestamp
      }

      setTransfers(lastFiveTransfers);
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <>
      <div className="container py-16">

        <div className="flex justify-between text-center mt-3">
          <Card className="bg-[#eeeeee] shadow-xl w-full">
            <CardHeader className="pb-3">
              <CardDescription className="text-xl text-start text-black font-semibold">
                <div className="flex flex-1 justify-between">
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={()=>setShowPage("balance")}>
                  Balance
                </button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={()=>{fetchTransfers(); setShowPage("transfer")}}>
                  Last Transfers
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
        {showPage === "balance" &&
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
              ERC-20 Token Balance Checker
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address:
              </label>
              <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0xYourWalletAddress"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Address:
              </label>
              <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0xYourTokenAddress"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"
              />
            </div>

            {/*<div className="mb-4">*/}
            {/*  <label className="block text-sm font-medium text-gray-700 mb-2">*/}
            {/*    Token Decimals:*/}
            {/*  </label>*/}
            {/*  <input*/}
            {/*      type="number"*/}
            {/*      value={tokenDecimals}*/}
            {/*      onChange={(e) => setTokenDecimals(e.target.value)}*/}
            {/*      placeholder="18"*/}
            {/*      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2"*/}
            {/*  />*/}
            {/*</div>*/}

            <button
                onClick={fetchTokenBalance}
                className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Get Token Balance
            </button>

            {balance !== null && (
                <div className="mt-6 bg-gray-50 border-t border-gray-200 p-4 rounded-md">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Token Balance:
                  </h3>
                  <p className="text-gray-700 mt-1">{balance}</p>
                </div>
            )}
          </div>
        </div>
        }
        {showPage === "transfer" &&
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
                {transfers !== null && (
                    <div className="mt-6 bg-gray-50 border-t border-gray-200 p-4 rounded-md">
                        <h2>Latest Transfers for Contract: {tokenContract}</h2>
                        {transfers.length > 0 ? (
                            <ul>
                              {transfers.map((transfer, index) => (
                                  <li key={index}>
                                    <p><strong>From:</strong> {transfer.from}</p>
                                    <p><strong>To:</strong> {transfer.to}</p>
                                    <p><strong>Value:</strong> {transfer.value} ETH</p>
                                    <p><strong>Transaction Hash:</strong> {transfer.transactionHash}</p>
                                    <hr />
                                  </li>
                              ))}
                            </ul>
                        ) : (
                            <p>No transfers found.</p>
                        )}
                    </div>
                )}
              </div>
            </div>
        }
      </div>
    </>
  );
}
