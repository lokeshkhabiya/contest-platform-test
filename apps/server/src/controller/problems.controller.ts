import prisma from "@contest-platform-assignment/db";
import type { Request, Response } from "express";

const getProblem = async (req: Request, res: Response) => {
    try {
        const { problemId } = req.params;

		if (!problemId) {
			return res.status(400).json({
				success: false,
				data: null,
				error: "INVALID_REQUEST",
			});
		}

		const problem = await prisma.dsaProblems.findUnique({
			where: { 
				id: problemId as string,
			},
			include: {
				test_cases: {
					select: {
						input: true,
						expected_output: true,
						is_hidden: true, 
					}
				},
			},
		})

		if (!problem) {
			return res.status(404).json({
				success: false,
				data: null,
				error: "PROBLEM_NOT_FOUND",
			});
		}

		const visibleTestCases = problem.test_cases
			.filter((test_case) => !test_case.is_hidden)
			.map((test_case) => ({
				input: test_case.input,
				expectedOutput: test_case.expected_output,
			}));

		return res.status(200).json({
			success: true,
			data: {
				id: problem.id,
				contestId: problem.contest_id,
				title: problem.title,
				description: problem.description,
				tags: problem.tags,
				points: problem.points,
				timeLimit: problem.time_limit,
				memoryLimit: problem.memory_limit,
				visibleTestCases: visibleTestCases,
			},
			error: null,
		});


    } catch (error) {
        console.log("Error while getting problem:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

export const problemsController = {
    getProblem,
};