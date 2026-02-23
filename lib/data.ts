// Deterministic seed data for the Structural Core platform

export interface Transaction {
  hash: string
  timestamp: string
  type: string
  entity: string
  amount: string
  status: "CONFIRMED" | "PENDING" | "REJECTED"
  governanceTs: string
}

export interface LogEntry {
  timestamp: string
  level: "INFO" | "WARN" | "CRIT" | "SYS"
  module: string
  message: string
}

export interface MetricPoint {
  t: string
  v: number
}

function genHash(seed: number): string {
  const chars = "0123456789abcdef"
  let hash = "0x"
  for (let i = 0; i < 16; i++) {
    hash += chars[(seed * (i + 7) * 31) % chars.length]
  }
  return hash
}

function genGovTs(index: number): string {
  const base = 1708700000 + index * 3600
  return `GOV-${base.toString(16).toUpperCase()}`
}

export function generateTransactions(count: number): Transaction[] {
  const types = ["TRANSFER", "STAKE", "GOVERNANCE", "AUDIT", "RESERVE", "LIQUIDATION"]
  const entities = ["VAULT_A", "NODE_7", "RESERVE_PRIME", "COUNCIL_3", "TREASURY", "VALIDATOR_12", "POOL_SIGMA"]
  const statuses: Transaction["status"][] = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "REJECTED"]

  return Array.from({ length: count }, (_, i) => ({
    hash: genHash(i + 1),
    timestamp: new Date(1708700000000 + i * 3600000).toISOString().replace("T", " ").slice(0, 19),
    type: types[i % types.length],
    entity: entities[i % entities.length],
    amount: `${(((i + 1) * 47293) % 9999999).toLocaleString()}.${String((i * 37) % 100).padStart(2, "0")}`,
    status: statuses[i % statuses.length],
    governanceTs: genGovTs(i),
  }))
}

export function generateLogs(count: number): LogEntry[] {
  const levels: LogEntry["level"][] = ["INFO", "INFO", "SYS", "WARN", "INFO", "CRIT"]
  const modules = ["CORE", "NET", "AUTH", "VAULT", "GOV", "SYNC", "LEDGER", "CONSENSUS"]
  const messages = [
    "Block validated -- hash verified",
    "Peer connection established // latency 12ms",
    "Clearance token refreshed",
    "Reserve threshold approaching limit",
    "Governance proposal #4417 queued",
    "Sync delta: 0.003s drift detected",
    "Ledger checkpoint committed",
    "Consensus round completed -- 7/7 nodes",
    "Memory allocation within bounds",
    "Integrity check passed -- all sectors nominal",
    "Rate limiter adjusted // new threshold 1200/s",
    "Audit trail appended -- block 847291",
    "Node heartbeat received // VALIDATOR_12",
    "Critical: latency spike 340ms on VAULT_A",
    "Governance vote finalized // quorum met",
  ]

  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i) * 4000).toISOString().replace("T", " ").slice(0, 19),
    level: levels[i % levels.length],
    module: modules[i % modules.length],
    message: messages[i % messages.length],
  }))
}

export function generateMetrics(count: number): MetricPoint[] {
  return Array.from({ length: count }, (_, i) => ({
    t: `T-${count - i}`,
    v: 40 + Math.floor(30 * Math.sin(i * 0.3) + (((i * 7) % 20) - 10)),
  }))
}

export const SYSTEM_METRICS = {
  memoryUsage: "67.3%",
  cpuLoad: "23.1%",
  latency: "11ms",
  nodeStatus: "7/7 ONLINE",
  uptime: "847d 14h 22m",
  blockHeight: "2,847,291",
  consensusRound: "14,819",
  pendingTx: "23",
  throughput: "1,247 tx/s",
  integrity: "99.9997%",
}

export const DASHBOARD_METRICS = [
  { label: "BLOCK HEIGHT", value: "2,847,291", delta: "+147" },
  { label: "TX THROUGHPUT", value: "1,247/s", delta: "+3.2%" },
  { label: "CONSENSUS", value: "ROUND 14,819", delta: "NOMINAL" },
  { label: "RESERVES", value: "847.2M", delta: "-0.03%" },
  { label: "INTEGRITY", value: "99.9997%", delta: "STABLE" },
  { label: "ACTIVE NODES", value: "7/7", delta: "ALL ONLINE" },
]
