# @pipeworx/gdacs

[GDACS](https://www.gdacs.org) MCP — Global Disaster Alert and Coordination System: real-time alerts for earthquakes, tropical cyclones, floods, volcanoes, droughts, wildfires. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `events(event_type?, alert_level?, from?, to?, country_iso3?)` — list disaster events
- `event(event_type, event_id, episode_id?)` — single event detail
- `geojson(event_type?, alert_level?)` — current alerts as GeoJSON
- `rss()` — raw RSS feed (xml as text)

`event_type` is one of: `EQ` (earthquake), `TC` (tropical cyclone), `FL` (flood), `VO` (volcano), `DR` (drought), `WF` (wildfire).
`alert_level` is `Green` | `Orange` | `Red`.

## Data source

`https://www.gdacs.org/gdacsapi/api/`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "gdacs": {
      "url": "https://gateway.pipeworx.io/gdacs/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Gdacs data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
