import z from "zod";

export const signupSchema = z.object({
	"name": z.string(), 
	"email": z.string().email(), 
	"password": z.string().min(3).max(8), 
	"role": z.enum(["creator", "contestee"])
})

export const loginSchema = z.object({
	"email": z.string().email(), 
	"password": z.string().min(3).max(8)
})

export const createContestSchema = z.object({
	"title": z.string(),
	"description": z.string(),
	"start_time": z.string(),
	"end_time": z.string()
})

export const createContestMcqSchema = z.object({
	"question_text": z.string(),
	"options": z.array(z.string()),
	"correct_option_index": z.number(),
	"points": z.number()
})

export const createContestDsaSchema = z.object({
	"title": z.string(),
	"description": z.string(),
	"tags": z.array(z.string()),
	"points": z.number(),
	"time_limit": z.number(),
	"memory_limit": z.number(),
	"test_cases": z.array(z.object({
		"input": z.array(z.string()),
		"expected_output": z.array(z.string()),
		"is_hidden": z.boolean()
	}))
})

export const submitContestMcqSchema = z.object({
	"selectedOptionIndex": z.number()
})