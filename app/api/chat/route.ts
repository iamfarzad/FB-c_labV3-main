import { GoogleGenAI } from '@google/genai';
import { embedTexts } from '@/lib/embeddings/gemini'
import { queryTopK } from '@/lib/embeddings/query'
import { streamPerplexity } from '@/lib/providers/perplexity';
import { getSupabase } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';
import { chatRequestSchema, validateRequest, sanitizeString } from '@/lib/utils';
import { logServerActivity } from '@/lib/server-activity-logger';
// Legacy imports removed - using new Conversational Intelligence system
import { checkDevelopmentConfig } from '@/lib/config';
import { withFullSecurity } from '@/lib/api-security';
import { ModelSelector } from '@/lib/model-selector';
import { enforceBudgetAndLog } from '@/lib/token-usage-logger';
import URLContextService from '@/lib/services/url-context-service';
import GoogleSearchService from '@/lib/services/google-search-service';
import { createOptimizedConfig, optimizeConversation, type ConversationMessage } from '@/lib/gemini-config-enhanced';
import { shouldUseMockForRequest, createMockRedirectResponse, logApiRouting } from '@/lib/api-router';
import { withApiMiddleware, API_CONFIGS, type MiddlewareContext } from '@/lib/api-middleware';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
}

interface EnhancedChatData {
  hasWebGrounding?: boolean;
  leadContext?: any;
  enableUrlContext?: boolean;
  enableGoogleSearch?: boolean;
  thinkingBudget?: number;
  tools?: Array<{
    urlContext?: Record<string, never>;
    googleSearch?: Record<string, never>;
  }>;
  conversationSessionId?: string;
  enableLeadGeneration?: boolean;
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const key = ip;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

async function authenticateRequest(req: NextRequest): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    const supabase = getSupabase();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { success: false, error: 'Invalid or expired token' };
    }

    return { success: true, userId: user.id };
  } catch (error) {
    return { success: false, error: 'Authentication service unavailable' };
  }
}

function logConsoleActivity(level: 'info' | 'warn' | 'error', message: string, metadata?: any): string {
  const correlationId = Math.random().toString(36).substring(7);
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    ...metadata
  };

  console.info(JSON.stringify(logEntry));
  return correlationId;
}

async function processUrlContext(message: string, correlationId: string): Promise<string> {
  try {
    // Extract URLs from the message
    const urls = URLContextService.extractURLsFromText(message);
    
    if (urls.length === 0) {
      return '';
    }

    console.info(`🔗 Found ${urls.length} URLs to analyze:`, urls);

    // Analyze URLs (limit to first 3 for performance)
    const urlsToAnalyze = urls.slice(0, 3);
    const urlAnalyses = await URLContextService.analyzeMultipleURLs(urlsToAnalyze);

    let contextInfo = '\n\n**URL Context Analysis:**\n';
    
    urlAnalyses.forEach((analysis, index) => {
      if (analysis.error) {
        contextInfo += `\n${index + 1}. **${analysis.url}** - Error: ${analysis.error}\n`;
      } else {
        contextInfo += `\n${index + 1}. **${analysis.title || 'Untitled'}**\n`;
        contextInfo += `   URL: ${analysis.url}\n`;
        contextInfo += `   Description: ${analysis.description || 'No description available'}\n`;
        contextInfo += `   Word Count: ${analysis.wordCount} words (${analysis.readingTime} min read)\n`;
        
        if (analysis.metadata.author) {
          contextInfo += `   Author: ${analysis.metadata.author}\n`;
        }
        
        if (analysis.metadata.publishDate) {
          contextInfo += `   Published: ${analysis.metadata.publishDate}\n`;
        }
        
        // Include a snippet of the content
        const contentSnippet = analysis.extractedText.substring(0, 300);
        contextInfo += `   Content Preview: ${contentSnippet}${analysis.extractedText.length > 300 ? '...' : ''}\n`;
      }
    });

    return contextInfo;
  } catch (error: any) {
    console.error('URL Context Processing Error:', error);
    return `\n\n**URL Context Analysis Error:** ${error.message}`;
  }
}

type SourceLink = { url: string; title?: string }

async function processGoogleSearch(message: string, leadContext: any, correlationId: string): Promise<{ text: string, sources: SourceLink[] }> {
  try {
    if (!GoogleSearchService.isConfigured()) {
      console.info('Google Search API not configured, skipping search');
      return { text: '', sources: [] };
    }

    // Determine search strategy based on message content and lead context
    let searchResults = '';
    const sources: SourceLink[] = []
    
    // Check if message contains specific search intent
    const searchIntentKeywords = ['search', 'find', 'look up', 'research', 'what is', 'who is', 'tell me about'];
    const hasSearchIntent = searchIntentKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    if (hasSearchIntent) {
      // Extract search query from message
      let searchQuery = message;
      
      // Clean up the query
      searchIntentKeywords.forEach(keyword => {
        searchQuery = searchQuery.replace(new RegExp(keyword, 'gi'), '').trim();
      });
      
      // Remove common question words
      searchQuery = searchQuery.replace(/^(what|who|when|where|why|how)\s+/gi, '').trim();
      
      if (searchQuery.length > 0) {
        console.info(`🔍 Performing Google search for: "${searchQuery}"`);
        
        const response = await GoogleSearchService.search(searchQuery, {
          num: 5,
          safe: 'active',
        });
        
        if (response.items && response.items.length > 0) {
          searchResults += '\n\n**Google Search Results:**\n';
          searchResults += GoogleSearchService.formatResultsForAI(response);
          try {
            for (const it of response.items.slice(0, 5)) sources.push({ url: it.link, title: it.title })
          } catch {}
        }
      }
    }

    // If we have lead context, search for additional information about the person/company
    if (leadContext && leadContext.name && leadContext.name.trim() !== '') {
      console.info(`🔍 Searching for lead information: ${leadContext.name}`);
      
      const personSearch = await GoogleSearchService.searchPerson(
        leadContext.name,
        leadContext.company,
        ['LinkedIn', 'profile', 'biography']
      );
      
      if (personSearch.items && personSearch.items.length > 0) {
        searchResults += '\n\n**Lead Research Results:**\n';
        searchResults += `Research for ${leadContext.name}${leadContext.company ? ` at ${leadContext.company}` : ''}:\n\n`;
        
        personSearch.items.slice(0, 3).forEach((item, index) => {
          searchResults += `${index + 1}. **${item.title}**\n`;
          searchResults += `   ${item.snippet}\n`;
          searchResults += `   Source: ${item.link}\n\n`;
          try { sources.push({ url: item.link, title: item.title }) } catch {}
        });
      }
      
      // Also search for company information if available
      if (leadContext.company && leadContext.company.trim() !== '') {
        console.info(`🔍 Searching for company information: ${leadContext.company}`);
        
        const companySearch = await GoogleSearchService.searchCompany(
          leadContext.company,
          ['about', 'business', 'services']
        );
        
        if (companySearch.items && companySearch.items.length > 0) {
          searchResults += `\n**Company Research Results:**\n`;
          searchResults += `Research for ${leadContext.company}:\n\n`;
          
          companySearch.items.slice(0, 2).forEach((item, index) => {
            searchResults += `${index + 1}. **${item.title}**\n`;
            searchResults += `   ${item.snippet}\n`;
            searchResults += `   Source: ${item.link}\n\n`;
            try { sources.push({ url: item.link, title: item.title }) } catch {}
          });
        }
      }
    }

    return { text: searchResults, sources };
  } catch (error: any) {
    console.error('Google Search Processing Error:', error);
    return { text: `\n\n**Google Search Error:** ${error.message}` , sources: [] };
  }
}

// Legacy stage instructions removed - using new intelligence system

async function buildEnhancedSystemPrompt(leadContext: any, currentMessage: string, sessionId: string | null): Promise<string> {
  const basePrompt = `You are F.B/c AI — Farzad Bayat, Consulting. One person. Speak in first person.

  About me:
  - I help teams ship AI that actually moves the business.
  - Focus: discovery workshops, ROI/feasibility, rapid prototyping, productionization, enablement.

Services to reference when asked:
- Discovery Workshop (1–2 days): map high-ROI automations, align KPIs, leave with a plan + prototype scope.
- ROI & Feasibility: quantify time/cost savings, risk, and path-to-prod.
- Rapid Prototyping: get a working demo in days.
- Integration & Launch: wire into tools, auth, data, and monitoring.
- Team Enablement: teach prompt/agent patterns, guardrails, and ops.

Abilities:
- Research, draft plans, estimate ROI, outline architectures, create prompts/docs/next steps.

Core Principles:
1. Actionable, business-focused advice
2. Clarify context; ask targeted follow-ups
3. Concrete next steps and implementation guidance
4. Cost-benefit and ROI thinking by default
5. Professional but approachable; light wit

  Response Style:
  - Be concise but complete; prefer bullets for options/plans
  - Provide specific examples and recommendations
  - Ask follow-ups only when it unblocks value
  - Use activity markers where helpful: [ACTIVITY_IN:User does X], [ACTIVITY_OUT:I deliver Y] (UI renders chips)
  - Never call me "Puck". Never claim I am a team. Do not use “we” for identity; use “I”.
  - Early in the conversation, collect name and work email once (business domain preferred). Validate and proceed; do not re-ask.
  
  Persona (Farzad-like):
  - Direct, practical, a bit cheeky; witty one-liners welcome
  - Friendly and human; tasteful emoji sparingly
  - No corporate fluff; cut to the chase, propose next steps
  - Answer any reasonable question first, then tie back to value/impact
  - If uncertain, say what you'd try next and why (briefly)
  - Avoid boilerplate disclaimers; keep momentum
  - Aggressive brevity when in lead mode: ≤80 words, ≤3 bullets, end with one specific CTA
`

  // Add lead context if available and valid
  console.info('🔍 Lead context received:', { leadContext, sessionId });
  
  if (leadContext && leadContext.name && leadContext.name.trim() !== '') {
    let enhancedContext = `${basePrompt}

Current Client Context:
- Name: ${leadContext.name}
- Company: ${leadContext.company || 'Not specified'}
- Role: ${leadContext.role || 'Not specified'}
- Industry: ${leadContext.industry || 'Not specified'}
- Email: ${leadContext.email || 'Not specified'}`

    // Legacy lead search removed - using new intelligence system

    enhancedContext += `

Personalize your responses for ${leadContext.name} and their specific business context.`

    return enhancedContext;
  }

  // If no valid lead context, use a generic greeting
  return `${basePrompt}

Welcome! I'm here to help you with your business consulting needs. Please tell me about your company and what you'd like to achieve with AI automation or digital transformation.`
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const correlationId = logConsoleActivity('info', 'Chat request started');
  
  // Check if we should redirect to mock endpoint
  if (process.env.NODE_ENV === 'development') {
    logApiRouting(); // Log current routing configuration
    
    const mockRedirect = createMockRedirectResponse(req);
    if (mockRedirect) {
      return mockRedirect;
    }
  }
  
  try {
    // Get client IP for rate limiting and demo session tracking
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Rate limiting check
    if (!checkRateLimit(ip, 20, 60000)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }

    // Authentication check (allow anonymous access for public chat)
    let auth: { success: boolean; userId?: string; error?: string };
    
    // Try authentication first, but allow anonymous access if it fails
    auth = await authenticateRequest(req);
    if (!auth.success) {
      // Allow anonymous access for public chat functionality
      auth = { success: true, userId: `anon-${Date.now()}-${Math.random().toString(36).substring(7)}`, error: undefined };
      logConsoleActivity('info', 'Anonymous user accessing chat', { ip, correlationId, userId: auth.userId });
    } else {
      logConsoleActivity('info', 'Authenticated user accessing chat', { ip, correlationId, userId: auth.userId });
    }

    // Get session ID from headers or cookies
    const sessionId = req.headers.get('x-intelligence-session-id') || req.cookies.get('demo-session-id')?.value;

    // Authentication check (optional for demo). Treat anon-* as unauthenticated
    const isAuthenticated = !!(auth.userId && !auth.userId.startsWith('anon-'));

    // Parse and validate request
    const rawData = await req.json();
    console.info(`[CHAT_TIMING] request-json-parsed +${Date.now() - startTime}ms`, { correlationId })
    console.info('📥 Chat API Request:', {
      messageCount: rawData.messages?.length,
      sessionId: rawData.sessionId,
      conversationSessionId: rawData.conversationSessionId,
      enableLeadGeneration: rawData.enableLeadGeneration,
      hasMessages: !!rawData.messages
    });
    
    const validation = validateRequest(chatRequestSchema, rawData);
    
    if (!validation.success) {
      return new Response(JSON.stringify({
        error: 'Validation failed',
        details: validation.errors
      }), { status: 400 });
    }

    console.info(`[CHAT_TIMING] validation-done +${Date.now() - startTime}ms`, { correlationId })
    const { messages, data = {} } = validation.data;
    const enhancedData = data as EnhancedChatData;
    const { 
      hasWebGrounding = false, 
      leadContext,
      enableUrlContext = true,
      enableGoogleSearch = true,
      thinkingBudget = -1,
      tools = [{ urlContext: {} }, { googleSearch: {} }],
      conversationSessionId,
      // Default ON; can disable with LEAD_STAGES_ENABLED=false
      enableLeadGeneration = true
    } = enhancedData;

    // Enforce consent hard-gate: require cookie fbc-consent.allow === true
    const consentCookie = req.cookies.get('fbc-consent')?.value
    let consentAllow = false
    let consentDomains: string[] = []
    if (consentCookie) {
      try {
        const parsed = JSON.parse(consentCookie)
        consentAllow = !!parsed.allow
        if (Array.isArray(parsed.allowedDomains)) consentDomains = parsed.allowedDomains
      } catch {}
    }
    const publicChatAllow = process.env.PUBLIC_CHAT_ALLOW === 'true'
    if (!consentAllow && !publicChatAllow) {
      return new Response(JSON.stringify({ error: 'CONSENT_REQUIRED' }), { status: 403 })
    }
    console.info(`[CHAT_TIMING] consent-checked +${Date.now() - startTime}ms`, { correlationId })

    // Sanitize messages
    const sanitizedMessages = messages.map((message: Message) => ({
      ...message,
      content: sanitizeString(message.content)
    }));

    const currentMessage = sanitizedMessages[sanitizedMessages.length - 1]?.content || '';
    // Persist last_user_message to conversation_contexts for server-side suggestions
    try {
      const sid = (req.headers.get('x-intelligence-session-id') || req.cookies.get('demo-session-id')?.value || '').trim()
      if (sid && currentMessage.trim()) {
        const supabase = getSupabase()
        await supabase.from('conversation_contexts').update({ last_user_message: currentMessage }).eq('session_id', sid)
      }
    } catch {}

    // Initialize Conversational Intelligence if enabled
    let intelligenceResult = null;
    let leadData = leadContext;
    
    console.info('🔍 Intelligence check:', {
      enableLeadGeneration,
      conversationSessionId,
      sessionId,
      condition: enableLeadGeneration && (conversationSessionId || sessionId)
    });
    
    const intelligenceEnabled = process.env.INTELLIGENCE_ENABLED !== 'false'
    if (enableLeadGeneration && intelligenceEnabled && (conversationSessionId || sessionId)) {
      console.info(`[CHAT_TIMING] intelligence-start +${Date.now() - startTime}ms`, { correlationId })
      try {
        const effectiveSessionId = conversationSessionId || sessionId || `session-${Date.now()}`;
        
        console.info('🎯 Processing with Conversational Intelligence:', effectiveSessionId);
        
        // Detect intent from user message
        const intentResponse = await fetch(`${req.nextUrl.origin}/api/intelligence/intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId: effectiveSessionId, 
            userMessage: currentMessage 
          })
        });
        
        if (intentResponse.ok) {
          const intentData = await intentResponse.json();
          console.info('🎯 Intent detected:', intentData);
        }
        
        // Get tool suggestions
        const suggestionsResponse = await fetch(`${req.nextUrl.origin}/api/intelligence/suggestions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId: effectiveSessionId,
            stage: 'INTENT'
          })
        });
        
        if (suggestionsResponse.ok) {
          const suggestionsData = await suggestionsResponse.json();
          console.info('🎯 Suggestions generated:', suggestionsData);
          intelligenceResult = suggestionsData;
        }
        
        // Update lead data with any new information from context
        try {
          const contextResponse = await fetch(`${req.nextUrl.origin}/api/intelligence/context?sessionId=${effectiveSessionId}`);
          if (contextResponse.ok) {
            const contextData = await contextResponse.json();
            if (contextData.output?.lead) {
              leadData = { ...leadData, ...contextData.output.lead };
            }
          }
        } catch (error) {
          console.warn('Context fetch failed:', error);
        }
        
        console.info('🎯 Intelligence processed:', {
          sessionId: effectiveSessionId,
          intelligenceResult,
          leadData: leadData
        });
        console.info(`[CHAT_TIMING] intelligence-done +${Date.now() - startTime}ms`, { correlationId })
        
        // Company research is now handled by the intelligence system
        // No additional fallback needed
        
      } catch (error) {
        console.error('❌ Conversation state management error:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        // Continue without conversation state if there's an error
      }
    }

    // Process URL context if enabled
    let urlContext = '';
    if (enableUrlContext) {
      console.info(`[CHAT_TIMING] url-context-start +${Date.now() - startTime}ms`, { correlationId })
      urlContext = await processUrlContext(currentMessage, correlationId);
      console.info(`[CHAT_TIMING] url-context-done +${Date.now() - startTime}ms`, { correlationId })
    }

    // Process Google Search if enabled
    let searchResultsText = ''
    let searchSources: Array<{ url: string; title?: string }> = []
    if (enableGoogleSearch) {
      console.info(`[CHAT_TIMING] search-start +${Date.now() - startTime}ms`, { correlationId })
      const r = await processGoogleSearch(currentMessage, leadContext, correlationId)
      searchResultsText = r.text
      searchSources = r.sources
      console.info(`[CHAT_TIMING] search-done +${Date.now() - startTime}ms`, { correlationId })
    }

    // Derive candidate URLs for Gemini urlContext tool (with env gating)
    const urlContextEnabled = (process.env.URL_CONTEXT_ENABLED ?? 'true') === 'true'
    const urlContextMax = Number(process.env.URL_CONTEXT_MAX_URLS ?? 10)
    const urlAllowedDomains = String(process.env.URL_CONTEXT_ALLOWED_DOMAINS ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const urlsForContext: string[] = []
    try {
      // from user message
      const urlMatches = currentMessage.match(/https?:\/\/[^\s)]+/g) || []
      urlsForContext.push(...urlMatches)
      // from lead email domain or provided companyUrl
      const emailDomain = (leadContext?.email || '').split('@')[1]
      if (typeof leadContext?.companyUrl === 'string' && leadContext.companyUrl.startsWith('http')) urlsForContext.push(leadContext.companyUrl)
      else if (emailDomain) urlsForContext.push(`https://${emailDomain}`)
      // optional: add top search sources (kept small to avoid token bloat)
      for (const s of searchSources.slice(0, 2)) if (s?.url) urlsForContext.push(s.url)
    } catch {}

    function withinAllowedDomains(u: string): boolean {
      if (!urlAllowedDomains.length) return true
      try {
        const host = new URL(u).hostname
        return urlAllowedDomains.some(dom => host === dom || host.endsWith(`.${dom}`))
      } catch { return false }
    }

    const uniqueUrlsForContext = (enableUrlContext && urlContextEnabled)
      ? Array.from(new Set(urlsForContext)).filter(withinAllowedDomains).slice(0, urlContextMax)
      : []

    // Estimate tokens and select model
    const estimatedTokens = sanitizedMessages.reduce((total, msg) => total + (msg.content?.length || 0) * 0.3, 0);
    const modelSelection = {
      model: ModelSelector.selectModel('chat', { prioritizeLatency: false }),
      reason: 'chat-optimized'
    };

    // Log AI processing start activity
    const processingActivityId = await logServerActivity({
      type: 'ai_thinking',
      title: 'Processing User Message',
      description: `Analyzing ${sanitizedMessages.length} messages (${estimatedTokens} tokens)`,
      status: 'in_progress',
      metadata: {
        correlationId,
        sessionId,
        model: modelSelection.model,
        estimatedTokens,
        hasWebGrounding
      }
    });


    // Check user budget if authenticated
    if (isAuthenticated && auth.userId) {
      const budgetCheck = await enforceBudgetAndLog(
        auth.userId,
        sessionId,
        'chat',
        modelSelection.model,
        estimatedTokens,
        estimatedTokens * 0.5, // Estimate output tokens
        true
      );

      if (!budgetCheck.allowed) {
        // Log failed activity
        await logServerActivity({
          type: 'error',
          title: 'Budget Limit Reached',
          description: budgetCheck.reason,
          status: 'failed',
          metadata: { correlationId, userId: auth.userId, suggestedModel: budgetCheck.suggestedModel }
        });

        return new Response(JSON.stringify({
          error: 'Budget limit reached',
          message: budgetCheck.reason,
          suggestedModel: budgetCheck.suggestedModel
        }), { status: 429 });
      }
    }

    // Build system prompt with enhanced context
    let systemPrompt = await buildEnhancedSystemPrompt(leadContext, messages[messages.length - 1]?.content || '', sessionId || null);

    // Optional memory enrichment (pgvector) under flag
    if (process.env.EMBEDDINGS_ENABLED === 'true' && sessionId) {
      try {
        const currentText = messages[messages.length - 1]?.content || ''
        if (currentText.trim()) {
          const vec = await embedTexts([currentText], 1536)
          if (vec && vec[0]) {
            const hits = await queryTopK(sessionId, vec[0], 5)
            if (Array.isArray(hits) && hits.length) {
              const mem = hits.map((h: any, i: number) => `M${i + 1}. ${h.text}`).join('\n')
              systemPrompt += `\n\nMemory Facts (top-k):\n${mem}`
            }
          }
        }
      } catch {}
    }
    
    // Add intelligence context if available
    if (intelligenceResult) {
      systemPrompt += `\n\n**Intelligence Context:**
- Suggestions Available: ${intelligenceResult.output?.suggestions?.length || 0}
- Lead Name: ${leadData?.name || 'Not provided yet'}
- Lead Email: ${leadData?.email || 'Not provided yet'}
- Company: ${leadData?.company || leadData?.emailDomain || 'Not identified yet'}
- Intent Type: ${intelligenceResult.output?.intent?.type || 'unknown'}

**Available Actions:**
${intelligenceResult.output?.suggestions?.map((s: any) => `- ${s.label}`).join('\n') || 'None detected'}
`;
    }
    
    // Append URL context, explicit URL list (for urlContext tool), and search results to system prompt
    if (urlContext) systemPrompt += urlContext
    if (uniqueUrlsForContext.length) {
      systemPrompt += `\n\nURL Context Sources (use when relevant):\n${uniqueUrlsForContext.map(u => `- ${u}`).join('\n')}`
    }
    if (searchResultsText) systemPrompt += searchResultsText

    // Provider alias mapping: allow "google" as synonym for gemini
    const providerRaw = (process.env.PROVIDER || 'gemini').toLowerCase()
    const provider = providerRaw === 'google' ? 'gemini' : providerRaw
    const usePerplexity = provider === 'perplexity'
    let responseStream: any
    let actualInputTokens = 0
    let actualOutputTokens = 0

    // Prepare optimized content for Gemini with caching and summarization
    const conversationMessages: ConversationMessage[] = sanitizedMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : (msg.role === 'system' ? 'user' : msg.role as 'user' | 'model'),
      content: msg.content
    }));

    console.info(`[CHAT_TIMING] optimize-start +${Date.now() - startTime}ms`, { correlationId })
    const optimizedContent = await optimizeConversation(
      conversationMessages,
      systemPrompt,
      sessionId || 'default',
      4000
    );
    console.info(`[CHAT_TIMING] optimize-done +${Date.now() - startTime}ms`, { correlationId })

    // Create optimized generation config with token limits
    const funPersona = ((process.env.PERSONALITY || process.env.PERSONA || '').toLowerCase() === 'farzad') || process.env.PERSONA_FUN === 'true'
    const leadModeAggressive = (process.env.LEAD_MODE || '').toLowerCase() === 'aggressive'
    let dynamicTemperature = funPersona ? 0.85 : 0.7
    if (leadModeAggressive) dynamicTemperature = Math.min(dynamicTemperature, 0.65)
    if (!leadContext || (!leadContext.name && !leadContext.company)) dynamicTemperature = Math.min(dynamicTemperature + 0.05, 0.95)

    const optimizedConfig = createOptimizedConfig('chat', {
      maxOutputTokens: leadModeAggressive ? 512 : 2048,
      temperature: dynamicTemperature
    });

    // Generate response with enhanced configuration
    actualInputTokens = optimizedContent.estimatedTokens
    const contents = optimizedContent.contents

    console.info(`[CHAT_TIMING] provider-call-start (${provider}) +${Date.now() - startTime}ms`, { correlationId })
    if (provider === 'mock') {
      // Cheap mock stream for dev/preview
      async function *gen() {
        yield { text: 'Mock response: ' }
        yield { text: 'hello from F.B/c. ' }
        yield { text: 'Switch PROVIDER=perplexity for live grounded output.' }
      }
      responseStream = gen()
      actualOutputTokens = 64
    } else if (usePerplexity) {
      // Perplexity streaming path
      const pplxKey = process.env.PERPLEXITY_API_KEY
      if (!pplxKey) throw new Error('Missing PERPLEXITY_API_KEY')
      const messagesForPplx: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...sanitizedMessages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        })),
      ]
      const stageForModel = intelligenceResult?.output?.stage || 'INTENT'
      const earlyStage = stageForModel === 'GREETING' || stageForModel === 'NAME_COLLECTION'
      const pplxModel = earlyStage ? 'sonar-reasoning-pro' : 'sonar-pro'
      const enableSearch = !earlyStage
      responseStream = streamPerplexity({
        apiKey: pplxKey,
        messages: messagesForPplx,
        options: {
          model: pplxModel,
          web_search: enableSearch,
          // Narrow to consented domains if provided
          search_domain_filter: consentDomains,
          web_search_options: { search_context_size: 'low' },
          max_output_tokens: earlyStage ? 256 : 1024,
          temperature: earlyStage ? 0.1 : 0.3
        }
      })
      actualOutputTokens = 1024 // conservative cap for logging
    } else if (provider === 'gemini') {
      // Fallback to existing Gemini path
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set')
      }
      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      const model = genAI.models.generateContentStream
      const config = {
        ...optimizedConfig,
        thinkingConfig: { thinkingBudget: thinkingBudget },
        tools,
      }
      console.info(`💡 Chat optimization: ${optimizedContent.usedCache ? 'Used cache' : 'Created new'}, estimated tokens: ${optimizedContent.estimatedTokens}${optimizedContent.summary ? ', with summary' : ''}`)
      try {
        responseStream = await model({ model: modelSelection.model, config, contents })
        actualOutputTokens = Math.min(optimizedConfig.maxOutputTokens, actualInputTokens * 0.6)
      } catch (error: any) {
        await logServerActivity({ type: 'error', title: 'AI Response Generation Failed', description: error.message || 'Unknown error during AI processing', status: 'failed', metadata: { correlationId, sessionId, model: modelSelection.model, error: error.message } })
        logConsoleActivity('error', 'Failed to generate response', { correlationId, error: error.message || 'Unknown error', sessionId, model: modelSelection.model })
        throw error
      }
    } else {
      throw new Error(`Unsupported provider: ${provider}`)
    }
    console.info(`[CHAT_TIMING] provider-call-done (${provider}) +${Date.now() - startTime}ms`, { correlationId })

    // Usage tracking is now handled client-side with the simplified demo session system

    if (isAuthenticated && auth.userId) {
      await enforceBudgetAndLog(
        auth.userId,
        sessionId,
        'chat',
        modelSelection.model,
        actualInputTokens,
        actualOutputTokens,
        true,
        undefined,
        { correlationId, modelSelection: modelSelection.reason }
      );
    }

    // Log successful completion
    await logServerActivity({
      type: 'ai_stream',
      title: 'AI Response Generated',
      description: `Generated response using ${modelSelection.model} (${actualInputTokens + actualOutputTokens} tokens)`,
      status: 'completed',
      metadata: {
        correlationId,
        sessionId,
        model: modelSelection.model,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        processingTime: Date.now() - startTime
      }
    });

    // Heuristic coach: suggest next best capability based on the latest user message
    function detectYouTubeURL(text: string): string | null {
      try {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
        const m = text?.match(regex)
        return m ? m[0] : null
      } catch { return null }
    }
    function computeNextBestCapability(message: string, ctx: { hasUrlContext: boolean; hasSearch: boolean; lead?: any, stage?: any }): { nextBest: string | null, suggestions: string[] } {
      const m = (message || '').toLowerCase()
      const suggestions: string[] = []
      if (detectYouTubeURL(m)) suggestions.push('video')
      if (/\b(roi|payback|savings|cost|hours|time|efficiency)\b/.test(m)) suggestions.push('roi')
      if (/\b(upload|document|pdf|docx|spec|process)\b/.test(m)) suggestions.push('doc')
      if (/\b(screenshot|image|photo|picture)\b/.test(m)) suggestions.push('image')
      if (/\b(screen ?share|share your screen|my screen)\b/.test(m)) suggestions.push('screen')
      if (ctx.hasUrlContext) suggestions.push('webpreview')
      if (ctx.hasSearch) suggestions.push('search')
      // Stage-aware nudge
      if (!suggestions.length && ctx.stage === 3 /* EMAIL_CAPTURE */) suggestions.push('doc')
      if (!suggestions.length && ctx.stage === 5 /* PROBLEM_DISCOVERY */) suggestions.push('screen')
      return { nextBest: suggestions[0] || null, suggestions }
    }

    // Create SSE stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          // Send intelligence state as first event if available
          console.info('🎯 Stream start - intelligenceResult:', intelligenceResult ? {
            suggestions: intelligenceResult.output?.suggestions?.length || 0,
            hasLeadData: !!leadData
          } : 'null');
          
          if (intelligenceResult) {
            const stateData = {
              conversationStage: 'INTENT',
              suggestions: intelligenceResult.output?.suggestions || [],
              leadData: leadData ? {
                name: leadData.name,
                email: leadData.email,
                company: leadData.company || leadData.emailDomain
              } : undefined
            };
            console.info('🎯 Sending intelligence state:', stateData);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(stateData)}\n\n`));
          }

          // Send coach suggestion if we can infer one from the latest user message and context
          try {
    const nb = computeNextBestCapability(currentMessage, { hasUrlContext: !!urlContext, hasSearch: !!searchResultsText, lead: leadData, stage: 'INTENT' })
            if (nb.nextBest) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ nextBest: nb.nextBest, suggestions: nb.suggestions })}\n\n`))
            }
            // Emit capabilityUsed for context processors
            if (urlContext) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ capabilityUsed: 'webpreview' })}\n\n`))
            if (searchResultsText) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ capabilityUsed: 'googleSearch' })}\n\n`))
          } catch (e) {
            console.warn('coach suggestion failed', e)
          }
          
          if (provider === 'mock') {
            for await (const chunk of responseStream) {
              const text = (chunk as any)?.text || ''
              if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`))
            }
          } else if (usePerplexity) {
            for await (const evt of responseStream) {
              if (evt.content) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: evt.content })}\n\n`))
              if (evt.citations) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources: evt.citations.map((u: string) => ({ url: u })) })}\n\n`))
            }
          } else {
            let finalText = ''
            for await (const chunk of responseStream) {
              const text = chunk.text || ''
              finalText += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`))
            }
            // Emit sources gathered from GoogleSearchService alongside Gemini output
            let sourcesOut = searchSources
            try {
              // Extract bare URLs from finalText to provide minimal citations when search is disabled
              const urlRegex = /https?:\/\/[^\s)]+/g
              const found = Array.from(finalText.matchAll(urlRegex)).map(m => ({ url: m[0] }))
              if (found.length) {
                // merge and de-dup by url
                const seen = new Set<string>()
                sourcesOut = [...sourcesOut, ...found].filter(s => {
                  if (!s?.url) return false
                  if (seen.has(s.url)) return false
                  seen.add(s.url)
                  return true
                })
              }
            } catch {}
            if (sourcesOut.length) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources: sourcesOut })}\n\n`))
          }
          controller.close();
        } catch (error: any) {
          // Log stream error
          await logServerActivity({
            type: 'error',
            title: 'Stream Error',
            description: 'Error during response streaming',
            status: 'failed',
            metadata: { correlationId, error: error.message || 'Unknown error' }
          });

          logConsoleActivity('error', 'Stream error', { correlationId, error: error.message || 'Unknown error' });
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Correlation-ID': correlationId,
        'X-Response-Time': `${Date.now() - startTime}ms`
      },
    });

  } catch (error: any) {
    // Log general error
    await logServerActivity({
      type: 'error',
      title: 'Chat Request Failed',
      description: error.message || 'Unknown error processing chat request',
      status: 'failed',
      metadata: { correlationId, error: error.message || 'Unknown error' }
    });

    logConsoleActivity('error', 'Chat request failed', { 
      correlationId, 
      error: error.message || 'Unknown error',
      processingTime: Date.now() - startTime
    });

    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    }), { status: 500 });
  }
}
