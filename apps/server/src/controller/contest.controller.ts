import {
    createContestDsaSchema,
    createContestMcqSchema,
    createContestSchema,
    submitContestMcqSchema,
} from "@/utils/types";
import prisma from "@contest-platform-assignment/db";
import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "@/middleware/auth.middleware";

const createContest = async (req: Request, res: Response) => {
    try {
        const { userId: creatorId } = (req as AuthenticatedRequest).user;
        const { success, data } = createContestSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        }

        const { title, description, start_time, end_time } = data;

        const contest = await prisma.contests.create({
            data: {
                title,
                description,
                start_time,
                end_time,
                creator_id: creatorId,
            },
        });

        return res.status(201).json({
            success: true,
            data: {
                id: contest.id,
                title: contest.title,
                description: contest.description,
                creator_id: contest.creator_id,
                start_time: contest.start_time,
                end_time: contest.end_time,
            },
            error: null,
        });
    } catch (error) {
        console.log("Error while creating contest:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

const getContest = async (req: Request, res: Response) => {
    try {
        const { id: contestId } = req.params;

        if (!contestId) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        }

        const contest = await prisma.contests.findUnique({
            where: {
                id: contestId as string,
            },
            select: {
                id: true,
                title: true,
                description: true,
                start_time: true,
                end_time: true,
                creator_id: true,
                mcq_questions: {
                    select: {
                        id: true,
                        question_text: true,
                        options: true,
                        points: true,
                    },
                },
                dsa_problems: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        tags: true,
                        points: true,
                        time_limit: true,
                        memory_limit: true,
                    },
                },
            },
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                id: contest.id,
                title: contest.title,
                description: contest.description,
                startTime: contest.start_time,
                endTime: contest.end_time,
                creatorId: contest.creator_id,
                mcqs: contest.mcq_questions.map((mcq) => ({
                    id: mcq.id,
                    questionText: mcq.question_text,
                    options: mcq.options,
                    points: mcq.points,
                })),
                dsaProblems: contest.dsa_problems.map((dsa) => ({
                    id: dsa.id,
                    title: dsa.title,
                    description: dsa.description,
                    tags: dsa.tags,
                    points: dsa.points,
                    timeLimit: dsa.time_limit,
                    memoryLimit: dsa.memory_limit,
                })),
            },
            error: null,
        });
    } catch (error) {
        console.log("Error while getting contest:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

const createContestMcq = async (req: Request, res: Response) => {
    try {
        const { id: contestId } = req.params;
        const { userId: creatorId } = (req as AuthenticatedRequest).user;

        const { success, data } = createContestMcqSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        }

        const { question_text, options, correct_option_index, points } = data;

        const contest = await prisma.contests.findUnique({
            where: {
                id: contestId as string,
                creator_id: creatorId as string,
            },
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        }

        const addMcq = await prisma.mcqQuestions.create({
            data: {
                question_text: question_text,
                options: options,
                correct_option_index: correct_option_index,
                points: points,
                contest_id: contestId as string,
            },
        });

        return res.status(201).json({
            success: true,
            data: {
                id: addMcq.id,
                contestId: addMcq.contest_id,
            },
            error: null,
        });
    } catch (error) {
        console.log("Error while creating contest MCQ:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

const submitContestMcq = async (req: Request, res: Response) => {
    try {
        const { id: contestId, mcqId: mcqId } = req.params;
        const { userId: contesteeId } = (req as AuthenticatedRequest).user;

        const { success, data } = submitContestMcqSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        }

        const { selectedOptionIndex } = data;

        const contest = await prisma.contests.findUnique({
            where: {
                id: contestId as string,
            },
            include: {
                mcq_questions: true,
            },
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        }

        if (contest && contest.end_time <= new Date()) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_ACTIVE",
            });
        }

        const checkMcq = contest.mcq_questions.find((mcq) => mcq.id === mcqId as string);
        if (!checkMcq) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "QUESTION_NOT_FOUND",
            });
        }
        
        const existingSubmission = await prisma.mcqSubmissions.findUnique({
            where: {
                user_id_question_id: {
                    user_id: contesteeId as string,
                    question_id: mcqId as string,
                }
            }
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "ALREADY_SUBMITTED",
            });
        }

        const submission = await prisma.mcqSubmissions.create({
            data: {
                user_id: contesteeId as string,
                question_id: mcqId as string,
                selected_option_index: selectedOptionIndex,
                is_correct: selectedOptionIndex === checkMcq.correct_option_index,
                points_earned: selectedOptionIndex === checkMcq.correct_option_index ? checkMcq.points : 0,
                submitted_at: new Date(),
            }
        })

        return res.status(201).json({
            success: true,
            data: {
                id: submission.id,
                "isCorrect": submission.is_correct,
                "pointsEarned": submission.points_earned,
            },
            error: null,
        });

    } catch (error) {
        console.log("Error while submitting contest MCQ:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

const createContestDsa = async (req: Request, res: Response) => {
    try {
        const { id: contestId } = req.params;
        const { userId: creatorId } = (req as AuthenticatedRequest).user;

        const { success, data } = createContestDsaSchema.safeParse(req.body);

        if (!success) {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_REQUEST",
            });
        }

        const {
            title,
            description,
            tags,
            points,
            time_limit,
            memory_limit,
            test_cases,
        } = data;

        const contest = await prisma.contests.findUnique({
            where: {
                id: contestId as string,
                creator_id: creatorId as string,
            },
        });

        if (!contest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: "CONTEST_NOT_FOUND",
            });
        }

        const addDsa = await prisma.dsaProblems.create({
            data: {
                title: title,
                description: description,
                tags: tags,
                points: points,
                time_limit: time_limit,
                memory_limit: memory_limit,
                contest_id: contestId as string,
                test_cases: {
                    create: test_cases.map((test_case) => ({
                        input: test_case.input,
                        expected_output: test_case.expected_output,
                        is_hidden: test_case.is_hidden,
                    })),
                },
            },
        });

        return res.status(201).json({
            success: true,
            data: {
                id: addDsa.id,
                contestId: addDsa.contest_id,
            },
            error: null,
        });
    } catch (error) {
        console.log("Error while creating contest DSA:", error);
        return res.status(500).json({
            success: false,
            data: null,
            error: "Internal server error",
        });
    }
};

export const contestController = {
    createContest,
    getContest,
    createContestMcq,
    submitContestMcq,
    createContestDsa,
};
