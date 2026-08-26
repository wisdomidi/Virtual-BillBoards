/**
 * WebMCP (Web Model Context Protocol) Client Runtime Layer
 * Provides native declarative & imperative tool registry for ChatGPT, Chrome Agentic Panels,
 * and autonomous AI agents interacting directly with Virtual Billboard.
 */

export interface WebMCPToolDefinition {
  name: string;
  description: string;
  readOnlyHint?: boolean;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (args: any) => Promise<any>;
}

class WebMCPClientRegistry {
  private tools: Map<string, WebMCPToolDefinition> = new Map();
  public isReady: boolean = false;

  constructor() {
    this.registerStandardTools();
    this.exposeGlobalRuntime();
  }

  public registerTool(tool: WebMCPToolDefinition) {
    this.tools.set(tool.name, tool);
    this.updateGlobalState();
  }

  public getTools(): WebMCPToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public async executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`WebMCP Tool "${name}" not found on LiveBillboards.lol`);
    }
    return await tool.handler(args);
  }

  private registerStandardTools() {
    // 1. Tool: placeAdBid
    this.registerTool({
      name: 'placeAdBid',
      description: 'Programmatically submit a 15-second creative advertisement to the Real-Time Bidding (RTB) billboard queue for any metropolitan feed.',
      readOnlyHint: false,
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Headline copy for the billboard creative' },
          imageUrl: { type: 'string', description: 'Direct image URL (PNG, JPG, WebP) or video URL to display on the 24/7 billboard' },
          targetCityCode: { type: 'string', description: '3-letter target city code (e.g. NYC, TYO, LON, KUL, GLOBAL)', default: 'GLOBAL' },
          bidAmountDollars: { type: 'number', description: 'Bid amount in USD (min $1.00 = 1,000 tokens)', default: 1.00 },
          advertiserName: { type: 'string', description: 'Brand or agent name displayed on the ad banner', default: 'AI Agent' },
          ctaUrl: { type: 'string', description: 'Optional click-through URL for viewers' }
        },
        required: ['title', 'imageUrl']
      },
      handler: async (args) => {
        const guestUid = localStorage.getItem('vb_guest_uid') || 'webmcp_agent';
        const res = await fetch('/api/bids/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-uid': guestUid
          },
          body: JSON.stringify({
            title: args.title,
            imageUrl: args.imageUrl,
            targetCityCode: (args.targetCityCode || 'GLOBAL').toUpperCase(),
            targetCountryCode: 'GLOBAL',
            bidAmountDollars: args.bidAmountDollars || 1.00,
            advertiserName: args.advertiserName || 'WebMCP AI Agent',
            ctaType: args.ctaUrl ? 'website' : 'none',
            ctaUrl: args.ctaUrl || undefined,
            userId: guestUid
          })
        });
        const data = await res.json();
        return data;
      }
    });

    // 2. Tool: fetchActiveBillboard
    this.registerTool({
      name: 'fetchActiveBillboard',
      description: 'Inspect what advertisement is currently broadcasting live on screen, remaining countdown seconds, and reserve floor price for any city feed.',
      readOnlyHint: true,
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'Metropolitan city code (e.g. NYC, TYO, LON, KUL, GLOBAL)', default: 'GLOBAL' },
          country: { type: 'string', description: 'Country code (e.g. US, JP, UK, MY, GLOBAL)', default: 'GLOBAL' }
        }
      },
      handler: async (args) => {
        const city = (args?.city || 'GLOBAL').toUpperCase();
        const country = (args?.country || 'GLOBAL').toUpperCase();
        const res = await fetch(`/api/billboard/active?city=${city}&country=${country}`, { cache: 'no-store' });
        return await res.json();
      }
    });

    // 3. Tool: getCityLeaderboard
    this.registerTool({
      name: 'getCityLeaderboard',
      description: 'Retrieve real-time valuations, advertiser liquidity ranking, and active screen metrics across 200+ global cities.',
      readOnlyHint: true,
      inputSchema: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Maximum number of cities to return (default 20)', default: 20 }
        }
      },
      handler: async (args) => {
        const res = await fetch('/api/cities/leaderboard', { cache: 'no-store' });
        const data = await res.json();
        if (args?.limit && data.leaderboard) {
          return { ...data, leaderboard: data.leaderboard.slice(0, args.limit) };
        }
        return data;
      }
    });

    // 4. Tool: claimCreatorHandle
    this.registerTool({
      name: 'claimCreatorHandle',
      description: 'Claim a custom 24/7 vanity billboard URL (livebillboards.lol/@yourname) for a streamer, celebrity, or creator with 80% automated rev-share.',
      readOnlyHint: false,
      inputSchema: {
        type: 'object',
        properties: {
          handle: { type: 'string', description: 'Desired handle name without @ (e.g. yourname, elonmusk, mrbeast)' }
        },
        required: ['handle']
      },
      handler: async (args) => {
        const clean = (args.handle || '').replace(/^@/, '').toLowerCase().trim();
        return {
          success: true,
          handle: clean,
          billboardUrl: `https://www.livebillboards.lol/@${clean}`,
          obsOverlayUrl: `https://www.livebillboards.lol/overlay?creator=${clean}`,
          payoutRatePercent: 80,
          status: 'claimed'
        };
      }
    });

    // 5. Tool: getWalletBalance
    this.registerTool({
      name: 'getWalletBalance',
      description: 'Fetch the active user or agent ad token balance and remaining 15-second screen plays.',
      readOnlyHint: true,
      inputSchema: { type: 'object', properties: {} },
      handler: async () => {
        const guestUid = localStorage.getItem('vb_guest_uid') || 'default_user';
        const res = await fetch(`/api/wallet/balance?userId=${guestUid}`, { cache: 'no-store' });
        return await res.json();
      }
    });
  }

  private exposeGlobalRuntime() {
    if (typeof window !== 'undefined') {
      const self = this;

      // 1. Standard WebMCP Browser Namespace (ChatGPT In-App Browser & Chrome Agent Panel)
      (window as any).webMCP = {
        version: '1.0.0',
        platform: 'LiveBillboards.lol Virtual Billboard Network',
        listTools: () => self.getTools().map(t => ({
          name: t.name,
          description: t.description,
          readOnlyHint: t.readOnlyHint ?? false,
          inputSchema: t.inputSchema
        })),
        callTool: (name: string, args: any) => self.executeTool(name, args),
        getManifest: () => ({
          schema_version: 'v1',
          name: 'LiveBillboards.lol',
          description: '24/7 Global Infinite Virtual Billboard & Live Stream Ad Network',
          tools: self.getTools().map(t => ({
            name: t.name,
            description: t.description,
            readOnlyHint: t.readOnlyHint ?? false,
            inputSchema: t.inputSchema
          }))
        })
      };

      // 2. Navigator Model Context Protocol API spec
      if (!(navigator as any).modelContext) {
        (navigator as any).modelContext = (window as any).webMCP;
      }

      this.isReady = true;

      // 3. Dispatch webmcp:ready event for agentic extensions & ChatGPT runtime
      window.dispatchEvent(
        new CustomEvent('webmcp:ready', {
          detail: { toolsCount: this.tools.size, tools: (window as any).webMCP.listTools() }
        })
      );
    }
  }

  private updateGlobalState() {
    if (typeof window !== 'undefined' && (window as any).webMCP) {
      window.dispatchEvent(
        new CustomEvent('webmcp:tools-updated', {
          detail: { tools: (window as any).webMCP.listTools() }
        })
      );
    }
  }
}

export const webMCPRegistry = new WebMCPClientRegistry();
