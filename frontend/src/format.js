import { ALL_CODENAMES } from "./codenames";

// Small presentational helpers shared by the components.

export function displayName(codename) {
  if (!codename) {
    return "";
  }
  return codename.charAt(0).toUpperCase() + codename.slice(1);
}

// "nome12" -> "N12", "roberta" -> "R"
export function initials(codename) {
  const match = /^(\D+)(\d+)$/.exec(codename || "");
  if (match) {
    return match[1].charAt(0).toUpperCase() + match[2];
  }
  return (codename || "?").charAt(0).toUpperCase();
}

// Codenames alternate between a hexagon and a diamond mark.
export function shapeOf(codename) {
  return ALL_CODENAMES.indexOf(codename) % 2 === 0 ? "hexagon" : "diamond";
}

export function shortHash(hash) {
  if (!hash) {
    return "";
  }
  return `${hash.slice(0, 5)}…${hash.slice(-4)}`;
}

export function formatTime(date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function turings(amount) {
  const value = amount.toString();
  return `${value} ${value === "1" ? "Turing" : "Turings"}`;
}

// Revert reasons from contracts/Turing.sol, translated for the UI.
const REVERT_MESSAGES = {
  "Voting is not active": "A votação está encerrada.",
  "Cannot vote for yourself": "Você não pode votar em si mesmo.",
  "Amount must be > 0 and <= 2 Turings":
    "Cada voto aceita de 1 a 2 Turings.",
  "Already voted for this user": "Você já votou neste aluno.",
  "User not authorized": "Esta carteira não está registrada na turma.",
  "User does not exist": "Codinome não encontrado no contrato.",
  "Only owner or Professor can call this function":
    "Apenas o superusuário pode fazer isso.",
};

const REJECTED_MESSAGES = {
  vote: "A solicitação foi recusada na carteira. Nenhum voto foi registrado e o ranking não mudou.",
  issue:
    "A solicitação foi recusada na carteira. Nenhum Turing foi emitido e o ranking não mudou.",
  voting:
    "A solicitação foi recusada na carteira. O status da votação não mudou.",
};

export function isRejectedByUser(error) {
  return error.code === 4001 || error.code === "ACTION_REJECTED";
}

// Turns an RPC error into a human readable message. Revert reasons can be
// nested at different depths depending on the wallet.
export function describeTxError(error, kind) {
  if (isRejectedByUser(error)) {
    return REJECTED_MESSAGES[kind];
  }

  const raw =
    (error.data && error.data.message) ||
    (error.error && error.error.data && error.error.data.message) ||
    (error.error && error.error.message) ||
    error.reason ||
    error.message ||
    "";

  const known = Object.keys(REVERT_MESSAGES).find((reason) =>
    raw.includes(reason)
  );
  if (known) {
    return REVERT_MESSAGES[known];
  }

  return raw.length > 140 ? `${raw.slice(0, 140)}…` : raw;
}
