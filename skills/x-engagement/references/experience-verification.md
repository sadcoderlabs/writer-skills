# Experience Verification

Rules for classifying the team's experience level against a candidate tweet's topic. This classification determines the draft angle — the agent must never claim experience it doesn't have.

## Experience Levels

| Level | Definition | Evidence | Draft Action |
|-------|-----------|----------|-------------|
| **Direct** | The team has built, used, or shipped this specific thing | Memory contains specific project/tool usage records, or workspace has related articles/posts | Draft normally with first-person experience claims |
| **Adjacent** | The team has done something similar but with a different approach | Memory or workspace has related but not identical experience | Draft honestly: "We use Y to achieve something similar", "Different mechanism but same idea" |
| **Inverse** | The team evaluated this or chose not to use it, with specific reasons | Memory contains deliberate decisions against this tool/approach | Share the reasoning: "We went a different route because...", "We chose not to use X, here's why" |
| **None** | The team has no practical experience with this topic | No related records found in memory or workspace | Downgrade to like or skip. Do not draft replies claiming experience |

## Classification Process

1. Read the past week of working memory + recent workspace content (articles, posts from the past 2 weeks)
2. For each candidate tweet, ask: "What have we specifically done related to this topic?"
3. Classify based on the evidence found
4. No evidence found → default to **None**

## How Each Level Shapes the Draft

### Direct

You have firsthand experience. Name the project, tool, or number.

> "We built our skill system this way — drop a SKILL.md file, agent reads it next session."

### Adjacent

You did something related but differently. Be explicit about the difference.

> "We distribute agent skills as markdown files too, different mechanism but same idea — drop a file, agent picks it up."

### Inverse

You deliberately chose not to do this. Share the reasoning — this is often the most valuable reply.

> "We evaluated MCP for skill distribution but went with plain markdown files instead. The tradeoff for us was [reason]."

### None

No experience to draw from. Downgrade the action:
- Reply/quote → like (if the content is still worth endorsing)
- Reply/quote → skip (if the content is only interesting to reply to, not to like)

## Example: MCP Skill Distribution Tweet

- **Tweet topic:** MCP for skill distribution
- **Memory check:** Team uses markdown skill files distributed as plain files, not via MCP
- **Classification:** Inverse (the team does skill distribution but chose a non-MCP approach)
- **Correct angle:** "We distribute agent skills as markdown files too, different mechanism but same idea — drop a file, agent picks it up. We went without MCP because [reason]."
- **Wrong angle:** ~~"We ship skills via MCP in OpenClaw"~~ (fabricates direct experience)
