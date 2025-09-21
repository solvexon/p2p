import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// --- MAINNET CONTRACT DETAILS (POLYGON) ---
const P2P_STAKING_ADDRESS = '0xea68E6d330CdBf7787c7126d16F6022c8578d946';

// --- YOUR NEW MAINNET ABI ---
const P2P_STAKING_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_p2pTokenAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_adminWallet",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rewardId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokenClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CLAIM_INTERVAL",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "LOCK_DURATION",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MONTHLY_CLAIM_PERCENT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PACKAGE_COST_POL",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PACKAGE_P2P_REWARD",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "adminWallet",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_rewardId",
        "type": "uint256"
      }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userAddress",
        "type": "address"
      }
    ],
    "name": "getIncomeHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "enum P2PStaking.IncomeType",
            "name": "incomeType",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "fromUser",
            "type": "address"
          }
        ],
        "internalType": "struct P2PStaking.Income[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_level",
        "type": "uint256"
      }
    ],
    "name": "getTeamCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userAddress",
        "type": "address"
      }
    ],
    "name": "getUserInfo",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isExist",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "stakeTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lockEndDate",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastClaimTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalClaimedP2P",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalRewardP2P",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_userAddress",
        "type": "address"
      }
    ],
    "name": "getUserStats",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalTeam",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "directs",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalEarnings",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "p2pToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "referralCommissions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_referrer",
        "type": "address"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userReferrer",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "users",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isExist",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "referrer",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "stakeTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "lastClaimTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalClaimedP2P",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalTeam",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalEarnings",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const POLYGON_SCAN_URL = 'https://polygonscan.com';

function App() {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [userStats, setUserStats] = useState({ totalTeam: 0, directs: 0, totalEarnings: 0 });
    const [incomeHistory, setIncomeHistory] = useState([]);
    const [teamByLevel, setTeamByLevel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [walletBalance, setWalletBalance] = useState('0');

    const connectWallet = async () => {
        if (!window.ethereum) return alert('Please install MetaMask!');
        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();
            const userAccount = await signer.getAddress();
            const stakingContract = new ethers.Contract(P2P_STAKING_ADDRESS, P2P_STAKING_ABI, signer);
            
            const balance = await provider.getBalance(userAccount);
            setWalletBalance(ethers.formatEther(balance));

            setProvider(provider);
            setAccount(userAccount);
            setContract(stakingContract);
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setAccount(null);
        setContract(null);
        setProvider(null);
        setIsRegistered(false);
        setUserInfo(null);
        setUserStats({ totalTeam: 0, directs: 0, totalEarnings: 0 });
        setIncomeHistory([]);
        setTeamByLevel([]);
        setWalletBalance('0');
    };

    useEffect(() => {
        if (contract && account) {
            fetchAllUserData();
        }
    }, [contract, account]);

    const fetchAllUserData = async () => {
        setLoading(true);
        try {
            const [info, stats, history, balance, ...teamLevels] = await Promise.all([
                contract.getUserInfo(account),
                contract.getUserStats(account),
                contract.getIncomeHistory(account),
                provider.getBalance(account),
                ...Array.from({ length: 10 }, (_, i) => contract.getTeamCount(account, i + 1)),
            ]);

            setIsRegistered(info.isExist);
            setWalletBalance(ethers.formatEther(balance));

            if (info.isExist) {
                setUserInfo({
                    lockEndDate: new Date(Number(info.lockEndDate) * 1000).toLocaleString(),
                    totalClaimed: ethers.formatUnits(info.totalClaimedP2P, 18),
                    totalReward: ethers.formatUnits(info.totalRewardP2P, 18),
                });
                setUserStats({
                    totalTeam: Number(stats.totalTeam),
                    directs: Number(stats.directs),
                    totalEarnings: ethers.formatUnits(stats.totalEarnings, 18),
                });
                setIncomeHistory(history);
                setTeamByLevel(teamLevels.map((count) => Number(count)));
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
        setLoading(false);
    };

    const handleRegister = async () => {
        if (!contract) return alert("Please connect your wallet first.");
        try {
            const urlParams = new URLSearchParams(window.location.search);
            let referrer = urlParams.get('ref') || '0x0000000000000000000000000000000000000000';
            if (!ethers.isAddress(referrer)) {
                referrer = '0x0000000000000000000000000000000000000000';
            }
            
            alert("Confirm the transaction in your wallet to register.");
            
            const packageCost = ethers.parseEther("430"); 
            
            const registerTx = await contract.register(referrer, { value: packageCost });
            
            alert("Processing your registration... please wait for confirmation.");
            await registerTx.wait();

            alert("Registration successful!");
            fetchAllUserData();
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. See the console for details.");
        }
    };

    const handleClaimTokens = async () => {
        if (!contract) return;
        try {
            alert('Claiming your monthly tokens...');
            const tx = await contract.claimTokens();
            await tx.wait();
            alert('Tokens claimed successfully!');
            fetchAllUserData();
        } catch (error) {
            console.error('Claim tokens failed:', error);
            alert('Claim failed. You might not be eligible yet.');
        }
    };

    const handleClaimReward = async (rewardId) => {
        if (!contract) return;
        try {
            alert(`Claiming reward for ID: ${rewardId}...`);
            const tx = await contract.claimReward(rewardId);
            await tx.wait();
            alert('Reward claimed successfully!');
            fetchAllUserData();
        } catch (error) {
            console.error(`Claiming reward ${rewardId} failed:`, error);
            alert('Reward claim failed. You might not have met the requirements.');
        }
    };

    const renderContent = () => {
        if (loading) return <p style={{ textAlign: 'center', padding: '20px' }}>Loading your data...</p>;
        if (!isRegistered) {
            return (
                <div className="action-card">
                    <h3>Join Now</h3>
                    <p>Purchase the 430 POL package to start earning.</p>
                    <button onClick={handleRegister} className="btn">Register Now</button>
                </div>
            );
        }

        switch (activeTab) {
            case 'team':
                return <TeamView teamByLevel={teamByLevel} />;
            case 'history':
                return <IncomeHistoryView history={incomeHistory} currentUser={account} />;
            case 'awards':
                return <AwardsView directs={userStats.directs} teamByLevel={teamByLevel} onClaim={handleClaimReward} />;
            default:
                return <DashboardView userInfo={userInfo} onClaim={handleClaimTokens} />;
        }
    };

    if (!account) {
        return (
            <div className="main-container">
                <div className="connect-wallet-container">
                    <img src="https://i.ibb.co/1tMzmcfn/logo.png" alt="Company Logo" className="logo" />
                    <h1>Welcome to P2P Smartchain</h1>
                    <p>Connect your wallet to begin your journey.</p>
                    <button onClick={connectWallet} className="connect-wallet-btn">Connect Wallet</button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-container">
            <div className="glass-card">
                <div className="dashboard-header">
                    <div className="header-title">
                        <img src="https://i.ibb.co/1tMzmcfn/logo.png" alt="Company Logo" className="logo" />
                        <h2>P2P Smartchain</h2>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>

                <div className="wallet-info">
                    <p><strong>Wallet:</strong> {account}</p>
                    <div className="referral-container">
                        <p>Your Referral Link</p>
                        <button 
                            className="copy-btn" 
                            onClick={() => {
                                const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
                                navigator.clipboard.writeText(referralLink);
                                alert('Referral Link Copied!');
                            }}
                        >
                            Copy Link
                        </button>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="stat-card"><h3>Total Earnings</h3><p>{parseFloat(userStats.totalEarnings).toFixed(4)} POL</p></div>
                    <div className="stat-card"><h3>Wallet Balance</h3><p>{parseFloat(walletBalance).toFixed(4)} POL</p></div>
                    <div className="stat-card"><h3>Total Directs</h3><p>{userStats.directs}</p></div>
                    <div className="stat-card"><h3>Total Team</h3><p>{userStats.totalTeam}</p></div>
                </div>

                <div className="tabs">
                    <button onClick={() => setActiveTab('dashboard')} className={`tab-button ${activeTab === 'dashboard' && 'active'}`}>Dashboard</button>
                    <button onClick={() => setActiveTab('team')} className={`tab-button ${activeTab === 'team' && 'active'}`}>My Team</button>
                    <button onClick={() => setActiveTab('history')} className={`tab-button ${activeTab === 'history' && 'active'}`}>History</button>
                    <button onClick={() => setActiveTab('awards')} className={`tab-button ${activeTab === 'awards' && 'active'}`}>Awards</button>
                </div>

                <div className="tab-content">{renderContent()}</div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

const DashboardView = ({ userInfo, onClaim }) => (
    <>
        <div className="dashboard-grid">
            <div className="stat-card"><h3>Total Stake</h3><p>{userInfo?.totalReward} P2P</p></div>
            <div className="stat-card"><h3>Claimed Tokens</h3><p>{parseFloat(userInfo?.totalClaimed).toFixed(4)} P2P</p></div>
            <div className="stat-card"><h3>Remaining Tokens</h3><p>{((userInfo?.totalReward || 0) - (userInfo?.totalClaimed || 0)).toFixed(4)} P2P</p></div>
            <div className="stat-card"><h3>Lock Period Ends</h3><p style={{ fontSize: '16px' }}>{userInfo?.lockEndDate}</p></div>
        </div>
        <div className="action-card">
            <h3>Claim Your Monthly Rewards</h3>
            <p>You can claim 5% of your staked tokens every 30 days after the lock period ends.</p>
            <button className="btn" onClick={onClaim}>Claim Now</button>
        </div>
    </>
);

const TeamView = ({ teamByLevel }) => {
    const packageCost = 430;
    const commissions = [40, 4, 4, 4, 4, 4, 4, 4, 4, 4];

    return (
        <div className="table-container">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Members</th>
                        <th>Earnings (POL)</th>
                    </tr>
                </thead>
                <tbody>
                    {teamByLevel.map((memberCount, index) => {
                        const earnings = (memberCount * (packageCost * commissions[index] / 100));
                        return (
                            <tr key={index}>
                                <td>Level {index + 1}</td>
                                <td>{memberCount}</td>
                                <td>{earnings.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};


const IncomeHistoryView = ({ history, currentUser }) => (
    <div className="table-container">
        <table className="history-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>From</th>
                    <th>Date</th>
                    <th>Transaction</th>
                </tr>
            </thead>
            <tbody>
                {history && history.length > 0 ? (
                    [...history].reverse().map((item, index) => (
                        <tr key={index}>
                            <td>{Number(item.incomeType) === 0 ? 'Commission' : 'Reward'}</td>
                            <td>
                                {parseFloat(ethers.formatUnits(item.amount, 18)).toFixed(4)}{' '}
                                {Number(item.incomeType) === 0 ? 'POL' : 'P2P'}
                            </td>
                            <td>{Number(item.incomeType) === 0 ? `${item.fromUser.substring(0, 6)}...` : 'Self'}</td>
                            <td>{new Date(Number(item.timestamp) * 1000).toLocaleDateString()}</td>
                            <td>
                                <a
                                    href={`${POLYGON_SCAN_URL}/address/${currentUser}#internaltx`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="explorer-link"
                                >
                                    View
                                </a>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>
                            No income history found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

const AwardsView = ({ directs, teamByLevel, onClaim }) => {
    const awards = [
        { id: 1, name: '10 Directs', required: 10, current: directs, reward: '3 P2P' },
        { id: 2, name: '50 Team in Level 2', required: 50, current: teamByLevel[1] || 0, reward: '5 P2P' },
        { id: 3, name: '150 Team in Level 3', required: 150, current: teamByLevel[2] || 0, reward: '15 P2P' },
    ];

    return (
        <div className="table-container">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Award</th>
                        <th>Requirement</th>
                        <th>Your Progress</th>
                        <th>Remaining</th>
                        <th>Reward</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {awards.map((award) => (
                        <tr key={award.id}>
                            <td>{award.name}</td>
                            <td>{award.required}</td>
                            <td>{award.current}</td>
                            <td>{Math.max(0, award.required - award.current)}</td>
                            <td>{award.reward}</td>
                            <td>
                                <button
                                    className="btn"
                                    onClick={() => onClaim(award.id)}
                                    disabled={award.current < award.required}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        cursor:
                                            award.current < award.required
                                                ? 'not-allowed'
                                                : 'pointer',
                                        opacity: award.current < award.required ? 0.5 : 1,
                                    }}
                                >
                                    Claim
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;