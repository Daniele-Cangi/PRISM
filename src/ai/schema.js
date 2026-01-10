/**
 * Validation schema for the AI Output.
 * Can be used with libraries like Zod in the future.
 */

export const ANALYSIS_SCHEMA = {
    type: "object",
    required: ["meta_analysis", "forensic_breakdown", "strategic_intent"],
    properties: {
        meta_analysis: {
            type: "object",
            required: ["deception_score", "tone_label", "verdict"],
            properties: {
                deception_score: { type: "integer", minimum: 0, maximum: 100 },
                tone_label: { type: "string" },
                verdict: { type: "string" }
            }
        },
        forensic_breakdown: {
            type: "object",
            required: ["hard_facts", "emotional_triggers", "hidden_axioms", "missing_context"],
            properties: {
                hard_facts: { type: "array", items: { type: "string" } },
                emotional_triggers: { type: "array", items: { type: "string" } },
                hidden_axioms: { type: "array", items: { type: "string" } },
                missing_context: { type: "array", items: { type: "string" } }
            }
        },
        strategic_intent: { type: "string" }
    }
};
