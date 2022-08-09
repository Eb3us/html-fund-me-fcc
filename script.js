import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.querySelector("#connect-btn")
const fundButton = document.querySelector("#fund-btn")
const withdrawButton = document.querySelector("#withdraw-btn")
const balanceButton = document.querySelector("#get-balance-btn")

connectButton.addEventListener("click", connect)
fundButton.addEventListener("click", fund)
withdrawButton.addEventListener("click", withdraw)
balanceButton.addEventListener("click", getBalance)

console.log(ethers)

window.addEventListener("load", () => {
  const connectionStatus = document.createElement("p")
  connectionStatus.id = "connection_status"
  const body = document.querySelector("body")
  if (!window.ethereum) {
    connectionStatus.innerHTML = "No Metamask Detected"
    body.prepend(connectionStatus)
    return
  } else {
    connectionStatus.innerHTML = "Metamask Detected"
    body.prepend(connectionStatus)
    connectButton.classList.add("btn-allow")
  }
})
async function connect() {
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectButton.classList.add("btn-connected")
    connectButton.classList.remove("btn-allow")
    connectButton.innerHTML = "Connected"
  } catch (error) {
    console.error(error)
  }
}
async function getBalance() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const balance = await provider.getBalance(contractAddress)
  const balanceText = document.querySelector("#balance-text")
  balanceText.innerHTML = `Balance: ${ethers.utils.formatEther(balance)}`
}
async function fund() {
  const ethAmount = document.querySelector("#fund-input").value
  console.log(`Funding with ${ethAmount} ETH...`)
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  try {
    const trasactionResponse = await contract.fund({
      value: ethers.utils.parseEther(ethAmount),
    })
    await listenForTransactionMine(trasactionResponse, provider)
    console.log("Done!")
  } catch (error) {
    console.log(error)
  }
  //
}
async function withdraw() {
  console.log("Withdrawing")
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()
  const contract = new ethers.Contract(contractAddress, abi, signer)
  try {
    const transactionResponse = await contract.withdraw()
    await listenForTransactionMine(transactionResponse, provider)
  } catch (error) {
    console.log(error)
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`)
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      )
      resolve()
    })
  })
}
