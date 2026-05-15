interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * GDACS MCP — Global Disaster Alert and Coordination System.
 *
 * Auth: none.
 */


const BASE = 'https://www.gdacs.org/gdacsapi/api';
const RSS_URL = 'https://www.gdacs.org/xml/rss.xml';
const UA = 'pipeworx-mcp-gdacs/1.0 (+https://pipeworx.io)';

const VALID_TYPES = new Set(['EQ', 'TC', 'FL', 'VO', 'DR', 'WF']);
const VALID_LEVELS = new Set(['Green', 'Orange', 'Red']);

const tools: McpToolExport['tools'] = [
  {
    name: 'events',
    description: 'List disaster events.',
    inputSchema: {
      type: 'object',
      properties: {
        event_type: { type: 'string', description: 'EQ | TC | FL | VO | DR | WF' },
        alert_level: { type: 'string', description: 'Green | Orange | Red' },
        from: { type: 'string', description: 'ISO date.' },
        to: { type: 'string', description: 'ISO date.' },
        country_iso3: { type: 'string' },
      },
    },
  },
  {
    name: 'event',
    description: 'Single event detail.',
    inputSchema: {
      type: 'object',
      properties: {
        event_type: { type: 'string' },
        event_id: { type: 'string' },
        episode_id: { type: 'string' },
      },
      required: ['event_type', 'event_id'],
    },
  },
  {
    name: 'geojson',
    description: 'Current alerts as GeoJSON.',
    inputSchema: {
      type: 'object',
      properties: {
        event_type: { type: 'string' },
        alert_level: { type: 'string' },
      },
    },
  },
  {
    name: 'rss',
    description: 'Raw RSS feed (XML text).',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'events': {
      const params = new URLSearchParams();
      if (args.event_type) params.set('eventlist', validateType(String(args.event_type)));
      if (args.alert_level) params.set('alertlevel', validateLevel(String(args.alert_level)));
      if (args.from) params.set('fromDate', String(args.from));
      if (args.to) params.set('toDate', String(args.to));
      if (args.country_iso3) params.set('country', String(args.country_iso3));
      return gdacsGet(`/events/geteventlist/SEARCH?${params}`);
    }
    case 'event': {
      const t = validateType(reqStr(args, 'event_type', '"EQ"'));
      const id = reqStr(args, 'event_id', '"1471919"');
      const episode = (args.episode_id as string | undefined) ?? '';
      const path = episode
        ? `/events/geteventdata/${t}/${encodeURIComponent(id)}/${encodeURIComponent(episode)}`
        : `/events/geteventdata/${t}/${encodeURIComponent(id)}`;
      return gdacsGet(path);
    }
    case 'geojson': {
      const params = new URLSearchParams();
      if (args.event_type) params.set('eventlist', validateType(String(args.event_type)));
      if (args.alert_level) params.set('alertlevel', validateLevel(String(args.alert_level)));
      return gdacsGet(`/events/geteventlist/MAP?${params}`);
    }
    case 'rss': {
      const res = await fetch(RSS_URL, { headers: { Accept: 'application/xml', 'User-Agent': UA } });
      if (!res.ok) throw new Error(`GDACS RSS: ${res.status}`);
      return { format: 'rss-xml', body: await res.text() };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function validateType(t: string): string {
  if (!VALID_TYPES.has(t)) throw new Error(`event_type must be one of: ${[...VALID_TYPES].join(', ')}.`);
  return t;
}

function validateLevel(l: string): string {
  if (!VALID_LEVELS.has(l)) throw new Error(`alert_level must be one of: ${[...VALID_LEVELS].join(', ')}.`);
  return l;
}

async function gdacsGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`GDACS: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
