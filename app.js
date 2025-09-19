// app.js
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

// ====== DOM Elements ======
const connectWalletBtn = document.getElementById("connectWalletBtn");
const connectWalletMetaMaskBtn = document.getElementById("connectWalletMetaMaskBtn");
const continueToDonateBtn = document.getElementById("continueToDonateBtn");

const walletAddressDiv = document.getElementById("walletAddress");
const userWalletAddressDisplay = document.getElementById("userWalletAddress");

let provider;
let signer;
let userAddress = null;

// ====== Utility: Shorten Address ======
function truncateAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// ====== Page Navigation ======
window.showPage = function (pageId) {
  document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".bottom-nav .nav-item").forEach((item) => item.classList.remove("active"));
  const activeNav = [...document.querySelectorAll(".bottom-nav .nav-item")].find((item) =>
    item.getAttribute("onclick").includes(pageId)
  );
  if (activeNav) activeNav.classList.add("active");
};

// ====== Connect Wallet ======
async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not found! Install MetaMask extension.");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    console.log("Connected wallet:", userAddress);

    // Show wallet address
    walletAddressDiv.style.display = "block";
    userWalletAddressDisplay.textContent = truncateAddress(userAddress);

    // Enable continue button
    continueToDonateBtn.disabled = false;

    // Move to wallet page
    showPage("wallet");
  } catch (err) {
    console.error("Wallet connection failed:", err);
    alert("Wallet connection failed: " + err.message);
  }
}

// ====== Button Events ======
connectWalletBtn.addEventListener("click", () => showPage("wallet"));
connectWalletMetaMaskBtn.addEventListener("click", connectWallet);
continueToDonateBtn.addEventListener("click", () => showPage("donate"));

// ====== Auto Load Wallet if Already Connected ======
window.addEventListener("load", async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length > 0) {
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      walletAddressDiv.style.display = "block";
      userWalletAddressDisplay.textContent = truncateAddress(userAddress);
      continueToDonateBtn.disabled = false;
    }
  }
});
