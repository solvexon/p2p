// --- Global Variables and Constants ---
const { ethers } = window;
const isMetaMaskInstalled = typeof window.ethereum !== 'undefined';

// Replace with your actual deployed contract addresses and ABIs
const MYUSDT_CONTRACT_ADDRESS = "0x2AEF42da66D2ef5C88C45953d6FDDc25DE23dd23";
const P2P_CONTRACT_ADDRESS = "0x6d7249567a622DaEC24445537f401735b3033b0B";
const REFERRAL_SYSTEM_CONTRACT_ADDRESS = "0x6a873214c30efdcc8c5a7580f69a1ef2699ad08c";

// Paste your contract ABIs here
const MYUSDT_ABI = [];
const P2P_ABI = [];
const REFERRAL_SYSTEM_ABI = [];

let provider, signer, userAddress;
let myusdtContract, p2pContract, referralSystemContract;

// Referral Link Check
const urlParams = new URLSearchParams(window.location.search);
const referrerAddress = urlParams.get('ref') || ethers.constants.AddressZero;

// --- DOM Elements ---
const connectWalletBtn = document.getElementById('connectWalletBtn');
const connectWalletMetaMaskBtn = document.getElementById('connectWalletMetaMaskBtn');
const continueToDonateBtn = document.getElementById('continueToDonateBtn');
const userWalletAddressDisplay = document.getElementById('userWalletAddress');
const walletAddressContainer = document.getElementById('walletAddress');
const buyPackageBtn = document.getElementById('buyPackageBtn');
const allocatedTokensDisplay = document.getElementById('allocatedTokens');
const tokenLockInfoDisplay = document.getElementById('tokenLockInfo');
const claimTokensBtn = document.getElementById('claimTokensBtn');
const directReferralsCountDisplay = document.getElementById('directReferralsCount');
const teamReferralsCountDisplay = document.getElementById('teamReferralsCount');
const totalReferralEarningsDisplay = document.getElementById('totalReferralEarnings');
const referralLinkDisplay = document.getElementById('referralLinkDisplay');
const copyReferralLinkBtn = document.getElementById('copyReferralLinkBtn');
const claimAwardBtn1 = document.getElementById('claimAwardBtn1');
const claimAwardBtn2 = document.getElementById('claimAwardBtn2');
const claimAwardBtn3 = document.getElementById('claimAwardBtn3');
const vestingProgressBar = document.getElementById('vestingProgressBar');

// --- Helper Functions ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[onclick*='${pageId}']`);
    if (navItem) {
        navItem.classList.add('active');
    }
}

function truncateAddress(address) {
    return `${address.substring(0, 6)}...${address.slice(-4)}`;
}

// --- Main Functions ---

async function connectWallet() {
    if (!isMetaMaskInstalled) {
        alert("Please install MetaMask to use this app!");
        return;
    }
    
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        userWalletAddressDisplay.textContent = truncateAddress(userAddress);
        walletAddressContainer.style.display = 'block';
        
        // Initialize contracts
        myusdtContract = new ethers.Contract(MYUSDT_CONTRACT_ADDRESS, MYUSDT_ABI, signer);
        p2pContract = new ethers.Contract(P2P_CONTRACT_ADDRESS, P2P_ABI, signer);
        referralSystemContract = new ethers.Contract(REFERRAL_SYSTEM_CONTRACT_ADDRESS, REFERRAL_SYSTEM_ABI, signer);

        // Update UI
        connectWalletBtn.style.display = 'none';
        connectWalletMetaMaskBtn.style.display = 'none';
        continueToDonateBtn.disabled = false;

        // Load all data after connection
        loadUserData();
        showPage('donate');

    } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please try again.");
    }
}

async function loadUserData() {
    if (!userAddress) return;

    try {
        // Fetch user info from smart contract
        const userInfo = await referralSystemContract.users(userAddress);
        const [allocatedTokens, remainingDays] = await referralSystemContract.getUserInfo(userAddress);
        
        // Update Token & Vesting Info
        allocatedTokensDisplay.textContent = ethers.utils.formatUnits(userInfo.allocatedTokens, 18);
        const lockPeriodEnd = new Date(userInfo.lockedUntil.toNumber() * 1000);
        const timeRemaining = Math.max(0, lockPeriodEnd.getTime() - Date.now());
        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        tokenLockInfoDisplay.textContent = daysRemaining > 0 ? `Locked for ${daysRemaining} more days` : "Unlocking complete!";
        
        // Update vesting progress bar
        const totalVestingDays = 430;
        const passedDays = totalVestingDays - daysRemaining;
        const progress = Math.min(100, (passedDays / totalVestingDays) * 100);
        vestingProgressBar.style.width = `${progress}%`;
        
        // Enable claim button if tokens are unlocked and available
        if (daysRemaining <= 0 && userInfo.allocatedTokens > 0) {
            claimTokensBtn.disabled = false;
        }

        // Fetch Referral Info
        const directCount = await referralSystemContract.directReferralCount(userAddress);
        const teamCount = await referralSystemContract.teamReferralCount(userAddress);
        directReferralsCountDisplay.textContent = directCount.toString();
        teamReferralsCountDisplay.textContent = teamCount.toString();
        
        // Set up referral link
        referralLinkDisplay.textContent = `${window.location.origin}/?ref=${userAddress}`;

        // Check for awards eligibility
        if (directCount >= 10) claimAwardBtn1.disabled = false;
        if (teamCount >= 50) claimAwardBtn2.disabled = false;
        if (teamCount >= 250) claimAwardBtn3.disabled = false;

    } catch (error) {
        console.error("Failed to load user data:", error);
    }
}

async function buyPackage() {
    if (!signer) {
        alert("Please connect your wallet first.");
        return;
    }

    const packagePrice = ethers.utils.parseUnits("125", 18); // MYUSDT 18 decimals
    
    try {
        // First, check for USDT approval
        const allowance = await myusdtContract.allowance(userAddress, REFERRAL_SYSTEM_CONTRACT_ADDRESS);
        if (allowance.lt(packagePrice)) {
            const approveTx = await myusdtContract.approve(REFERRAL_SYSTEM_CONTRACT_ADDRESS, packagePrice);
            await approveTx.wait();
        }

        // Then, buy the package
        const buyTx = await referralSystemContract.buyPackage(referrerAddress);
        await buyTx.wait();

        alert("Package purchased successfully!");
        loadUserData();
        showPage('dashboard');

    } catch (error) {
        console.error("Failed to purchase package:", error);
        alert("Failed to purchase package. Check console for details.");
    }
}

async function claimTokens() {
    if (!signer) {
        alert("Please connect your wallet first.");
        return;
    }
    
    try {
        const claimTx = await referralSystemContract.claimTokens();
        await claimTx.wait();

        alert("Tokens claimed successfully!");
        loadUserData();
    } catch (error) {
        console.error("Failed to claim tokens:", error);
        alert("Failed to claim tokens. Check console for details.");
    }
}

async function claimAward(awardType) {
    if (!signer) return;

    try {
        const awardTx = await referralSystemContract.claimAward(awardType);
        await awardTx.wait();

        alert("Award claimed successfully!");
        loadUserData();
    } catch (error) {
        console.error("Failed to claim award:", error);
        alert("Failed to claim award. Check console for details.");
    }
}

function copyReferralLink() {
    const link = referralLinkDisplay.textContent;
    if (link) {
        navigator.clipboard.writeText(link);
        alert("Referral link copied!");
    }
}

// --- Event Listeners ---
connectWalletBtn.addEventListener('click', connectWallet);
connectWalletMetaMaskBtn.addEventListener('click', connectWallet);
continueToDonateBtn.addEventListener('click', () => showPage('donate'));
buyPackageBtn.addEventListener('click', buyPackage);
claimTokensBtn.addEventListener('click', claimTokens);
copyReferralLinkBtn.addEventListener('click', copyReferralLink);
claimAwardBtn1.addEventListener('click', () => claimAward(1));
claimAwardBtn2.addEventListener('click', () => claimAward(2));
claimAwardBtn3.addEventListener('click', () => claimAward(3));

// Initial page load
showPage('welcome');

// Listen for account changes
if (isMetaMaskInstalled) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
            userAddress = accounts[0];
            loadUserData();
        } else {
            // User disconnected, reset UI
            showPage('welcome');
        }
    });
}
