import { z } from 'zod';

export type FactSource = 'USER' | 'MODEL_EXTRACTION' | 'UNKNOWN';

export const FactItemSchema = z.object({
  value: z.union([z.string(), z.number()]).nullable(),
  label: z.string(),
  source: z.enum(['USER', 'MODEL_EXTRACTION', 'UNKNOWN']),
  raw_token: z.string().optional(),
});
export type FactItem = z.infer<typeof FactItemSchema>;

export const VerifiedFactsSchema = z.object({
  city: FactItemSchema,
  property_type: FactItemSchema,
  area_sqm: FactItemSchema,
  target_timeline_months: FactItemSchema,
  special_requests: z.array(z.string()).default([]),
});
export type VerifiedFacts = z.infer<typeof VerifiedFactsSchema>;

export const UnknownFieldItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: z.enum(['UNKNOWN', 'ASSUMED', 'VERIFIED']),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM']),
  explanation: z.string(),
  blocking_reason: z.string().optional(),
});
export type UnknownFieldItem = z.infer<typeof UnknownFieldItemSchema>;

export const SmartQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.enum(['STATE', 'ACCESS', 'ENGINEERING', 'BUDGET']),
  why_needed: z.string(),
  recommended_options: z.array(z.string()),
});
export type SmartQuestion = z.infer<typeof SmartQuestionSchema>;

export const RiskItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'INFO']),
  policy_rationale: z.string(),
});
export type RiskItem = z.infer<typeof RiskItemSchema>;

export const PipelineStageSchema = z.object({
  id: z.enum(['clarification', 'measurement', 'workbrief', 'rfq', 'comparison', 'human_confirmation']),
  label: z.string(),
  status: z.enum(['completed', 'active', 'pending', 'locked']),
  stepNumber: z.number(),
  description: z.string(),
});
export type PipelineStage = z.infer<typeof PipelineStageSchema>;

export const WorkBriefDraftSchema = z.object({
  idempotency_key: z.string(),
  brief_id: z.string(),
  revision: z.number().default(1),
  created_at: z.string(),
  title: z.string(),
  status: z.enum(['DRAFT_PENDING_APPROVAL', 'APPROVED_BY_HUMAN']),
  facts: VerifiedFactsSchema,
  assumptions: z.array(z.string()),
  open_unknowns: z.array(z.string()),
  pre_measurement_guardrails: z.array(z.string()),
  recommended_next_step: z.string(),
  human_approval_required: z.literal(true),
  cached: z.boolean().optional(),
});
export type WorkBriefDraft = z.infer<typeof WorkBriefDraftSchema>;

export const ToolExecutionTraceSchema = z.object({
  step: z.number(),
  tool_name: z.string(),
  description: z.string(),
  timestamp: z.string(),
  status: z.enum(['SUCCESS', 'GUARD_INTERCEPTED', 'FALLBACK']),
  input_summary: z.record(z.any()),
  output_summary: z.record(z.any()),
  policy_decision: z.string(),
});
export type ToolExecutionTrace = z.infer<typeof ToolExecutionTraceSchema>;

export interface PolicyNotice {
  blocked: boolean;
  rule: string;
  message: string;
  user_warning: string;
}

export const SuggestionFieldSchema = z.enum([
  'city',
  'property_type',
  'area_sqm',
  'target_timeline_months',
  'special_request',
]);
export type SuggestionField = z.infer<typeof SuggestionFieldSchema>;

export const ModelSuggestionSchema = z.object({
  suggestion_id: z.string(),
  field: SuggestionFieldSchema,
  label: z.string().max(100),
  proposed_value: z.union([z.string().max(500), z.number()]),
  reason: z.string().max(500),
});
export type ModelSuggestion = z.infer<typeof ModelSuggestionSchema>;

export const ConfirmSuggestionRequestSchema = z.object({
  idempotency_key: z.string(),
  suggestion_id: z.string().min(3, 'Некорректный ID предложения'),
  confirmed_by_human: z.literal(true, {
    errorMap: () => ({ message: 'Требуется явное подтверждение человека' }),
  }),
});
export type ConfirmSuggestionRequest = z.infer<typeof ConfirmSuggestionRequestSchema>;

// Схема структурированного JSON для Hybrid AI (LLM-адаптер) с evidence spans
export const HybridExtractionSchema = z.object({
  city: z.string().nullable().optional(),
  city_evidence: z.string().nullable().optional(),
  property_type: z.string().nullable().optional(),
  property_type_evidence: z.string().nullable().optional(),
  area_sqm: z.number().nullable().optional(),
  area_sqm_evidence: z.string().nullable().optional(),
  target_timeline_months: z.number().nullable().optional(),
  target_timeline_months_evidence: z.string().nullable().optional(),
  special_requests: z.array(z.union([
    z.string(),
    z.object({
      request: z.string(),
      evidence_text: z.string().nullable().optional(),
    }),
  ])).default([]),
  unknown_fields: z.array(z.object({
    id: z.string(),
    label: z.string(),
    explanation: z.string(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM']).default('HIGH'),
  })).default([]),
  questions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    category: z.enum(['STATE', 'ACCESS', 'ENGINEERING', 'BUDGET']).default('STATE'),
    why_needed: z.string(),
    recommended_options: z.array(z.string()),
  })).max(3).default([]),
  // Поля перехвата галлюцинаций цены и действий
  estimated_price: z.any().optional(),
  final_price: z.any().optional(),
  cost_estimate: z.any().optional(),
  financial_advice: z.any().optional(),
  external_action: z.any().optional(),
});
export type HybridExtraction = z.infer<typeof HybridExtractionSchema>;

import type {
  CalculatedQuantities,
  EngineeringSolution,
  WorkBreakdownStage,
  AgentLoopStep,
  SkepticVerdict,
  MarketScrapedItem,
  ProjectBlueprint,
  SpecializedAgentStage,
  ProjectConsensusPassport,
} from '@/core/tools/engineering-engine';

export interface AgentRunResponse {
  query: string;
  engine_mode: 'deterministic' | 'hybrid' | 'deterministic_fallback';
  engine_badge: string;
  policy_notice?: PolicyNotice | null;
  facts: VerifiedFacts;
  model_suggestions: ModelSuggestion[];
  unknowns: UnknownFieldItem[];
  questions: SmartQuestion[];
  risks: RiskItem[];
  pipeline: PipelineStage[];
  readiness: {
    brief_readiness_pct: number;
    rfq_readiness_pct: number;
    can_create_draft: boolean;
    can_proceed_to_rfq: boolean;
    rfq_block_reason: string;
  };
  safety_notice: {
    title: string;
    summary: string;
    points: string[];
  };
  tool_traces: ToolExecutionTrace[];
  workbrief_draft: WorkBriefDraft | null;
  quantities?: CalculatedQuantities;
  solutions?: EngineeringSolution[];
  work_breakdown?: WorkBreakdownStage[];
  agent_loop_steps?: AgentLoopStep[];
  skeptic_verdicts?: SkepticVerdict[];
  market_materials?: MarketScrapedItem[];
  project_blueprints?: ProjectBlueprint[];
  specialized_agent_stages?: SpecializedAgentStage[];
  project_passport?: ProjectConsensusPassport;
}
