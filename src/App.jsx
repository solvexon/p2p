import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import toast, { Toaster } from 'react-hot-toast';

// --- MAINNET CONTRACT DETAILS (POLYGON) ---
const P2P_STAKING_ADDRESS = '0xea68E6d330CdBf7787c7126d16F6022c8578d946';
const P2P_TOKEN_ADDRESS = '0xfAfbd74FE76E90FB2924c56103aaCf6d2C4FE0bC';
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
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Home');

    const [isRegistered, setIsRegistered] = useState(false);
    const [userStats, setUserStats] = useState({ totalTeam: 0, directs: 0, totalEarnings: 0 });
    const [userInfo, setUserInfo] = useState(null);
    const [incomeHistory, setIncomeHistory] = useState([]);
    const [teamByLevel, setTeamByLevel] = useState([]);
    
    const connectWallet = async () => {
        if (!window.ethereum) return toast.error('Please install MetaMask!');
        try {
            setLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();
            const userAccount = await signer.getAddress();
            const stakingContract = new ethers.Contract(P2P_STAKING_ADDRESS, P2P_STAKING_ABI, signer);
            
            setProvider(provider);
            setAccount(userAccount);
            setContract(stakingContract);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
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
    };

    useEffect(() => {
        if (contract && account) {
            fetchAllUserData();
        }
    }, [contract, account]);
    
    const fetchAllUserData = async () => {
        setLoading(true);
        try {
            const [info, stats, history, ...teamLevels] = await Promise.all([
                contract.getUserInfo(account),
                contract.getUserStats(account),
                contract.getIncomeHistory(account),
                ...Array.from({ length: 10 }, (_, i) => contract.getTeamCount(account, i + 1)),
            ]);

            setIsRegistered(info.isExist);

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
        if (!contract) return toast.error("Please connect your wallet first.");
        const savedReferrer = localStorage.getItem('referrer');
        if (!savedReferrer || !ethers.isAddress(savedReferrer)) {
            return toast.error("A valid referral is required to register.");
        }
        const promise = contract.register(savedReferrer, { value: ethers.parseEther("430") });
        toast.promise(promise.then(tx => tx.wait()), {
            loading: 'Processing registration...',
            success: () => { fetchAllUserData(); return <b>Registration successful!</b>; },
            error: (err) => <b>Registration failed: {err.reason || "Unknown error"}</b>,
        });
    };

    const renderContent = () => {
        if (loading) return <p style={{textAlign: 'center'}}>Loading data...</p>;
        
        switch (activeTab) {
            case 'Team': return <TeamTab teamByLevel={teamByLevel} />;
            case 'History': return <HistoryTab history={incomeHistory} currentUser={account} />;
            case 'Profile': return <ProfileTab onLogout={handleLogout} account={account} />;
            case 'Home':
            default:
                return <HomeTab userStats={userStats} isRegistered={isRegistered} onRegister={handleRegister} />;
        }
    };
    
    if (!account) {
        return (
            <div className="connect-wallet-container">
                <img src="https://i.ibb.co/1tMzmcfn/logo.png" alt="Company Logo" className="logo" />
                <h1>P2P Smartchain</h1>
                <p>The Future of Decentralized Earnings on Polygon.</p>
                <button onClick={connectWallet} className="connect-wallet-btn">Connect Wallet</button>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Toaster position="top-center" />
            <div className="main-content">
                <PageHeader />
                {renderContent()}
            </div>
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}

// --- UI Components ---

const PageHeader = () => (
    <div className="page-header">
        <span className="header-icon">🔲</span>
        <span className="header-icon">🔔</span>
    </div>
);

const HomeTab = ({ userStats, isRegistered, onRegister }) => (
    <>
        <div className="welcome-card">
            <div className="welcome-text">
                <h2>Explore & Earn</h2>
                <p>P2P Smartchain</p>
            </div>
            <div className="welcome-image"></div>
        </div>
        
        <div className="stats-grid">
            <StatBox icon="👥" title="My Team" value={userStats.directs || 0} />
            <StatBox icon="💰" title="My Earnings" value={`${parseFloat(userStats.totalEarnings || 0).toFixed(2)} POL`} />
            <StatBox icon="📦" title="Total Team" value={userStats.totalTeam || 0} />
            <StatBox icon="📈" title="P2P Stake" value={"2.5"} />
        </div>

        {!isRegistered && (
            <div className="action-grid">
                <button onClick={onRegister} className="action-button secondary" style={{ gridColumn: '1 / -1' }}>Buy Package</button>
            </div>
        )}
    </>
);

const StatBox = ({ icon, title, value }) => (
    <div className="stat-box">
        <div className="icon">{icon}</div>
        <div className="title">{title}</div>
        <div className="value">{value}</div>
    </div>
);

const TeamTab = ({ teamByLevel }) => (
    <div className="page-container">
        <h1 className="page-title">My Team</h1>
        <div className="table-container">
            <table className="history-table">
                <thead><tr><th>Level</th><th>Members</th></tr></thead>
                <tbody>
                    {teamByLevel.map((count, index) => (
                        <tr className="list-item" key={index}>
                            <td>Level {index + 1}</td>
                            <td>{count} Members</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const HistoryTab = ({ history, currentUser }) => (
    <div className="page-container">
        <h1 className="page-title">Income History</h1>
        <div className="table-container">
            <table className="history-table">
                <thead><tr><th>Type</th><th>Amount</th><th>Date</th></tr></thead>
                <tbody>
                    {history && history.length > 0 ? [...history].reverse().map((item, index) => (
                        <tr className="list-item" key={index}>
                            <td>{Number(item.incomeType) === 0 ? 'Commission' : 'Reward'}</td>
                            <td>
                                {parseFloat(ethers.formatUnits(item.amount, 18)).toFixed(4)}
                                {Number(item.incomeType) === 0 ? ' POL' : ' P2P'}
                            </td>
                            <td>{new Date(Number(item.timestamp) * 1000).toLocaleDateString()}</td>
                        </tr>
                    )) : <tr><td colSpan="3" style={{textAlign: 'center'}}>No history found.</td></tr>}
                </tbody>
            </table>
        </div>
    </div>
);

const ProfileTab = ({ onLogout, account }) => (
    <div className="page-container">
        <h1 className="page-title">Profile</h1>
        <div className="list-item">
            <span>Wallet Address</span>
            <strong>{`${account.substring(0, 6)}...${account.substring(38)}`}</strong>
        </div>
        <div className="list-item">
            <span>Referral Link</span>
            <button className="action-button primary" style={{fontSize: '14px', padding: '10px 15px'}} onClick={() => {
                const referralLink = `${window.location.origin}${window.location.pathname}?ref=${account}`;
                navigator.clipboard.writeText(referralLink);
                toast.success('Referral Link Copied!');
            }}>Copy Link</button>
        </div>
        <div className="action-grid">
             <button onClick={onLogout} className="action-button secondary" style={{ gridColumn: '1 / -1' }}>Logout</button>
        </div>
    </div>
);

const BottomNav = ({ activeTab, setActiveTab }) => (
    <div className="bottom-nav">
        <NavItem icon="🏠" label="Home" isActive={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
        <NavItem icon="👥" label="Team" isActive={activeTab === 'Team'} onClick={() => setActiveTab('Team')} />
        <NavItem icon="👤" label="Profile" isActive={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
        <NavItem icon="📄" label="History" isActive={activeTab === 'History'} onClick={() => setActiveTab('History')} />
    </div>
);

const NavItem = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`nav-item ${isActive && 'active'}`}>
        <span className="icon">{icon}</span>
        <span>{label}</span>
    </button>
);

export default App;