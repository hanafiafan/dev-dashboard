"use client";

import * as React from "react";
import { Play, Pause, Radio, Volume2 } from "lucide-react";
import { Card } from "./ui";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/settings";

// Free internet-radio streams (SomaFM — listener-supported, no API key).
const CHANNELS = [
  { name: "Groove Salad", genre: "Ambient beats", url: "https://ice1.somafm.com/groovesalad-128-mp3" },
  { name: "Fluid", genre: "Liquid hip-hop", url: "https://ice1.somafm.com/fluid-128-mp3" },
  { name: "Drone Zone", genre: "Deep ambient", url: "https://ice1.somafm.com/dronezone-128-mp3" },
];

export function MusicWidget({ className }: { className?: string }) {
  const [settings] = useSettings();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [channel, setChannel] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [volume, setVolume] = React.useState(0.7);

  // default volume from Settings (applied while idle)
  React.useEffect(() => {
    if (!playing) setVolume(settings.radioVolume);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.radioVolume]);

  React.useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = volume;
    audio.onplaying = () => {
      setPlaying(true);
      setLoading(false);
      setError(false);
    };
    audio.onpause = () => setPlaying(false);
    audio.onerror = () => {
      setError(true);
      setLoading(false);
      setPlaying(false);
    };
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    setLoading(true);
    setError(false);
    if (!audio.src || !audio.src.includes(CHANNELS[channel].url)) {
      audio.src = CHANNELS[channel].url;
    }
    try {
      await audio.play();
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  const switchChannel = async (i: number) => {
    setChannel(i);
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = playing;
    audio.pause();
    audio.src = CHANNELS[i].url;
    if (wasPlaying) {
      setLoading(true);
      try {
        await audio.play();
      } catch {
        setError(true);
        setLoading(false);
      }
    }
  };

  return (
    <Card className={cn("relative overflow-hidden p-5", className)}>
      <div className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-pink-500/20 to-violet-500/10 blur-2xl" />
      <div className="relative">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Radio className="h-4 w-4 text-muted-foreground" /> Focus Radio
        </h3>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={toggle}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-soft transition active:scale-95"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{CHANNELS[channel].name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {error ? "Stream gagal — coba channel lain" : loading ? "Menyambungkan…" : CHANNELS[channel].genre}
            </div>
          </div>
          {/* equalizer */}
          <div className={cn("flex h-6 items-end gap-0.5", !playing && "opacity-25")}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="eq-bar w-1 rounded-full bg-gradient-to-t from-primary to-violet-500"
                style={{ animationDelay: `${i * 0.18}s`, animationPlayState: playing ? "running" : "paused" }}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-1.5">
          {CHANNELS.map((c, i) => (
            <button
              key={c.name}
              onClick={() => switchChannel(i)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition",
                i === channel ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/25" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
          <Volume2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1"
          />
          <span className="shrink-0 text-[10px] text-muted-foreground">via SomaFM</span>
        </div>
      </div>
    </Card>
  );
}
