import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGeminiWithRetry<T>(
  operation: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    // Check if it's a rate limit error (429) or a "RESOURCE_EXHAUSTED" error
    const isRateLimit = 
      error?.message?.includes('429') || 
      error?.message?.includes('RESOURCE_EXHAUSTED') || 
      error?.status === 429;

    if (isRateLimit && retries > 0) {
      console.warn(`Gemini rate limit hit. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

function safeJsonParse<T>(text: string, defaultValue: T): T {
  if (!text) return defaultValue;
  
  // 1. Clean markdown blocks
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
  }

  // 2. Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // 3. Try to extract the first { ... } or [ ... ] block
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/) || cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      let candidate = jsonMatch[0];
      
      // 4. Handle trailing characters (like extra braces or words) by shrinking from the end
      let lastBrace = candidate.lastIndexOf('}');
      if (lastBrace === -1) lastBrace = candidate.lastIndexOf(']');
      
      while (lastBrace > 0) {
        try {
          return JSON.parse(candidate.substring(0, lastBrace + 1));
        } catch {
          // Find the previous closing brace of the same type
          const charToMatch = candidate[lastBrace];
          lastBrace = candidate.lastIndexOf(charToMatch, lastBrace - 1);
          if (lastBrace === -1) break;
        }
      }
    }
    
    console.error("Critical JSON Parse Error. Raw response:", text);
    return defaultValue;
  }
}

export async function conductGeoAnalysis(url: string, keywords: string, currentSchema: string = "") {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a professional GEO (Generative Engine Optimization) Audit for URL: ${url}.
      
      CONTEXT:
      Keywords: ${keywords || "Auto-detected"}
      Existing Schema: ${currentSchema || "None provided"}
      Date: April 25, 2026.
      
      Include a detailed 'Factor Breakdown' for these EXACT 9 factors:
         - Content Readability
         - Content Structure & Organization
         - Schema Markup & Structured Data
         - Domain Authority & Trust
         - Content Freshness & Relevance
         - Citation Friendliness
         - LLM.txt Analysis
         - AI Meta Tags
         - Conversational Keywords
      MANDATORY OUTPUT JSON STRUCTURE:
      1. executiveSummary: { 
           overview: string, 
           interpretation: string,
           predictedGain: string 
         }
      2. factors: { 
           name: string, 
           score: number, 
           status: 'Optimal' | 'Warning' | 'Critical',
           progress: number,
           description: string 
         }[] (Return 9 objects)
      3. benchmarking: { 
           visibilityScore: number, 
           industryAverage: number,
           delta: string,
           metrics: { label: string, value: string, comparison: string }[] 
         }
      4. competitivePositioning: {
           marketPosition: 'Leader' | 'Challenger' | 'Follower',
           aiReadiness: number,
           growthPotential: number,
           competitors: { name: string, visibility: number, keywordOverlap: number, weaknesses: string[] }[]
         }
      5. priorityMatrix: { 
           item: string, 
           score: number,
           impact: number, 
           effort: number, 
           impactLabel: 'Low' | 'Medium' | 'High', 
           effortLabel: 'Low' | 'Medium' | 'High',
           priorityLevel: 'P1' | 'P2' | 'P3',
           description: string 
         }[] (Calculated based on impact vs effort: High Impact + Low Effort = P1, Low Impact + High Effort = P3. Sort by priority ranking.)
      6. strategies: { geo: string, content: string, positioning: string }
      7. roadmap: { 
           immediate: { action: string, problem: string, fix: string, impactScore: number, effort: 'Low' | 'Medium' | 'High', estimatedTime: string }[], 
           shortTerm: { action: string, problem: string, fix: string, impactScore: number, effort: 'Low' | 'Medium' | 'High', estimatedTime: string }[], 
           longTerm: { action: string, problem: string, fix: string, impactScore: number, effort: 'Low' | 'Medium' | 'High', estimatedTime: string }[] 
         }
      8. detailedRecommendations: { topic: string, finding: string, fix: string }[]
      9. actionEngine: { 
           issue: string, 
           change: string, 
           content: string, 
           placement: string,
           category: 'Content' | 'Technical' | 'Strategic',
           priority: 'P1' | 'P2' | 'P3',
           impactScore: number,
           effort: 'Low' | 'Medium' | 'High',
           expectedOutcome: string
         }[]

      Include an 'Insight-to-Action Engine' output. For every critical finding, generate EXACT, copy-paste ready CONTENT (FAQ blocks, structured headings, optimized paragraphs, or schema snippets). 
      Content MUST be directly derived from the analysis, context-aware, ready-to-use, and sound human-written. No generic text.
      For each fix, provide a priority score (P1-P3), impact (0-100), effort level, and a specific expected outcome (e.g., 'Estimated 15% visibility boost').
      Divide roadmap into Immediate Actions (0–7 days), Short-term Goals (1–4 weeks), and Long-term Strategy (1–3 months).
      Analyze these factors specifically: Readability, Structure, Schema, Freshness, Authority, AI Meta Tags, LLM.txt, Conversational Keywords.
      Use Google Search grounding to find real 2026 industry benchmarks and current competitors for this niche. Compare with competitors dynamically.
      Return strictly JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["executiveSummary", "factors", "benchmarking", "competitivePositioning", "priorityMatrix", "strategies", "roadmap", "detailedRecommendations", "actionEngine"],
          properties: {
            executiveSummary: {
              type: Type.OBJECT,
              required: ["overview", "interpretation", "predictedGain"],
              properties: {
                overview: { type: Type.STRING },
                interpretation: { type: Type.STRING },
                predictedGain: { type: Type.STRING }
              }
            },
            factors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "score", "status", "progress", "description"],
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  status: { type: Type.STRING, enum: ["Optimal", "Warning", "Critical"] },
                  progress: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                }
              }
            },
            benchmarking: {
              type: Type.OBJECT,
              required: ["visibilityScore", "industryAverage", "delta", "metrics"],
              properties: {
                visibilityScore: { type: Type.NUMBER },
                industryAverage: { type: Type.NUMBER },
                delta: { type: Type.STRING },
                metrics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["label", "value", "comparison"],
                    properties: {
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      comparison: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            competitivePositioning: {
              type: Type.OBJECT,
              required: ["marketPosition", "aiReadiness", "growthPotential", "competitors"],
              properties: {
                marketPosition: { type: Type.STRING, enum: ["Leader", "Challenger", "Follower"] },
                aiReadiness: { type: Type.NUMBER },
                growthPotential: { type: Type.NUMBER },
                competitors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "visibility", "keywordOverlap", "weaknesses"],
                    properties: {
                      name: { type: Type.STRING },
                      visibility: { type: Type.NUMBER },
                      keywordOverlap: { type: Type.NUMBER },
                      weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                  }
                }
              }
            },
            priorityMatrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["item", "score", "impact", "effort", "impactLabel", "effortLabel", "priorityLevel", "description"],
                properties: {
                  item: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  impact: { type: Type.NUMBER },
                  effort: { type: Type.NUMBER },
                  impactLabel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  effortLabel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  priorityLevel: { type: Type.STRING, enum: ["P1", "P2", "P3"] },
                  description: { type: Type.STRING }
                }
              }
            },
            strategies: {
              type: Type.OBJECT,
              required: ["geo", "content", "positioning"],
              properties: {
                geo: { type: Type.STRING },
                content: { type: Type.STRING },
                positioning: { type: Type.STRING }
              }
            },
            roadmap: {
              type: Type.OBJECT,
              required: ["immediate", "shortTerm", "longTerm"],
              properties: {
                immediate: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["action", "problem", "fix", "impactScore", "effort", "estimatedTime"],
                    properties: {
                      action: { type: Type.STRING },
                      problem: { type: Type.STRING },
                      fix: { type: Type.STRING },
                      impactScore: { type: Type.NUMBER },
                      effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                      estimatedTime: { type: Type.STRING }
                    }
                  }
                },
                shortTerm: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["action", "problem", "fix", "impactScore", "effort", "estimatedTime"],
                    properties: {
                      action: { type: Type.STRING },
                      problem: { type: Type.STRING },
                      fix: { type: Type.STRING },
                      impactScore: { type: Type.NUMBER },
                      effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                      estimatedTime: { type: Type.STRING }
                    }
                  }
                },
                longTerm: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["action", "problem", "fix", "impactScore", "effort", "estimatedTime"],
                    properties: {
                      action: { type: Type.STRING },
                      problem: { type: Type.STRING },
                      fix: { type: Type.STRING },
                      impactScore: { type: Type.NUMBER },
                      effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                      estimatedTime: { type: Type.STRING }
                    }
                  }
                }
              }
            },
            detailedRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["topic", "finding", "fix"],
                properties: {
                  topic: { type: Type.STRING },
                  finding: { type: Type.STRING },
                  fix: { type: Type.STRING }
                }
              }
            },
            actionEngine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["issue", "change", "content", "placement", "category", "priority", "impactScore", "effort", "expectedOutcome"],
                properties: {
                  issue: { type: Type.STRING },
                  change: { type: Type.STRING },
                  content: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Content", "Technical", "Strategic"] },
                  priority: { type: Type.STRING, enum: ["P1", "P2", "P3"] },
                  impactScore: { type: Type.NUMBER },
                  effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  expectedOutcome: { type: Type.STRING }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("GEO Analysis Error:", error);
    return null;
  }
}

export async function synthesizeNarrative(topic: string, tone: string = "Authoritative") {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Synthesize a highly authoritative technical narrative for: "${topic}". 
      Tone: ${tone}. 
      Ensure the content is optimized for AI engine indexing (GEO). 
      Include section headers and key entity mentions.
      
      Return in Markdown format.`,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return response.text;
  } catch (error) {
    console.error("Narrative Synthesis Error:", error);
    return "Engine unavailable. Please check configuration.";
  }
}

export async function conductCompetitorAnalysis(params: {
  myBrand: string;
  competitors: { name: string, url: string }[];
  category: string;
  location?: string;
}) {
  try {
    const competitorContext = params.competitors.length > 0 && params.competitors[0].name.trim() !== ''
      ? `Competitors: ${params.competitors.map(c => `${c.name} (${c.url})`).join(', ')}`
      : `Competitors: Not provided. Auto-detect major rivals for ${params.myBrand} in the ${params.category} industry${params.location ? ` specifically in ${params.location}` : ''}.`;

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep "GEO Competitor Market Intelligence" audit.
      
      CORE FOCUS:
      - Primary Brand/Domain: ${params.myBrand}
      - Product Category: ${params.category}
      - Target Location: ${params.location || "Global Analysis"}
      - ${competitorContext}
      
      TASKS:
      1. Comparative Share of Voice (SOV): Analyze current citation frequency across major AI models (ChatGPT, Gemini, Perplexity) for the defined category and location.
      2. Third-Party Source Analysis: Identify specific high-authority sources (Reddit, HackerNews, Industry News, Review sites, Local directories if location provided) that are currently favoring competitors over the primary brand.
      3. Global/Local Gap Analysis: Highlight specific high-intent prompts where rivals dominate but the primary brand is missing or invisible.
      4. Strategic Insights: Identify the specific content clusters and technical SEO tactics rivals are using to gain "Generative Authority". Include location-specific insights if a location was provided.
      5. Market Positioning: Classify each brand as a Leader, Challenger, or Follower based on AI visibility scores.
      
      Use live search data for real-time grounding.
      
      Return a JSON object with:
      - overallSov: { name: string, percentage: number }[] (All brands including primary. If auto-detecting, include the detected rivals.)
      - visibilityByEngine: { engine: string, scores: { brand: string, score: number }[] }[]
      - favoredSources: { source: string, favoredBrand: string, context: string, url: string }[]
      - gapAnalysis: { prompt: string, dominatingBrand: string, missedOpportunity: string }[]
      - strategicInsights: { brand: string, tactic: string, impact: 'High' | 'Medium' | 'Low' }[]
      - marketPositioning: { brand: string, position: 'Leader' | 'Challenger' | 'Follower', reasoning: string }[]
      - locationInsights: string (Global context or specific to ${params.location} if provided)

      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["overallSov", "visibilityByEngine", "favoredSources", "gapAnalysis", "strategicInsights", "marketPositioning", "locationInsights"],
          properties: {
            overallSov: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "percentage"],
                properties: {
                  name: { type: Type.STRING },
                  percentage: { type: Type.NUMBER }
                }
              }
            },
            visibilityByEngine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["engine", "scores"],
                properties: {
                  engine: { type: Type.STRING },
                  scores: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["brand", "score"],
                      properties: {
                        brand: { type: Type.STRING },
                        score: { type: Type.NUMBER }
                      }
                    }
                  }
                }
              }
            },
            favoredSources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["source", "favoredBrand", "context", "url"],
                properties: {
                  source: { type: Type.STRING },
                  favoredBrand: { type: Type.STRING },
                  context: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              }
            },
            gapAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["prompt", "dominatingBrand", "missedOpportunity"],
                properties: {
                  prompt: { type: Type.STRING },
                  dominatingBrand: { type: Type.STRING },
                  missedOpportunity: { type: Type.STRING }
                }
              }
            },
            strategicInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["brand", "tactic", "impact"],
                properties: {
                  brand: { type: Type.STRING },
                  tactic: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            marketPositioning: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["brand", "position", "reasoning"],
                properties: {
                  brand: { type: Type.STRING },
                  position: { type: Type.STRING, enum: ["Leader", "Challenger", "Follower"] },
                  reasoning: { type: Type.STRING }
                }
              }
            },
            locationInsights: { type: Type.STRING }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    const rawResult = safeJsonParse(response.text, {} as any);
    
    // Transform scores array back to object for UI compatibility
    if (rawResult && Array.isArray(rawResult.visibilityByEngine)) {
      rawResult.visibilityByEngine = rawResult.visibilityByEngine.map((item: any) => {
        const scoresObj: Record<string, number> = {};
        if (Array.isArray(item.scores)) {
          item.scores.forEach((s: any) => {
            if (s && s.brand) {
              scoresObj[s.brand] = s.score;
            }
          });
        }
        return { ...item, scores: scoresObj };
      });
    }

    return rawResult;
  } catch (error) {
    console.error("Competitor Analysis Engine Error:", error);
    return null;
  }
}

export async function generateResponse(prompt: string, systemPrompt: string = "") {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: systemPrompt ? `${systemPrompt}\n\nUSER PROMPT: ${prompt}` : prompt,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));
    return response.text;
  } catch (error) {
    console.error("Inference Error:", error);
    return "Generation failed.";
  }
}

export async function mapKnowledgeGraph(params: {
  entities: string;
  specs: string;
  authorities: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a semantic knowledge graph mapping. 
      
      INPUTS:
      - Primary Entities: ${params.entities}
      - Technical Specs (Tabular/CSV): ${params.specs}
      - External Authority IDs (Wikidata/Wikipedia): ${params.authorities}
      
      TASKS:
      1. Map the semantic relationships between the primary brand and these core industry concepts.
      2. Provide unique entity @id identifiers for technical use (Schema.org compatible).
      3. Generate a structured JSON-LD database representing the graph nodes and relationships.
      
      Use live search data to resolve ambiguity and identify relevant industry entities.
      
      Return a JSON object with:
      - nodes: { id: string, label: string, type: 'brand' | 'product' | 'concept' | 'technology' | 'person', val: number, wikiId?: string, description?: string }[]
      - links: { source: string, target: string, strength: number, relation: string }[]
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["nodes", "links", "jsonLd"],
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "label", "type", "val"],
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["brand", "product", "concept", "technology", "person"] },
                  val: { type: Type.NUMBER },
                  wikiId: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["source", "target", "strength", "relation"],
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  strength: { type: Type.NUMBER },
                  relation: { type: Type.STRING }
                }
              }
            },
            jsonLd: { type: Type.OBJECT }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, { nodes: [], links: [], jsonLd: {} });
  } catch (error) {
    console.error("Knowledge Mapping Engine Error:", error);
    return { nodes: [], links: [], jsonLd: {} };
  }
}

export async function generateGrowthStrategy(domain: string) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep "AI Growth Intelligence & Strategy" analysis for the domain: "${domain}". 
      Use live search grounding to evaluate current visibility, performance, and competitor landscape across ChatGPT, Gemini, and other major AI models.
      
      TASKS:
      1. Analyze brand presence across AI models (Presence Score 0-100).
      2. Identify and compare at least 3 direct competitors using real market data.
      3. Detect "Neural Gaps": Specific topics or queries where competitors are cited but this brand is missing.
      4. Trend Analysis: Identify 3 trending products/topics in this niche vs 3 declining/non-performing ones.
      5. Growth Strategy:
         - Content Strategy: 3 specific content clusters to build.
         - GEO Optimization: Technical improvements for AI extraction.
         - Positioning Strategy: How to pivot for better engine discovery.
         - Actionable Steps: 5 immediate steps to outperform.
      6. Insight-to-Action Engine:
         - Generate exact, ready-to-use content for each strategic gap. 
         - Must include specific fix types: FAQ, Heading Structure, Content Rewrite, or Keyword Integration.
         - Data-driven, human-written, and copy-paste ready.
         - Categorize into 'Content', 'Technical', or 'Strategic'.
         - Assign Priority (P1-P3), Impact Score (0-100), Effort (Low-High), and Expected Outcome.
      
      Return a JSON object with:
      - overallScore: number
      - performanceMetrics: { model: string, presenceScore: number, ranking: number }[]
      - competitorBenchmark: { name: string, marketShare: number, strengths: string[], weaknesses: string[] }[]
      - gapAnalysis: { query: string, topCompetitor: string, potentialImpact: 'High' | 'Medium' | 'Low' }[]
      - trends: { trending: string[], declining: string[] }
      - strategy: { content: string[], geo: string[], positioning: string[], actionableSteps: string[] }
      - actionEngine: { issue: string, change: string, content: string, placement: string }[]
      
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["overallScore", "performanceMetrics", "competitorBenchmark", "gapAnalysis", "trends", "strategy", "actionEngine"],
          properties: {
            overallScore: { type: Type.NUMBER },
            performanceMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["model", "presenceScore", "ranking"],
                properties: {
                  model: { type: Type.STRING },
                  presenceScore: { type: Type.NUMBER },
                  ranking: { type: Type.NUMBER }
                }
              }
            },
            competitorBenchmark: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "marketShare", "strengths", "weaknesses"],
                properties: {
                  name: { type: Type.STRING },
                  marketShare: { type: Type.NUMBER },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            gapAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["query", "topCompetitor", "potentialImpact"],
                properties: {
                  query: { type: Type.STRING },
                  topCompetitor: { type: Type.STRING },
                  potentialImpact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            trends: {
              type: Type.OBJECT,
              required: ["trending", "declining"],
              properties: {
                trending: { type: Type.ARRAY, items: { type: Type.STRING } },
                declining: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            strategy: {
              type: Type.OBJECT,
              required: ["content", "geo", "positioning", "actionableSteps"],
              properties: {
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                geo: { type: Type.ARRAY, items: { type: Type.STRING } },
                positioning: { type: Type.ARRAY, items: { type: Type.STRING } },
                actionableSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            actionEngine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["issue", "change", "content", "placement", "category", "priority", "impactScore", "effort", "expectedOutcome"],
                properties: {
                  issue: { type: Type.STRING },
                  change: { type: Type.STRING },
                  content: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Content", "Technical", "Strategic"] },
                  priority: { type: Type.STRING, enum: ["P1", "P2", "P3"] },
                  impactScore: { type: Type.NUMBER },
                  effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  expectedOutcome: { type: Type.STRING }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Growth Intelligence Error:", error);
    return null;
  }
}

export async function generateCitableContent(params: {
  keywords: string;
  brandName?: string;
  brandVoice: string;
  persona: string;
  citationGaps: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate high-authority, citation-ready content designed for Generative Engine Optimization (GEO).
      
      INPUTS:
      - Seed Keywords: ${params.keywords}
      - Brand Name: ${params.brandName || "Generic Industry Expert"}
      - Brand Voice: ${params.brandVoice}
      - Target Persona: ${params.persona}
      - Citation Gaps (Competitors are cited for these, we are not): ${params.citationGaps}
      
      DATE CONTEXT: The current year is 2026.
      
      BRAND INTEGRATION PROTOCOL:
      1. Incorporate "${params.brandName || 'the brand'}" naturally as a subject-matter authority.
      2. Mention the brand in the introduction, key transition sections, and conclusion.
      3. Use the brand name in relevant headings where it adds value (e.g., "${params.brandName}'s Approach to...").
      4. Avoid "keyword stuffing" or unnatural repetition. 
      5. Align content with the brand's likely services and industry context based on the provided keywords.
      
      TASKS:
      1. AI-Optimized Content Brief: Outline the semantic core, entity relationships, and key facts.
      2. Comparison Table: Create a data-driven comparison matrix (e.g., vs competitors or industry standards) that is highly "extractable". Include ${params.brandName || 'Our Brand'} as a primary column.
      3. Formatted FAQs: Generate Schema-ready FAQs with factual, authoritative answers. Integrate brand context naturally in 1-2 answers.
      4. Structured Draft: Write a draft section that emphasizes factual accuracy and include citeable definitions for key terms. The content should sound Provocative, Human-written, and Original (Low plagiarism).
      
      Use live search data to ensure factual accuracy and identifying real 2026 citation opportunities.
      
      Return a JSON object with:
      - brief: string (Markdown)
      - comparisonTable: { headers: string[], rows: string[][] }
      - faqs: { question: string, answer: string }[]
      - draft: string (Markdown)
      
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["brief", "comparisonTable", "faqs", "draft"],
          properties: {
            brief: { type: Type.STRING },
            comparisonTable: {
              type: Type.OBJECT,
              required: ["headers", "rows"],
              properties: {
                headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
              }
            },
            faqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["question", "answer"],
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            },
            draft: { type: Type.STRING }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Citable Content Engine Error:", error);
    return null;
  }
}

export async function refinePromptWithBenchmarking(params: {
  starterPrompt: string;
  targetModel: string;
  variables: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert Prompt Engineer. Refine the following user prompt for maximum effectiveness on "${params.targetModel}".
      
      USER INPUTS:
      - Starter Prompt: ${params.starterPrompt}
      - Custom Variables/Context: ${params.variables}
      
      TASKS:
      1. Refine the prompt into a "Professional" version using prompt engineering techniques (Chain of thought, role-play, constraints).
      2. Score the starter prompt vs the refined prompt (0-100) based on Clarity, Specificity, and Persona Alignment.
      3. Generate actual responses for BOTH prompts from a simulated "${params.targetModel}" environment to show the difference.
      4. Provide a technical analysis of why the refined prompt is superior.
      
      Return a JSON object with:
      - refinedPrompt: string
      - qualityScores: { objective: string, starterScore: number, refinedScore: number }[]
      - comparisonResponses: { version: 'Starter' | 'Refined', response: string, qualityAudit: string }[]
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["refinedPrompt", "qualityScores", "comparisonResponses", "optimizationTips"],
          properties: {
            refinedPrompt: { type: Type.STRING },
            qualityScores: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["objective", "starterScore", "refinedScore"],
                properties: {
                  objective: { type: Type.STRING },
                  starterScore: { type: Type.NUMBER },
                  refinedScore: { type: Type.NUMBER }
                }
              }
            },
            comparisonResponses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["version", "response", "qualityAudit"],
                properties: {
                  version: { type: Type.STRING, enum: ["Starter", "Refined"] },
                  response: { type: Type.STRING },
                  qualityAudit: { type: Type.STRING }
                }
              }
            },
            optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Prompt Refinement Engine Error:", error);
    return null;
  }
}

export async function conductIntelligenceAudit(params: {
  url: string;
  gscData: string;
  claims: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep "AI Intelligence Audit" for the domain: "${params.url}".
      
      INPUTS:
      - Google Search Console Insights: ${params.gscData}
      - Core Factual Claims to Verify: ${params.claims}
      
      TASKS:
      1. Knowledge Accuracy & Hallucination Detection: Check the primary brand claims against live web data. Identify where AI models are likely to hallucinate or misrepresent facts about the brand. Provide individual accuracy scores.
      2. Semantic Consistency Report: Measure the "drift" between the brand's actual value proposition (extracted from the site/claims) and how it is represented in the latent space of major AI models.
      3. Bot Accessibility Analysis: Analyze the site's accessibility for major AI crawlers (GPTBot, OAI-SearchBot, CCBot, Google-Extended). Use live search data to see if the site is properly indexed or blocked.
      4. Insight-to-Action Engine:
         - Identify 5 specific implementation fixes based on findings.
         - For each, provide the detected issue, the required fix type (e.g., Content Rewrite), the exact content to use, and where to place it.
         - Categorize into 'Content', 'Technical', or 'Strategic'.
         - Assign Priority (P1-P3), Impact Score (0-100), Effort (Low-High), and Expected Outcome.
         - Content must be semantic-ready, factual, and human-written.
      
      Return a JSON object with:
      - knowledgeAccuracy: { claim: string, accuracyScore: number, status: 'Verified' | 'Hallucinated' | 'Ambiguous', discoverySource: string }[]
      - semanticConsistency: { dimension: string, alignmentScore: number, brandTruth: string, aiPerception: string }[]
      - crawlerLogs: { crawler: string, status: 'Active' | 'Blocked' | 'Restricted', frequency: string, recommendations: string }[]
      - overallReliabilityScore: number
      - actionEngine: { issue: string, change: string, content: string, placement: string }[]
      
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["knowledgeAccuracy", "semanticConsistency", "crawlerLogs", "overallReliabilityScore", "actionEngine"],
          properties: {
            knowledgeAccuracy: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["claim", "accuracyScore", "status", "discoverySource"],
                properties: {
                  claim: { type: Type.STRING },
                  accuracyScore: { type: Type.NUMBER },
                  status: { type: Type.STRING, enum: ['Verified', 'Hallucinated', 'Ambiguous'] },
                  discoverySource: { type: Type.STRING }
                }
              }
            },
            semanticConsistency: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dimension", "alignmentScore", "brandTruth", "aiPerception"],
                properties: {
                  dimension: { type: Type.STRING },
                  alignmentScore: { type: Type.NUMBER },
                  brandTruth: { type: Type.STRING },
                  aiPerception: { type: Type.STRING }
                }
              }
            },
            crawlerLogs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["crawler", "status", "frequency", "recommendations"],
                properties: {
                  crawler: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['Active', 'Blocked', 'Restricted'] },
                  frequency: { type: Type.STRING },
                  recommendations: { type: Type.STRING }
                }
              }
            },
            overallReliabilityScore: { type: Type.NUMBER },
            actionEngine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["issue", "change", "content", "placement", "category", "priority", "impactScore", "effort", "expectedOutcome"],
                properties: {
                  issue: { type: Type.STRING },
                  change: { type: Type.STRING },
                  content: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Content", "Technical", "Strategic"] },
                  priority: { type: Type.STRING, enum: ["P1", "P2", "P3"] },
                  impactScore: { type: Type.NUMBER },
                  effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  expectedOutcome: { type: Type.STRING }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Intelligence Audit Engine Error:", error);
    return null;
  }
}

export async function processAutomationTrigger(params: {
  trigger: string;
  domain: string;
  context: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Execute an "Autonomous Semantic Marketing Protocol" for the domain: "${params.domain}".
      
      TRIGGER CONDITION: "${params.trigger}"
      ADDITIONAL CONTEXT/FEEDS: "${params.context}"
      
      TASKS:
      1. Evaluate Global Signals: Use live search data to monitor competitive shifts, visibility drops, or trending semantic clusters related to the domain's category.
      2. Generate Automated Alerts: Create specific, technical alerts for any deviations detected based on the trigger.
      3. Recommend Executable Actions: 
         - Scheduled FAQ Updates: Generate 3-5 new FAQ questions and authoritative answers for trending prompts.
         - Content Recalibration: Suggest specific technical or structural tweaks to maintain/regain authority.
      4. Automated Reporting Data: Generate high-level metrics for a stakeholder dashboard.
      
      Return a JSON object with:
      - alerts: { level: 'Critical' | 'Warning' | 'Info', message: string, triggerMatch: boolean }[]
      - actions: { type: 'FAQ' | 'Content' | 'Technical', description: string, payload?: any, priority: 'High' | 'Medium' | 'Low' }[]
      - reportingMetrics: { label: string, value: string, trend: 'up' | 'down' | 'stable' }[]
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["alerts", "actions", "reportingMetrics", "logs"],
          properties: {
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["level", "message", "triggerMatch"],
                properties: {
                  level: { type: Type.STRING, enum: ["Critical", "Warning", "Info"] },
                  message: { type: Type.STRING },
                  triggerMatch: { type: Type.BOOLEAN }
                }
              }
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "description", "priority"],
                properties: {
                  type: { type: Type.STRING, enum: ["FAQ", "Content", "Technical"] },
                  description: { type: Type.STRING },
                  payload: { type: Type.OBJECT },
                  priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
                }
              }
            },
            reportingMetrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["label", "value", "trend"],
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ["up", "down", "stable"] }
                }
              }
            },
            logs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["timestamp", "event", "status"],
                properties: {
                  timestamp: { type: Type.STRING },
                  event: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["SUCCESS", "INFO", "ALERT"] }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Automation Engine Error:", error);
    return null;
  }
}

export async function performKeywordResearch(topic: string, primaryKeyword: string) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform real-time keyword research for the topic: "${topic}" with primary keyword: "${primaryKeyword}".
      
      DATE CONTEXT: Today is April 24, 2026.
      
      TASKS:
      1. Identify 8-10 highly relevant semantic and long-tail keywords specifically trending in 2026.
      2. If primary keyword(s) are provided in "${primaryKeyword}", you MUST include them as individual entries in the results.
      3. Estimate data-driven search volume (monthly) and trend percentage (+/- %) based on CURRENT 2026 web signals.
      4. Classify keyword intent (Informational, Transactional, Navigational).
      5. Provide a "relevanceScore" (0-100) for how well it fits the topic.
      6. For any keyword originally provided by the user, set "isUserInput" to true.
      
      Use Google Search grounding for real-time accuracy and to identify current 2026 buzzwords.
      
      Return a JSON object with a "keywords" array.
      
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["keywords"],
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["keyword", "volume", "trend", "intent", "relevanceScore", "isUserInput"],
                properties: {
                  keyword: { type: Type.STRING },
                  volume: { type: Type.STRING },
                  trend: { type: Type.STRING },
                  intent: { type: Type.STRING },
                  relevanceScore: { type: Type.NUMBER },
                  isUserInput: { type: Type.BOOLEAN }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, { keywords: [] });
  } catch (error) {
    console.error("Keyword Research Error:", error);
    return { keywords: [] };
  }
}

export async function generateHumanoidBlog(params: {
  topic: string;
  selectedKeywords: string[];
  tone: string;
  brandName?: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a high-authority, humanoid, and original blog post using the HUMAN-FIRST NARRATIVE FRAMEWORK.
      
      DATE CONTEXT: April 2026. Use current year insights.
      TOPIC (IMMUTABLE): ${params.topic}
      BRAND NAME: ${params.brandName || "Not specified"}
      INTEGRATE THESE KEYWORDS NATURALLY: ${params.selectedKeywords.join(', ')}
      TONE: ${params.tone}
      
      STRICT LENGTH REQUIREMENT:
      - The blog MUST be between 800 and 1200 words. 
      - Maintain depth without unnecessary filler.
      
      MANDATORY STRUCTURE:
      1. THE H1: Must be EXACTLY: # ${params.topic}
      2. THE HOOK (First Paragraph): Start with a real scenario, a specific number, or a particular moment in time. Avoid definitions or generic "In today's world" statements. Create Curiosity or Tension immediately.
      3. THE SETUP: Explain context in simple, conversational language. Keep it to exactly one short paragraph. No jargon.
      4. THE BODY (2-4 Sections):
         - Use conversational H2 headings (e.g., "Why most digital strategies quietly fail" instead of "Benefits of Digital Transformation").
         - Each section must focus on ONE clear idea.
         - Every section MUST include a real or realistic example/scenario.
      5. THE OUTRO: Do NOT summarize. End with a specific thought, a personal challenge, or a deep insight that leaves the reader thinking.
      
      WRITING STYLE & HUMAN SIGNALS:
      - PERSPECTIVE: Write like a human with experience. Use first-person naturally ("I've seen", "Honestly"). Use mild opinions ("I think", "Personally").
      - ENGAGEMENT: Include at least one rhetorical question.
      - RHYTHM: Vary sentence length dramatically (short + long mix). Use short 1-2 line paragraphs for emphasis.
      - LANGUAGE: Use contractions (it's, don't, you'll). Use plain, natural language.
      - AVOID AI PROMPTS/CLICHES: Never use "In today's fast-paced world", "Dive deep", "Delve into", "Leverage", "Comprehensive guide", or "In conclusion".
      - FORMATTING: Avoid bullet-heavy structures. Use narrative prose. Do NOT use repeated symbols like "-".
      - HUMAN SIGNALS: Ensure the blog includes:
         * A specific number, date, or real scenario in the intro.
         * Acknowledged uncertainty ("This may not apply if...").
         * Conversational headings.
         * A strong, non-generic ending.
      
      CONTENT ALIGNMENT:
      - Natural usage of keywords. Bold them ONLY when needed for emphasis.
      - Brand integration: Include "${params.brandName || 'the product'}" naturally in the Intro, 1-2 body sections, and the Outro. Avoid a promotional tone.
      
      Respond ONLY with the complete blog post in Markdown.`,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return response.text;
  } catch (error) {
    console.error("Blog Generation Error:", error);
    return "Failed to generate blog content.";
  }
}

export async function humanizeBlog(content: string, topic: string, brandName?: string) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert editor specializing in humanizing content using the HUMAN-FIRST NARRATIVE FRAMEWORK.
      Rewrite the following blog post to remove robotic patterns and infuse it with genuine human experience.
      
      TARGET LENGTH: 800-1200 words. Expand with concrete 2026 scenarios if needed.
      
      HUMANIZATION CHECKLIST:
      - THE H1: Ensure it remains EXACTLY "# ${topic}".
      - THE HOOK: Fix the opening to start with a specific moment or number. Remove generic definitions.
      - THE BODY: Convert H2s to conversational headings. Ensure every section has a real-world example.
      - STYLE: Add first-person perspective, mild opinions, and at least one rhetorical question. Use contractions.
      - AVOID CLICHES: Strip out "Dive deep", "In conclusion", and other AI markers.
      - SIGNALS: Ensure short paragraphs and acknowledged uncertainty are present.
      - BRAND: Refine integration of "${brandName || 'the company'}" to feel like a natural recommendation.
      
      PROCESSED CONTENT:
      ${content}`,
    }));
    return response.text;
  } catch (error) {
    console.error("Humanize Error:", error);
    return content;
  }
}

export async function editBlogWithChat(params: {
  content: string;
  topic: string;
  instruction: string;
  brandName?: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an AI blog editor. Update the blog content based on the user's specific request while maintaining elite human-writing quality.
      
      TOPIC (IMMUTABLE): ${params.topic}
      CURRENT CONTENT:
      ${params.content}
      
      USER INSTRUCTION:
      ${params.instruction}
      
      BRAND CONTEXT: ${params.brandName || "None"}
      
      HUMANOID QUALITY RULES:
      - THE H1: Must remain EXACTLY "# ${params.topic}".
      - NARRATIVE FLOW: Preserve the "Hook -> Setup -> Body -> Outro" storytelling logic.
      - HUMAN TONE: Maintain first-person perspective, mild opinions, and conversational rhythm.
      - AVOID CLICHES: Do not introduce AI markers like "Dive deep" or "In conclusion".
      - FORMATTING: Avoid robotic bullet-heavy structures. Use narrative prose.
      - LENGTH: Maintain or move closer to the 800-1200 word target.
      
      TASK:
      - Modify the content as requested while strictly adhering to the Human-First Narrative Framework.
      - Ensure the output is the COMPLETE updated blog post in Markdown.`,
    }));
    return response.text;
  } catch (error) {
    console.error("Chat Edit Error:", error);
    return params.content;
  }
}

export async function performDetailedAnalysis(domain: string) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a comprehensive "Detailed Analysis" for the domain: "${domain}". 
      This is a deep-dive research and strategy audit for Generative Engine Optimization (GEO).

      AUDIT SCOPE:
      1. AI visibility across models (mentions, citations, position).
      2. Keywords (top, trending, declining, gaps).
      3. Competitors (auto-detect, compare visibility/keywords).
      4. Products/services trends.
      5. Region-wise visibility.
      6. Content quality (structure, entities, semantic depth).
      7. Sentiment and false narratives.
      8. Hallucination assessment (accuracy of brand information).

      STRATEGY SCOPE:
      - Growth strategy.
      - GEO optimization plan.
      - Content and competitor strategy.
      - Step-by-step action plan.
      - Insight-to-Action Engine output: Exact, copy-paste content (FAQs, headings, rewrites) for every gap found.

      Use Google Search grounding for real-time accurate data. Do not use placeholders. 
      Return a strictly formatted JSON response.`,
      config: {
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "performanceScore", "visibilityScore", "sentimentScore", "accuracyRating",
            "aiVisibility", "keywords", "competitors", "productTrends", 
            "regionalVisibility", "contentQuality", "falseNarratives",
            "growthStrategy", "geoOptimizationPlan", "contentCompetitorStrategy", "actionPlan", "actionEngine"
          ],
          properties: {
            performanceScore: { type: Type.NUMBER },
            visibilityScore: { type: Type.NUMBER },
            sentimentScore: { type: Type.NUMBER },
            accuracyRating: { type: Type.NUMBER },
            aiVisibility: {
              type: Type.OBJECT,
              properties: {
                mentions: { type: Type.NUMBER },
                citations: { type: Type.NUMBER },
                position: { type: Type.STRING },
                insights: { type: Type.STRING }
              }
            },
            keywords: {
              type: Type.OBJECT,
              properties: {
                top: { type: Type.ARRAY, items: { type: Type.STRING } },
                trending: { type: Type.ARRAY, items: { type: Type.STRING } },
                declining: { type: Type.ARRAY, items: { type: Type.STRING } },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  visibility: { type: Type.NUMBER },
                  overlap: { type: Type.STRING },
                  sharedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            productTrends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ["up", "down", "stable"] },
                  sentiment: { type: Type.STRING }
                }
              }
            },
            regionalVisibility: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  region: { type: Type.STRING },
                  visibility: { type: Type.NUMBER }
                }
              }
            },
            contentQuality: {
              type: Type.OBJECT,
              properties: {
                structure: { type: Type.STRING },
                entities: { type: Type.STRING },
                semanticDepth: { type: Type.STRING },
                auditNote: { type: Type.STRING }
              }
            },
            falseNarratives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  claim: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  correction: { type: Type.STRING }
                }
              }
            },
            growthStrategy: { type: Type.STRING },
            geoOptimizationPlan: { type: Type.STRING },
            contentCompetitorStrategy: { type: Type.STRING },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            actionEngine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["issue", "change", "content", "placement", "category", "priority", "impactScore", "effort", "expectedOutcome"],
                properties: {
                  issue: { type: Type.STRING },
                  change: { type: Type.STRING },
                  content: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Content", "Technical", "Strategic"] },
                  priority: { type: Type.STRING, enum: ["P1", "P2", "P3"] },
                  impactScore: { type: Type.NUMBER },
                  effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  expectedOutcome: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }));

    return safeJsonParse(response.text, {});
  } catch (error) {
    console.error("Detailed Analysis Error:", error);
    return null;
  }
}

export async function getDashboardAnalysis(domain: string, filters?: { timeframe: string, engine: string, region: string }) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a comprehensive production-level GEO (Generative Engine Optimization) Dashboard report for the domain: "${domain}". 
      Use Google Search grounding to gather real 2026 market data.
      
      CONTEXT FILTERS:
      - Timeframe: ${filters?.timeframe || '30 days'}
      - Target Engine: ${filters?.engine || 'All major LLMs'}
      - Region: ${filters?.region || 'Global'}
      
      INSIGHT-TO-ACTION ENGINE:
      - You MUST include a top-level property called "actionEngine".
      - For every major KPI dip or competitor threat found, generate specific implementation fixes.
      - Each fix must include: issue, change type (FAQ, content rewrite, etc.), exact content (ready to use), and placement suggestion.
      - Each fix MUST also include: category (Content/Technical/Strategic), priority (P1/P2/P3), impactScore (0-100), effort (Low/Medium/High), and expectedOutcome.
      
      Respond STRICTLY with a JSON object following the specified schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["kpis", "trends", "competitorComparison", "topQueries", "keywordInsights", "engineBreakdown", "summary", "actionEngine"],
          properties: {
            kpis: {
              type: Type.OBJECT,
              required: ["visibilityScore", "geoScore", "shareOfVoice", "aiTrafficGrowth"],
              properties: {
                visibilityScore: { type: Type.OBJECT, required: ["value", "trend"], properties: { value: { type: Type.NUMBER }, trend: { type: Type.NUMBER } } },
                geoScore: { type: Type.OBJECT, required: ["value", "trend"], properties: { value: { type: Type.NUMBER }, trend: { type: Type.NUMBER } } },
                shareOfVoice: { type: Type.OBJECT, required: ["value", "trend"], properties: { value: { type: Type.NUMBER }, trend: { type: Type.NUMBER } } },
                aiTrafficGrowth: { type: Type.OBJECT, required: ["value", "trend"], properties: { value: { type: Type.NUMBER }, trend: { type: Type.NUMBER } } }
              }
            },
            trends: {
              type: Type.OBJECT,
              required: ["visibility", "traffic"],
              properties: {
                visibility: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, score: { type: Type.NUMBER } } } },
                traffic: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { month: { type: Type.STRING }, value: { type: Type.NUMBER } } } }
              }
            },
            competitorComparison: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, sov: { type: Type.NUMBER }, aiVisibility: { type: Type.NUMBER } } }
            },
            topQueries: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { query: { type: Type.STRING }, impressions: { type: Type.NUMBER }, ctr: { type: Type.NUMBER }, position: { type: Type.NUMBER } } }
            },
            keywordInsights: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, volume: { type: Type.STRING }, difficulty: { type: Type.NUMBER }, intent: { type: Type.STRING }, opportunity: { type: Type.STRING } } }
            },
            engineBreakdown: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT, properties: { engine: { type: Type.STRING }, health: { type: Type.NUMBER }, latency: { type: Type.STRING }, status: { type: Type.STRING } } }
            },
            summary: { type: Type.STRING },
            actionEngine: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["issue", "change", "content", "placement", "category", "priority", "impactScore", "effort", "expectedOutcome"],
                properties: {
                  issue: { type: Type.STRING },
                  change: { type: Type.STRING },
                  content: { type: Type.STRING },
                  placement: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ["Content", "Technical", "Strategic"] },
                  priority: { type: Type.STRING, enum: ["P1", "P2", "P3"] },
                  impactScore: { type: Type.NUMBER },
                  effort: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                  expectedOutcome: { type: Type.STRING }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Dashboard Analysis Error:", error);
    return null;
  }
}

export async function generateBlogIdeas(params: {
  url: string;
  brandName?: string;
  topic?: string;
  keywords?: string;
}) {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the website: "${params.url}" for content intelligence and strategic blog ideation.
      
      CONTEXT:
      - Brand Name: ${params.brandName || "Auto-detect"}
      - Optional Topic: ${params.topic || "Auto-detect"}
      - Optional Keywords: ${params.keywords || "Auto-detect"}
      - Current Year: 2026
      
      TASKS:
      1. Domain Analysis: Analyze the content, services, and current positioning of the website.
      2. Gap Analysis: Identify content gaps and competitor opportunities.
      3. Topic Suggestion Protocol:
         - If user provided a 'Target Topic' in "${params.topic}", you MUST include that EXACT string as the first item in the 'ideas' list.
         - DO NOT modify, optimize, rewrite or enhance the user's Target Topic. Use it literally.
         - Generate 5-8 additional high-impact blog ideas that reflect 2026 trends and are SEO/GEO optimized.
         - Set "isUserInput" to true ONLY for the idea that matches the user's exact Target Topic.
      
      For each blog idea, provide:
      - title: If isUserInput is true, this MUST be the EXACT Target Topic string provided by the user. Otherwise, a compelling, humanoid title.
      - description: A short description of the blog's angle and value. For user topics, describe how it fits 2026 trends.
      - impactScore: A percentage (0-100) representing traffic and visibility potential.
      - rational: Why this idea is high impact.
      - isUserInput: Boolean, true ONLY for the user's provided topic.
      
      Return a JSON object with:
      - analysis: { coreTopics: string[], contentGaps: string[], opportunities: string[] }
      - ideas: { title: string, description: string, impactScore: number, rational: string, isUserInput: boolean }[]
      
      Respond ONLY with the JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["analysis", "ideas"],
          properties: {
            analysis: {
              type: Type.OBJECT,
              required: ["coreTopics", "contentGaps", "opportunities"],
              properties: {
                coreTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                contentGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                opportunities: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description", "impactScore", "rational", "isUserInput"],
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impactScore: { type: Type.NUMBER },
                  rational: { type: Type.STRING },
                  isUserInput: { type: Type.BOOLEAN }
                }
              }
            }
          }
        },
        tools: [{ googleSearch: {} }],
        toolConfig: { includeServerSideToolInvocations: true }
      }
    }));

    return safeJsonParse(response.text, null);
  } catch (error) {
    console.error("Blog Ideation Error:", error);
    return null;
  }
}
