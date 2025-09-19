// ---- Global Constants and Imports ----
// These files must be created separately
import { MYUSDT_ABI } from './abi/myusdtAbi.js';
import { P2P_ABI } from './abi/p2pAbi.js';
import { REFERRAL_SYSTEM_ABI } from './abi/referralSystemAbi.js';

const isMetaMaskInstalled = typeof window.ethereum !== 'undefined';

// ---- Your deployed contract addresses ----
const MYUSDT_CONTRACT_ADDRESS = "0x2AEF42da66D2ef5C88C45953d6FDDc25DE23dd23"; // Test USDT
const P2P_CONTRACT_ADDRESS = "0x6d2945967a622Dc2E4445537f40173b53b303b01";   // Example P2P contract
const REFERRAL_SYSTEM_CONTRACT_ADDRESS = "0x6a8732143cefdcc8c5a7580f69a1e2699ad08c"; // Referral system

const PACKAGE_PRICE_USD = 125;
const P2P_TOKENS_PER_PACKAGE = 2;
const TOTAL_VESTING_DAYS = 430;

let provider, signer, userAddress;
let myusdtContract, p2pContract, referralSystemContract;

// ---- UI Elements ----
const connectWalletBtn = document.getElementById("connectWalletBtn");
const userAddressDisplay = document.getElementById("userAddress");
const allocatedTokensDisplay = document.getElementById("allocatedTokens");
const claimableTokensDisplay = document.getElementById("claimableTokens");
const directReferralsCountDisplay = document.getElementById("directReferralsCount");
const teamReferralsCountDisplay = document.getElementById("teamReferralsCount");
const referralLinkDisplay = document.getElementById("referralLink");
const claimTokensBtn = document.getElementById("claimTokensBtn");
const vestingProgressBar = document.getElementById("vestingProgressBar");
const tokenLockInfoDisplay = document.getElementById("tokenLockInfo");
const claimAwardBtn1 = document.getElementById("claimAwardBtn1");
const claimAwardBtn2 = document.getElementById("claimAwardBtn2");
const claimAwardBtn3 = document.getElementById("claimAwardBtn3");

// ---- Connect Wallet ----
connectWalletBtn.addEventListener("click", async () => {
    if (!isMetaMaskInstalled) {
        alert("Please install MetaMask first!");
        return;
    }

    try {
        await ethereum.request({ method: "eth_requestAccounts" });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        userAddressDisplay.textContent = userAddress;

        // Load contracts
        myusdtContract = new ethers.Contract(MYUSDT_CONTRACT_ADDRESS, MYUSDT_ABI, signer);
        p2pContract = new ethers.Contract(P2P_CONTRACT_ADDRESS, P2P_ABI, signer);
        referralSystemContract = new ethers.Contract(REFERRAL_SYSTEM_CONTRACT_ADDRESS, REFERRAL_SYSTEM_ABI, signer);

        await loadUserData();

    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
});

// ---- Load User Data ----
async function loadUserData() {
    if (!userAddress || !referralSystemContract) return;

    try {
        const userInfo = await referralSystemContract.users(userAddress);

        // struct layout:
        // [0] referrer
        // [1] totalPackages
        // [2] allocatedTokens
        // [3] lastClaimDate
        // [4] lockedUntil

        const allocatedTokens = ethers.utils.formatUnits(userInfo[2], 18);
        allocatedTokensDisplay.textContent = allocatedTokens;

        const lockedUntilTimestamp = userInfo[4].toNumber();
        const nowTimestamp = Math.floor(Date.now() / 1000);

        if (nowTimestamp < lockedUntilTimestamp) {
            const remainingSeconds = lockedUntilTimestamp - nowTimestamp;
            const remainingDays = Math.ceil(remainingSeconds / (60 * 60 * 24));
            tokenLockInfoDisplay.textContent = `Locked for ${TOTAL_VESTING_DAYS} days, ${remainingDays} days remaining.`;

            const passedDays = TOTAL_VESTING_DAYS - remainingDays;
            const progress = Math.min(100, (passedDays / TOTAL_VESTING_DAYS) * 100);
            vestingProgressBar.style.width = `${progress}%`;
            claimTokensBtn.disabled = true;
            claimableTokensDisplay.textContent = "0";

        } else {
            tokenLockInfoDisplay.textContent = "Lock period completed! You can now claim your tokens.";
            vestingProgressBar.style.width = `100%`;

            const hasTokensToClaim = userInfo[2].gt(0);
            if (hasTokensToClaim) {
                claimTokensBtn.disabled = false;
            }

            const vestingPercentagePerInterval = 5; // example
            const totalClaimable = (userInfo[1].toNumber() * P2P_TOKENS_PER_PACKAGE * vestingPercentagePerInterval) / 100;
            claimableTokensDisplay.textContent = totalClaimable;
        }

        // Referral counts
        const directCount = await referralSystemContract.directReferralCount(userAddress);
        const teamCount = await referralSystemContract.teamReferralCount(userAddress);
        directReferralsCountDisplay.textContent = directCount.toString();
        teamReferralsCountDisplay.textContent = teamCount.toString();

        // Referral link
        referralLinkDisplay.textContent = `${window.location.origin}/?ref=${userAddress}`;

        // Awards enable
        if (directCount >= 10) claimAwardBtn1.disabled = false;
        if (teamCount >= 50) claimAwardBtn2.disabled = false;
        if (teamCount >= 250) claimAwardBtn3.disabled = false;

    } catch (error) {
        console.error("Failed to load user data:", error);
    }
}

// ---- Claim Tokens ----
claimTokensBtn.addEventListener("click", async () => {
    try {
        const tx = await referralSystemContract.claimTokens();
        await tx.wait();
        alert("Tokens claimed successfully!");
        await loadUserData();
    } catch (error) {
        console.error("Claim failed:", error);
    }
});

// ---- Claim Awards ----
claimAwardBtn1.addEventListener("click", async () => {
    try {
        const tx = await referralSystemContract.claimAward(1);
        await tx.wait();
        alert("Award 1 claimed!");
    } catch (error) {
        console.error("Claim Award 1 failed:", error);
    }
});

claimAwardBtn2.addEventListener("click", async () => {
    try {
        const tx = await referralSystemContract.claimAward(2);
        await tx.wait();
        alert("Award 2 claimed!");
    } catch (error) {
        console.error("Claim Award 2 failed:", error);
    }
});

claimAwardBtn3.addEventListener("click", async () => {
    try {
        const tx = await referralSystemContract.claimAward(3);
        await tx.wait();
        alert("Award 3 claimed!");
    } catch (error) {
        console.error("Claim Award 3 failed:", error);
    }
});
