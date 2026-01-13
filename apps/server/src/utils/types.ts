import z from "zod";

export const signupSchema = z.object({
	"name": z.string(), 
	"email": z.string().email(), 
	"password": z.string().min(3), 
	"role": z.enum(["creator", "contestee"]).optional()
})

export const loginSchema = z.object({
	"email": z.string().email(), 
	"password": z.string().min(3)
})

export const createContestSchema = z.object({
	"title": z.string(),
	"description": z.string(),
	"start_time": z.string().datetime(),
	"end_time": z.string().datetime()
})

export const createContestMcqSchema = z.object({
	"question_text": z.string(),
	"options": z.array(z.string()).min(1),
	"correct_option_index": z.number().int().min(0),
	"points": z.number()
}).refine((data) => data.correct_option_index < data.options.length, {
	message: "correct_option_index must be less than options length",
	path: ["correct_option_index"]
})

export const createContestDsaSchema = z.object({
	"title": z.string(),
	"description": z.string(),
	"tags": z.array(z.string()),
	"points": z.number(),
	"time_limit": z.number(),
	"memory_limit": z.number(),
	"test_cases": z.array(z.object({
		"input": z.string(),
		"expected_output": z.string(),
		"is_hidden": z.boolean()
	})).min(1)
})

export const submitContestMcqSchema = z.object({
	"selectedOptionIndex": z.number().int().min(0)
})