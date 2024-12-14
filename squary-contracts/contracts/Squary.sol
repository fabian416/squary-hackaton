// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Squary {
    error CallerNotMember();
    error InvalidDebtAmount();
    error TransferFailed();

    struct Group {
        bytes32 id;
        string name;
        address[] members;
        mapping(address => int256) balances; // Balances de cada miembro
        address tokenAddress; // Token para las deudas (USDT, USDC)
    }

    struct Debt {
        address debtor; // Deudor
        address creditor; // Acreedor
        uint256 amount; // Monto de la deuda
    }

    mapping(bytes32 => Group) public groups; // Grupos por ID
    bytes32[] public groupIds; // Lista de IDs de grupos

    event GroupCreated(bytes32 indexed groupId, string name, address[] members);
    event DebtPaid(
        bytes32 indexed groupId,
        address debtor,
        address creditor,
        uint256 amount
    );

    constructor() {}

    modifier onlyMember(bytes32 groupId) {
        if (!isMember(groupId, msg.sender)) revert CallerNotMember();
        _;
    }

    // Crear un grupo
    function createGroup(
        string memory name,
        address[] memory members,
        address tokenAddress
    ) external {
        bytes32 groupId = keccak256(
            abi.encodePacked(msg.sender, name, block.timestamp)
        );
        Group storage group = groups[groupId];
        group.id = groupId;
        group.name = name;
        group.members = members;
        group.tokenAddress = tokenAddress;

        groupIds.push(groupId);

        emit GroupCreated(groupId, name, members);
    }

    // Pagar todas las deudas directamente
    function settleDebts(
        bytes32 groupId,
        Debt[] calldata debts // Lista de deudas a pagar
    ) external onlyMember(groupId) {
        Group storage group = groups[groupId];
        IERC20 token = IERC20(group.tokenAddress);

        // Validar que las deudas corresponden a los balances actuales
        int256[] memory balancesCopy = new int256[](group.members.length);
        address[] memory members = group.members;

        // Crear una copia de los balances iniciales
        for (uint256 i = 0; i < members.length; i++) {
            balancesCopy[i] = group.balances[members[i]];
        }

        for (uint256 i = 0; i < debts.length; i++) {
            Debt memory debt = debts[i];

            // Validar que el deudor tiene suficiente saldo negativo para pagar
            require(
                group.balances[debt.debtor] <= 0 &&
                    group.balances[debt.debtor] + int256(debt.amount) >= 0,
                "Insufficient debt balance"
            );

            // Validar que el acreedor tiene saldo positivo para recibir
            require(
                group.balances[debt.creditor] >= 0,
                "Invalid creditor balance"
            );

            // Validar que las direcciones involucradas sean miembros del grupo
            require(
                isMember(groupId, debt.debtor) &&
                    isMember(groupId, debt.creditor),
                "Addresses must be group members"
            );

            // Transferir tokens del deudor al acreedor
            require(
                token.transferFrom(debt.debtor, debt.creditor, debt.amount),
                "Token transfer failed"
            );

            // Actualizar balances
            group.balances[debt.debtor] += int256(debt.amount);
            group.balances[debt.creditor] -= int256(debt.amount);

            emit DebtPaid(groupId, debt.debtor, debt.creditor, debt.amount);
        }

        // Validar que los balances estén alineados con el estado inicial
        for (uint256 i = 0; i < members.length; i++) {
            require(
                group.balances[members[i]] == balancesCopy[i],
                "Balances do not match the expected state"
            );
        }
    }

    // Obtener el balance de un miembro en un grupo
    function getBalance(
        bytes32 groupId,
        address member
    ) external view returns (int256) {
        return groups[groupId].balances[member];
    }

    // Verificar si una dirección es miembro de un grupo
    function isMember(
        bytes32 groupId,
        address member
    ) public view returns (bool) {
        Group storage group = groups[groupId];
        for (uint256 i = 0; i < group.members.length; i++) {
            if (group.members[i] == member) {
                return true;
            }
        }
        return false;
    }

    // Listar los grupos a los que pertenece un usuario
    function getUserGroups(
        address user
    ) external view returns (bytes32[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < groupIds.length; i++) {
            if (isMember(groupIds[i], user)) {
                count++;
            }
        }

        bytes32[] memory userGroups = new bytes32[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < groupIds.length; i++) {
            if (isMember(groupIds[i], user)) {
                userGroups[index] = groupIds[i];
                index++;
            }
        }
        return userGroups;
    }

    function getGroupDetails(
        bytes32 groupId
    ) public view returns (string memory name, address[] memory members) {
        Group storage group = groups[groupId];
        return (group.name, group.members);
    }
}
