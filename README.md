<!--
---
title: Nebula Backend
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---
-->

<div align="center">

#  Nebula Cloud

### *The Intelligent Infrastructure Guardian*

**From Code Generation to Infrastructure Governance**

![Version](https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Prototype-success?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Multi--Agent-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

<div align="center">

---

## 🌟 **[→ TRY NEBULA CLOUD LIVE ←](https://nebula-cloud-seven.vercel.app/)** 🌟

*Experience the future of infrastructure governance in your browser*

---

</div>


</div>

---

## 🎯 What is Nebula Cloud?

**Nebula Cloud** isn't just another infrastructure-as-code generator. It's an **AI-powered guardian** that stands between you and production disasters.

> *"AI can write code in seconds. But can it make that code secure, compliant, and production-ready?"*

We solve the **Feasibility Gap** — where AI-generated infrastructure looks perfect but hides security vulnerabilities, compliance violations, and cost bombs.

### 💥 The Problem

<table>
<tr>
<td width="50%">

**🔴 Traditional Approach**
```
Developer → AI → Infrastructure
```
❌ Open security groups (0.0.0.0/0)
❌ Public databases
❌ Single-zone deployments
❌ No cost controls
❌ Compliance blind spots

</td>
<td width="50%">

**✅ Nebula Cloud Way**
```
Developer → Multi-Agent Review → Safe Infrastructure
```
✅ Automated security audits
✅ Compliance enforcement
✅ Multi-AZ by default
✅ Cost optimization
✅ Visual + Code sync

</td>
</tr>
</table>

---

## ⚡ The Game Changer: Bi-Directional Sync

**The industry's first truly synchronized visual-to-code infrastructure editor.**

```mermaid
graph LR
    A[Visual Diagram] <-->|Real-Time Sync| B[Terraform Code]
    A -->|Drag Node| C[Code Updates Instantly]
    B -->|Edit HCL| D[Diagram Updates Instantly]

    style A fill:#00ff88,stroke:#00aa55,color:#000
    style B fill:#0088ff,stroke:#0055aa,color:#fff
    style C fill:#ff8800,stroke:#aa5500,color:#fff
    style D fill:#8800ff,stroke:#5500aa,color:#fff
```

**What This Means:**
- 🎨 **Drag an EC2 from Public to Private Subnet** → Terraform `subnet_id` updates automatically
- 💻 **Change `t2.micro` to `t3.large` in code** → Visual node updates instantly
- 🔄 **No more drift** between what you see and what you deploy

---

## 🏗️ Architecture: The Multi-Agent System

Nebula Cloud uses a **three-agent review chain** that mimics how senior engineers actually work:

```mermaid
graph TB
    User[👤 User: Create a banking app] -->|Prompt| AgentA

    AgentA[🚀 Agent A: The Drafter<br/>Groq Llama-3<br/>Speed Layer] -->|Raw Infrastructure| AgentB

    AgentB[🔍 Agent B: The Auditor<br/>Gemini 1.5 Pro<br/>Reasoning Layer] -->|Security Check| PolicyEngine

    AgentB -->|Flags Issues| Warnings[⚠️ Warnings:<br/>- Public DB detected<br/>- Single-AZ setup<br/>- Missing encryption]

    PolicyEngine[🛡️ Agent C: Policy Engine<br/>OPA-Style Rules<br/>Governance Layer] -->|Enforces Rules| Decision

    Decision{Policy<br/>Pass?}
    Decision -->|✅ Approved| Output[📊 Visual Diagram<br/>+ Terraform Code]
    Decision -->|❌ Blocked| Reject[🚫 Deployment Denied<br/>Reason: Region violation]

    Output -->|Bi-Directional Sync| Sync[🔄 Real-Time Updates]

    style AgentA fill:#00ff88,stroke:#00aa55,color:#000
    style AgentB fill:#ffaa00,stroke:#cc7700,color:#000
    style PolicyEngine fill:#ff4444,stroke:#cc0000,color:#fff
    style Output fill:#0088ff,stroke:#0055aa,color:#fff
```

### The Three Guardians

| Agent | Model | Role | Checks |
|-------|-------|------|--------|
| 🚀 **The Drafter** | Groq Llama-3 | Instant code generation | Translates "banking app" → JSON + Terraform |
| 🔍 **The Auditor** | Gemini 1.5 Pro | Security & compliance review | Multi-AZ? Encryption? Private resources? |
| 🛡️ **The Policy Engine** | OPA Rules | Hard enforcement | Blocks shadow IT, enforces regions |

---

## ✨ Features That Make You Invincible

<details open>
<summary><b>🔄 Real-Time Bi-Directional Sync (Industry First)</b></summary>

- Drag nodes on canvas → Terraform rewrites instantly
- Edit `.tf` files → Visual diagram updates in real-time
- **Never** experience diagram-code drift again

</details>

<details>
<summary><b>🤖 Natural Language to Infrastructure</b></summary>

**Input:**
```
"Create a web server with RDS database in a private subnet"
```

**Output:**
- ✅ Full architecture diagram
- ✅ Production-ready Terraform code
- ✅ Security groups configured
- ✅ Multi-AZ enabled by default

</details>

<details>
<summary><b>🔍 Automated Security Auditing</b></summary>

**Real-Time Detection:**
- 🔴 **Critical:** Public databases, 0.0.0.0/0 security groups
- 🟡 **Warning:** Single-AZ deployments, missing encryption
- 🟢 **Approved:** Meets all security standards

</details>

<details>
<summary><b>🛠️ One-Click Auto-Remediation</b></summary>

Found a vulnerability? Click **"Fix Now"** and watch Nebula:
1. Rewrite the Terraform code
2. Update the visual diagram
3. Apply security best practices
4. Mark the issue as ✅ Resolved

</details>

<details>
<summary><b>📜 Policy Enforcement</b></summary>

```python
# Example Policy Rule
IF deployment.region NOT IN ['us-east-1', 'eu-west-1']:
    BLOCK deployment
    REASON: "Data residency violation"
```

Prevents shadow IT and ensures compliance **before** deployment.

</details>

<details>
<summary><b>🎨 Interactive Visual Canvas</b></summary>

- Powered by **React Flow**
- Smart hierarchical layouts (VPC → Subnet → Instance)
- Cyberpunk-themed UI with dark mode
- Drag, zoom, and reorganize with ease

</details>

---


## 🛠️ Tech Stack

<div align="center">

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React Flow](https://img.shields.io/badge/React_Flow-11-FF6B9D?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/🦜_LangChain-0.1-121212?style=for-the-badge)
![Pydantic](https://img.shields.io/badge/Pydantic-2.0-E92063?style=for-the-badge)

### AI & Infrastructure
![Groq](https://img.shields.io/badge/Groq-LPU-FF6B00?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Pro-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Hugging Face](https://img.shields.io/badge/🤗_Hugging_Face-Transformers-FFD21E?style=for-the-badge)
![Terraform](https://img.shields.io/badge/Terraform-1.6-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)

### Database
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

</div>
