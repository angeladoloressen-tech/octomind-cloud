#!/usr/bin/env python3
"""
OctoSupercomputer Creative Packet Generator

Purpose:
Generate a structured creative-commerce packet for an affiliate/product opportunity.

This first version is deterministic and safe. Later versions can call Hugging Face
Inference API when HF_TOKEN is available in the runtime environment.

Usage:
python scripts/generate_creative_packet.py --product "PLAUD Note Pro" --category "AI productivity gadget" --route "affiliate"
"""

from __future__ import annotations

import argparse
import datetime as dt
from pathlib import Path


def slugify(value: str) -> str:
    return "_".join("".join(ch if ch.isalnum() else " " for ch in value.upper()).split())


def build_packet(product: str, category: str, route: str, audience: str) -> str:
    today = dt.date.today().isoformat()
    return f"""# {product} Creative Packet

Date: {today}
System: OctoSupercomputer
Route: {route}
Category: {category}
Status: draft until route/link/approval is confirmed

## Product role

{product} is treated as a candidate for {audience}.

Do not claim specifications that have not been checked from official sources.

## Buyer personas

1. Busy operator
- Pain: scattered context and weak follow-up
- Desired result: cleaner capture and faster action

2. Creator / solo founder
- Pain: ideas and conversations disappear before becoming content or decisions
- Desired result: turn raw moments into usable material

3. Researcher / learner
- Pain: notes, references, and spoken information become fragmented
- Desired result: organized review material

## Product card draft

Title:
{product} for {category} workflows

Short description:
A product candidate for people who need clearer capture, faster follow-up, and a more organized workflow.

Primary benefit:
Less lost context. More usable next action.

Trust note:
Check official product details before buying. Features, availability, and pricing may vary by region.

CTA:
Explore {product} as part of a practical modern workflow.

Affiliate disclosure placeholder:
This page may contain affiliate links. If you buy through a link, OctoAmazonas may earn a commission at no extra cost to you.

## Short video hooks

### Hook 1: Lost context
First 3 seconds:
Your problem is not information. Your problem is losing the useful part.

Problem line:
Good ideas and important details disappear when there is no capture system.

Demo idea:
Show chaos turning into a clean next-action list.

CTA:
Explore tools that help convert daily noise into usable workflow.

### Hook 2: Creator capture
First 3 seconds:
The best idea usually arrives when you are not ready to write it down.

Problem line:
Creators need capture systems, not only cameras.

Demo idea:
Show walking, thinking, recording, and turning raw notes into content bullets.

CTA:
See how this product could fit into a creator workflow.

### Hook 3: Work memory
First 3 seconds:
Your brain is not a backup drive.

Problem line:
Calls, notes, tasks, and decisions pile up too quickly.

Demo idea:
Show scattered inputs becoming a single clean workflow.

CTA:
Explore practical tools for better follow-up.

## Visual prompt ideas

1. Modern desk setup with laptop, notes, calendar reminders, and a compact productivity gadget, realistic lighting, clean product discovery style, no fake logo.

2. Solo creator walking through a city capturing ideas, natural handheld documentary feeling, practical workflow mood.

3. Before-and-after scene: scattered notes and missed tasks versus organized action list and calm workspace.

## Commerce route

Current route: {route}

Do not publish direct monetized CTA until link, approval, or payment path is confirmed.

## Learning metrics

Track:
- route confirmed
- page published
- link added
- clicks
- replies
- payment or commission signal
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--product", required=True)
    parser.add_argument("--category", default="productivity product")
    parser.add_argument("--route", default="affiliate")
    parser.add_argument("--audience", default="creators, founders, and practical buyers")
    parser.add_argument("--output-dir", default="outputs/creative_packets")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / f"{slugify(args.product)}_PACKET.md"
    output_file.write_text(
        build_packet(args.product, args.category, args.route, args.audience),
        encoding="utf-8",
    )
    print(f"Wrote {output_file}")


if __name__ == "__main__":
    main()
