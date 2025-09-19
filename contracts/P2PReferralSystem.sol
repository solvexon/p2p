// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract P2PReferralSystem is Ownable {
   
    IERC20 public immutable usdtToken;
    IERC20 public immutable p2pToken;
    address public adminWallet;
    uint256 public constant PACKAGE_PRICE = 125 * 10**18; // $125 USDT (USDT has 6 decimals)
    uint256 public constant P2P_TOKENS_PER_PACKAGE = 2 * 10**18;
    uint256 public constant LOCK_PERIOD = 430 days;
    uint256 public constant VESTING_PERIOD = 30 days;
    uint256 public constant VESTING_PERCENT = 5;

   
    struct User {
        address referrer;
        uint256 totalPackages;
        uint256 allocatedTokens;
        uint256 lastClaimDate;
        uint256 lockedUntil;
    }

    mapping(address => User) public users;
    mapping(address => address[]) public referrals; 
    mapping(uint256 => uint256) public referralRates;
    mapping(address => uint256) public directReferralCount;
    mapping(address => uint256) public teamReferralCount;

    
    event PackagePurchased(address indexed user, uint256 packageCount);
    event TokensClaimed(address indexed user, uint256 amount);
    event AwardClaimed(address indexed user, uint256 amount);

    constructor(address _usdtToken, address _p2pToken, address _adminWallet) Ownable(msg.sender) {
        usdtToken = IERC20(_usdtToken);
        p2pToken = IERC20(_p2pToken);
        adminWallet = _adminWallet;

       
        referralRates[1] = 40;
        for (uint256 i = 2; i <= 10; i++) {
            referralRates[i] = 4;
        }
    }

    
    function buyPackage(address _referrer) external {
       
        require(usdtToken.transferFrom(msg.sender, address(this), PACKAGE_PRICE), "USDT transfer failed");

        
        if (users[msg.sender].totalPackages == 0) {
            if (_referrer != address(0)) {
                users[msg.sender].referrer = _referrer;
                referrals[_referrer].push(msg.sender);
               
                updateReferralCounts(msg.sender);
            }
        }

        users[msg.sender].totalPackages++;
        users[msg.sender].allocatedTokens += P2P_TOKENS_PER_PACKAGE;

       
        if (users[msg.sender].lockedUntil == 0) {
            users[msg.sender].lockedUntil = block.timestamp + LOCK_PERIOD;
        }

       
        distributeReferralIncome(msg.sender);

       
        uint256 remainingUSDT = usdtToken.balanceOf(address(this));
        if (remainingUSDT > 0) {
            usdtToken.transfer(adminWallet, remainingUSDT);
        }

        emit PackagePurchased(msg.sender, users[msg.sender].totalPackages);
    }
    
    
    function claimTokens() external {
        User storage user = users[msg.sender];
        require(block.timestamp >= user.lockedUntil, "Tokens are still locked");
        require(user.allocatedTokens > 0, "No tokens to claim");
        
        uint256 timeElapsed = block.timestamp - user.lastClaimDate;
        uint256 claimIntervals = timeElapsed / VESTING_PERIOD;

        require(claimIntervals >= 1, "Please wait for the next vesting period");

        uint256 claimableAmount = (user.allocatedTokens * VESTING_PERCENT * claimIntervals) / 100;
        
        
        if (claimableAmount > user.allocatedTokens) {
            claimableAmount = user.allocatedTokens;
        }

        require(claimableAmount > 0, "No tokens available to claim");
        
        
        p2pToken.transfer(msg.sender, claimableAmount);
        user.allocatedTokens -= claimableAmount;
        user.lastClaimDate = block.timestamp;

        emit TokensClaimed(msg.sender, claimableAmount);
    }

    
    function distributeReferralIncome(address _user) private {
        address currentUser = _user;
        uint256 currentLevel = 1;

        while (currentLevel <= 10 && users[currentUser].referrer != address(0)) {
            currentUser = users[currentUser].referrer;
            if (referralRates[currentLevel] > 0) {
                uint256 referralAmount = (PACKAGE_PRICE * referralRates[currentLevel]) / 100;
                usdtToken.transfer(currentUser, referralAmount);
            }
            currentLevel++;
        }
    }
    
    
    function claimAward(uint256 _awardType) external {
        uint256 awardAmount;
        
        if (_awardType == 1 && directReferralCount[msg.sender] >= 10) {
            awardAmount = 2 * 10**18;
        } else if (_awardType == 2 && teamReferralCount[msg.sender] >= 50) {
            awardAmount = 5 * 10**18;
        } else if (_awardType == 3 && teamReferralCount[msg.sender] >= 250) {
            awardAmount = 30 * 10**18;
        }
        
        require(awardAmount > 0, "You are not eligible for this award");
        
        
        p2pToken.transfer(msg.sender, awardAmount);
        emit AwardClaimed(msg.sender, awardAmount);
    }
    
    
    function updateReferralCounts(address _user) private {
        address referrer = _user;
        uint256 level = 1;
        while(referrer != address(0)) {
            if (level == 1) {
                directReferralCount[referrer]++;
            }
            teamReferralCount[referrer]++;
            referrer = users[referrer].referrer;
            level++;
            if (level > 10) break;
        }
    }

    
    function getUserInfo(address _user) external view returns (uint256 allocatedTokens, uint256 remainingDays) {
        User storage user = users[_user];
        uint256 remainingTime = user.lockedUntil > block.timestamp ? user.lockedUntil - block.timestamp : 0;
        return (user.allocatedTokens, remainingTime / 1 days);
    }
}
