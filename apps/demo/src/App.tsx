import Editor from 'solive-core';

import { useWidth } from './use-width';

// eslint-disable-next-line max-len
const OwnerSol = '"// SPDX-License-Identifier: GPL-3.0\\n\\npragma solidity >=0.7.0 <0.9.0;\\n\\n/**\\n * @title Owner\\n * @dev Set & change owner\\n */\\ncontract Owner {\\n\\n    address private owner;\\n\\n    // event for EVM logging\\n    event OwnerSet(address indexed oldOwner, address indexed newOwner);\\n\\n    // modifier to check if caller is owner\\n    modifier isOwner() {\\n        // If the first argument of \'require\' evaluates to \'false\', execution terminates and all\\n        // changes to the state and to Ether balances are reverted.\\n        // This used to consume all gas in old EVM versions, but not anymore.\\n        // It is often a good idea to use \'require\' to check if functions are called correctly.\\n        // As a second argument, you can also provide an explanation about what went wrong.\\n        require(msg.sender == owner, \\"Caller is not owner\\");\\n        _;\\n    }\\n\\n    /**\\n     * @dev Set contract deployer as owner\\n     */\\n    constructor() {\\n        owner = msg.sender; // \'msg.sender\' is sender of current call, contract deployer for a constructor\\n        emit OwnerSet(address(0), owner);\\n    }\\n\\n    /**\\n     * @dev Change owner\\n     * @param newOwner address of new owner\\n     */\\n    function changeOwner(address newOwner) public isOwner {\\n        emit OwnerSet(owner, newOwner);\\n        owner = newOwner;\\n    }\\n\\n    /**\\n     * @dev Return owner address \\n     * @return address of owner\\n     */\\n    function getOwner() external view returns (address) {\\n        return owner;\\n    }\\n} "';
// eslint-disable-next-line max-len
const BallotSol = '"// SPDX-License-Identifier: GPL-3.0\\n\\npragma solidity >=0.7.0 <0.9.0;\\n\\n/** \\n * @title Ballot\\n * @dev Implements voting process along with vote delegation\\n */\\ncontract Ballot {\\n\\n    struct Voter {\\n        uint weight; // weight is accumulated by delegation\\n        bool voted;  // if true, that person already voted\\n        address delegate; // person delegated to\\n        uint vote;   // index of the voted proposal\\n    }\\n\\n    struct Proposal {\\n        // If you can limit the length to a certain number of bytes, \\n        // always use one of bytes1 to bytes32 because they are much cheaper\\n        bytes32 name;   // short name (up to 32 bytes)\\n        uint voteCount; // number of accumulated votes\\n    }\\n\\n    address public chairperson;\\n\\n    mapping(address => Voter) public voters;\\n\\n    Proposal[] public proposals;\\n\\n    /** \\n     * @dev Create a new ballot to choose one of \'proposalNames\'.\\n     * @param proposalNames names of proposals\\n     */\\n    constructor(bytes32[] memory proposalNames) {\\n        chairperson = msg.sender;\\n        voters[chairperson].weight = 1;\\n\\n        for (uint i = 0; i < proposalNames.length; i++) {\\n            // \'Proposal({...})\' creates a temporary\\n            // Proposal object and \'proposals.push(...)\'\\n            // appends it to the end of \'proposals\'.\\n            proposals.push(Proposal({\\n                name: proposalNames[i],\\n                voteCount: 0\\n            }));\\n        }\\n    }\\n\\n    /** \\n     * @dev Give \'voter\' the right to vote on this ballot. May only be called by \'chairperson\'.\\n     * @param voter address of voter\\n     */\\n    function giveRightToVote(address voter) public {\\n        require(\\n            msg.sender == chairperson,\\n            \\"Only chairperson can give right to vote.\\"\\n        );\\n        require(\\n            !voters[voter].voted,\\n            \\"The voter already voted.\\"\\n        );\\n        require(voters[voter].weight == 0);\\n        voters[voter].weight = 1;\\n    }\\n\\n    /**\\n     * @dev Delegate your vote to the voter \'to\'.\\n     * @param to address to which vote is delegated\\n     */\\n    function delegate(address to) public {\\n        Voter storage sender = voters[msg.sender];\\n        require(!sender.voted, \\"You already voted.\\");\\n        require(to != msg.sender, \\"Self-delegation is disallowed.\\");\\n\\n        while (voters[to].delegate != address(0)) {\\n            to = voters[to].delegate;\\n\\n            // We found a loop in the delegation, not allowed.\\n            require(to != msg.sender, \\"Found loop in delegation.\\");\\n        }\\n        sender.voted = true;\\n        sender.delegate = to;\\n        Voter storage delegate_ = voters[to];\\n        if (delegate_.voted) {\\n            // If the delegate already voted,\\n            // directly add to the number of votes\\n            proposals[delegate_.vote].voteCount += sender.weight;\\n        } else {\\n            // If the delegate did not vote yet,\\n            // add to her weight.\\n            delegate_.weight += sender.weight;\\n        }\\n    }\\n\\n    /**\\n     * @dev Give your vote (including votes delegated to you) to proposal \'proposals[proposal].name\'.\\n     * @param proposal index of proposal in the proposals array\\n     */\\n    function vote(uint proposal) public {\\n        Voter storage sender = voters[msg.sender];\\n        require(sender.weight != 0, \\"Has no right to vote\\");\\n        require(!sender.voted, \\"Already voted.\\");\\n        sender.voted = true;\\n        sender.vote = proposal;\\n\\n        // If \'proposal\' is out of the range of the array,\\n        // this will throw automatically and revert all\\n        // changes.\\n        proposals[proposal].voteCount += sender.weight;\\n    }\\n\\n    /** \\n     * @dev Computes the winning proposal taking all previous votes into account.\\n     * @return winningProposal_ index of winning proposal in the proposals array\\n     */\\n    function winningProposal() public view\\n            returns (uint winningProposal_)\\n    {\\n        uint winningVoteCount = 0;\\n        for (uint p = 0; p < proposals.length; p++) {\\n            if (proposals[p].voteCount > winningVoteCount) {\\n                winningVoteCount = proposals[p].voteCount;\\n                winningProposal_ = p;\\n            }\\n        }\\n    }\\n\\n    /** \\n     * @dev Calls winningProposal() function to get the index of the winner contained in the proposals array and then\\n     * @return winnerName_ the name of the winner\\n     */\\n    function winnerName() public view\\n            returns (bytes32 winnerName_)\\n    {\\n        winnerName_ = proposals[winningProposal()].name;\\n    }\\n}"';

function App() {
  const { width, height } = useWidth();

  return (
    <div className="App">
      <Editor
        rounded="0px"
        height={`${height}px`}
        id="1"
        deploy={{
          maxWidth: width / 4 < 240 ? 240 : width / 4,
          minWidth: width / 6 < 140 ? 140 : width / 6,
          defaultVisible: !(width < 800),
        }}
        console={{
          defaultVisible: !(width < 800),
        }}
        modelInfos={[
          {
            filename: '_Storage.sol',
            value: '// SPDX-License-Identifier: GPL-3.0\n\npragma solidity >=0.7.0 <0.9.0;\n\n/**\n * @title Storage\n * '
              + '@dev Store & retrieve value in a variable\n * @custom:dev-run-script ./scripts/deploy_with_ethers.ts\n */\ncontract '
              + 'Storage {\n\n    uint256 number;\n\n    /**\n     * @dev Store value in variable\n     '
              + '* @param num value to store\n     */\n    function store(uint256 num) public {\n        '
              + "number = num;\n    }\n\n    /**\n     * @dev Return value \n     * @return value of 'number'\n    "
              + ' */\n    function retrieve() public view returns (uint256){\n        return number;\n    }\n}',
            language: 'solidity' as any,
          },
          {
            filename: '_Owner.sol',
            value: JSON.parse(OwnerSol),
            language: 'solidity' as any,
          },
          {
            filename: '_Ballot.sol',
            value: JSON.parse(BallotSol),
            language: 'solidity' as any,
          },
        ]}
      />
    </div>
  );
}

export default App;
