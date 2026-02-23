import { createClient } from "@/lib/supabase/server"

const TEMPLATES = [
  { event_type: "CONSENSUS", severity: "LOW", source_node: "NODE-PRIME", messages: [
    "Epoch boundary validated across all nodes",
    "Validator set rotation complete",
    "Block finality achieved: quorum confirmed",
    "Consensus round completed in 42ms",
  ]},
  { event_type: "INTEGRITY", severity: "LOW", source_node: "NODE-07", messages: [
    "Merkle root sync verified across 12 shards",
    "Hash chain integrity check: PASSED",
    "Cross-shard coherence at 99.97%",
    "Audit trail checkpoint sealed",
  ]},
  { event_type: "RESERVE", severity: "LOW", source_node: "NODE-12", messages: [
    "Reserve index recalibrated within threshold",
    "Collateral ratio verified: nominal",
    "Liquidity floor check: PASSED",
    "Reserve buffer capacity at 94.2%",
  ]},
  { event_type: "THROUGHPUT", severity: "MEDIUM", source_node: "NODE-03", messages: [
    "Throughput calibration complete",
    "Batch processing cycle finished",
    "Peak operations window sustained",
    "Queue depth normalized",
  ]},
  { event_type: "SYSTEM", severity: "LOW", source_node: "NODE-18", messages: [
    "Garbage collection cycle: 8ms",
    "Disk I/O normalized on storage cluster",
    "Memory compaction completed",
    "Thread pool rebalanced",
  ]},
  { event_type: "GOVERNANCE", severity: "LOW", source_node: "NODE-PRIME", messages: [
    "Policy delta applied to governance layer",
    "Structural mandate ratified",
    "Audit trail checkpoint: sequence verified",
    "Governance consensus achieved",
  ]},
  { event_type: "NETWORK", severity: "LOW", source_node: "NODE-05", messages: [
    "Peer discovery: new nodes joined cluster",
    "Network topology rebalanced",
    "Latency optimization applied",
    "Routing table updated across mesh",
  ]},
]

export async function POST() {
  const supabase = await createClient()

  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
  const message = template.messages[Math.floor(Math.random() * template.messages.length)]

  // Occasionally produce HIGH severity
  const severity = Math.random() < 0.08 ? "HIGH" : template.severity

  const { error } = await supabase.from("structural_events").insert({
    event_type: template.event_type,
    message,
    severity,
    source_node: template.source_node,
  })

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
  return Response.json({ ok: true, timestamp: new Date().toISOString() })
}
