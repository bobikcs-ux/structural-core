"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface IntelEvent {
  id: string
  type: string
  title: string
  content: string
  severity: string
  created_at: string
}

const SEVERITY_BORDER: Record<string, string> = {
  LOW: "border-amber-500/30",
  MEDIUM: "border-amber-500/50",
  HIGH: "border-amber-400/70",
  CRITICAL: "border-red-500/70",
}

export function IntelFeed({ className }: { className?: string }) {
  const [events, setEvents] = useState<IntelEvent[]>([])
  const [isLive, setIsLive] = useState(false)
  const [newEventId, setNewEventId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("intel_feed")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)
      if (data) setEvents(data as IntelEvent[])
    }
    fetchEvents()

    const channel = supabase
      .channel("intel_events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "intel_feed" },
        (payload) => {
          const newEvent = payload.new as IntelEvent
          setNewEventId(newEvent.id)
          setEvents((prev) => [newEvent, ...prev].slice(0, 10))
          setTimeout(() => setNewEventId(null), 2000)
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED")
      })

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("en-GB", { hour12: false })
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? "bg-amber-400 animate-pulse" : "bg-muted-foreground/30"
              }`}
            />
            <span className="font-mono text-[10px] tracking-[0.2em] text-amber-500/60 uppercase">
              {isLive ? "Live" : "Connecting"}
            </span>
          </div>
          <span className="font-mono text-[10px] text-amber-500/20">|</span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Intel Feed
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/40 tabular-nums">
          {events.length} events
        </span>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="font-mono text-[11px] text-muted-foreground/40 py-2">
            {">"} Awaiting intel stream...
            <span className="inline-block w-1.5 h-3 bg-amber-500/40 ml-0.5 animate-pulse" />
          </div>
        ) : (
          events.map((event) => {
            const isNew = event.id === newEventId
            const borderColor = SEVERITY_BORDER[event.severity] || SEVERITY_BORDER.LOW

            return (
              <div
                key={event.id}
                className={`flex gap-4 border-l-2 ${borderColor} pl-4 py-1.5 transition-all duration-700 ${
                  isNew ? "animate-in fade-in slide-in-from-top-2" : ""
                }`}
              >
                {/* Timestamp -- bright and bold */}
                <span className="text-amber-500/80 text-[10px] tabular-nums font-bold shrink-0">
                  {formatTime(event.created_at)}
                </span>

                <div className="flex flex-col md:flex-row md:items-baseline gap-1">
                  {/* Type + Title -- high contrast amber with glow */}
                  <span className="text-amber-400 font-black text-[11px] tracking-tight drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]">
                    [{event.type || "SYS"}] {event.title}
                  </span>
                  <span className="hidden md:inline text-amber-500/30">--</span>
                  {/* Content -- clean white for readability */}
                  <span className="text-zinc-100 text-[11px] leading-relaxed antialiased">
                    {event.content}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
