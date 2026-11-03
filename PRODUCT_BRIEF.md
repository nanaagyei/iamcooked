# Product Brief: StackRadar

## One-Line Description

StackRadar is a security briefing and dependency-risk assistant for AI-assisted builders and small teams.

## Core Positioning

Modern builders ship fast with AI coding tools, open-source packages, and managed platforms. This speed creates a blind spot: users often do not know what dependencies were installed, what those packages do, or when a vulnerability or supply-chain compromise affects their app.

StackRadar translates security incidents into understandable, personalized, and actionable guidance.

## Problem

Security information is fragmented across:

- CVE databases
- GitHub advisories
- OSV
- CISA alerts
- Vendor blogs
- Twitter/X
- Reddit
- Hacker News
- Discord communities
- Maintainer issue threads

Technical users may know how to interpret these signals, but many AI-assisted builders do not.

They need a trusted layer that explains:

- what happened,
- whether they are affected,
- how urgent it is,
- what action to take,
- and what the underlying concept means.

## Target Audience

### Primary

- AI-assisted builders
- Indie hackers
- Solo SaaS founders
- Junior developers
- Nontraditional developers
- Small engineering teams without dedicated security staff

### Secondary

- Bootcamps
- Developer educators
- Open-source maintainers
- Technical founders
- Agencies building apps for clients

## Core Job-To-Be-Done

When I hear about a package compromise, CVE, breach, or supply-chain attack, I want to know whether my app is affected and what I should do, without needing to become a security expert.

## Product Principles

1. Personal relevance beats generic news.
2. Plain English first, technical depth second.
3. Every claim must be source-backed.
4. Do not create panic.
5. Always provide action.
6. Label uncertainty.
7. Teach users while helping them.
8. Security UX should be calm, elegant, and precise.
9. The app should feel like a trusted technical advisor, not a fear-driven scanner.
10. The MVP should stay narrow enough to ship.

## MVP Scope

The MVP includes:

- Public incident feed
- Incident detail pages
- AI-generated beginner and technical summaries
- Lockfile upload scanner
- OSV vulnerability lookup
- GitHub advisory enrichment
- CISA KEV enrichment
- Personalized scan report
- Email capture and weekly digest
- Admin review dashboard
- Source-backed claim model

## MVP Exclusions

The MVP excludes:

- GitHub App integration
- CLI scanner
- VS Code extension
- Slack alerts
- Auto PR remediation
- Multi-language package ecosystems beyond JavaScript
- Enterprise compliance reports
- SOC2 workflows
- Paid billing