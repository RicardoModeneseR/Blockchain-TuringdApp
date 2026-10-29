//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "hardhat/console.sol";

// Turing token: "Uncapped Lazy Supply" strategy.
// No tokens are minted on deploy (no initial coin offer); they are created
// on demand, in small amounts, with no maximum supply defined in the code.
contract Turing {
    string public name = "Turing";
    string public symbol = "TUR";
    uint8 public decimals = 0;

    // Starts at zero and only grows as tokens are minted on demand.
    uint256 public totalSupply;

    address public owner;

    // Whether the voting is active.
    bool public voting;

    mapping(address => uint256) balances;

    // Pre-authorized users: codename => address.
    mapping(string => address) public users;

    // Reverse lookup used for access control.
    mapping(address => bool) public isAuthorized;

    // Reverse lookup: address => codename. Used by vote() to know who is voting.
    mapping(address => string) public codenameOf;

    // voter codename => voted codename => already voted.
    mapping(string => mapping(string => bool)) public hasVote;

    // How many times each codename has voted (for the 1 Turing reward every 10 votes).
    mapping(string => uint256) public voteCount;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    modifier onlyAuthorized() {
        require(isAuthorized[msg.sender], "User not authorized");
        _;
    }

    /**
     * Contract initialization. Registers the authorized users from the
     * example table (Hardhat local network accounts). No minting here.
     */
    constructor() {
        owner = msg.sender;

        _addUser("roberta", 0xFdD3A70A6D634f8f003Ad3B1Fe0DC84163ec6F57);
        _addUser("nome1",0x502542668aF09fa7aea52174b9965A7799343Df7);
        _addUser("nome2", 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        _addUser("nome3", 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        _addUser("nome4", 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65);
        _addUser("nome5", 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc);
        _addUser("nome6", 0x976EA74026E726554dB657fA54763abd0C3a0aa9);
        _addUser("nome7", 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955);
        _addUser("nome8", 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f);
        _addUser("nome9", 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720);
        _addUser("nome10", 0xBcd4042DE499D14e55001CcbB24a551F3b954096);
        _addUser("nome11", 0x71bE63f3384f5fb98995898A86B02Fb2426c5788);
        _addUser("nome12", 0xFABB0ac9d68B0B445fB7357272Ff202C5651694a);
        _addUser("nome13", 0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec);
        _addUser("nome14", 0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097);
        _addUser("nome15", 0xcd3B766CCDd6AE721141F452C550Ca635964ce71);
        _addUser("nome16", 0x2546BcD3c84621e976D8185a91A922aE77ECEc30);
        _addUser("nome17", 0xbDA5747bFD65F08deb54cb465eB87D40e51B197E);
        _addUser("nome18", 0xdD2FD4581271e230360230F9337D5c0430Bf44C0);
        _addUser("nome19", 0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199);
    }

    function transfer(address to, uint256 amount) external onlyAuthorized {
        require(balances[msg.sender] >= amount, "Not enough tokens");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit Transfer(msg.sender, to, amount);
    }

    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }

    function _addUser(string memory codename, address account) private {
        users[codename] = account;
        isAuthorized[account] = true;
        codenameOf[account] = codename;
    }

    // Lazy supply: tokens come into existence only when minted, uncapped.
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balances[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    modifier onlyOwnerOrProfessor() {
        require(
            msg.sender == owner || msg.sender == users["roberta"], 
            "Only owner or Professor can call this function"
        );
        _;
    }

    function updateUser(string memory codename, address newAccount)
    external
    onlyOwnerOrProfessor
    {
        require(bytes(codename).length > 0, "Codename cannot be empty");

        address oldAccount = users[codename];
        require(oldAccount != address(0), "User does not exist");

        isAuthorized[oldAccount] = false;
        delete codenameOf[oldAccount];

        _addUser(codename, newAccount);

        voting = true;
    }

    function votingOn() external onlyOwnerOrProfessor {
        voting = true;
    }

    function votingOff() external onlyOwnerOrProfessor {
        voting = false;
    }

    // Amounts are in the token's smallest unit (18 decimals), like ERC-20.
    function issueToken(string memory codename, uint256 amount)
        external
        onlyOwnerOrProfessor
    {
        address account = users[codename];
        require(account != address(0), "User does not exist");

        _mint(account, amount);
    }

    function vote(string memory codename, uint256 amount) external onlyAuthorized {
        require(voting, "Voting is not active");

        address candidate = users[codename];
        require(candidate != address(0), "User does not exist");

        string memory voter = codenameOf[msg.sender];
        require(candidate != msg.sender, "Cannot vote for yourself");
        require(amount > 0 && amount <= 2 * 10**decimals, "Amount must be > 0 and <= 2 Turings");
        require(!hasVote[voter][codename], "Already voted for this user");

        hasVote[voter][codename] = true;
        _mint(candidate, amount);

        // Every 10 votes, the voter earns 1 Turing.
        voteCount[voter]++;
        if (voteCount[voter] % 10 == 0) {
            _mint(msg.sender, 10**decimals);
        }
    }
}
