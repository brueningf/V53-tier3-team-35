import { Context } from "./context";
import { AssignmentType, Role } from "@prisma/client";
import { userFactory, userCreateInputFactory } from "../factories/user";
import {
    courseFactory,
    courseCreateInputWithoutInstructorFactory,
} from "../factories/course";
import { unitCreateInputWithoutCourseFactory } from "../factories/unit";
import {
    assignmentCreateInputWithoutUnitFactory,
    readingAssignmentCreateInputFactory,
    videoAssignmentCreateInputFactory,
} from "../factories/assignment";

export const cleanDatabase = async (ctx: Context) => {
    const deleteQuizzes = ctx.prisma.quizAssignment.deleteMany();
    const deleteVideoAssignments = ctx.prisma.videoAssignment.deleteMany();
    const deleteReadingAssignments = ctx.prisma.readingAssignment.deleteMany();
    const deleteAssignments = ctx.prisma.assignment.deleteMany();
    const deleteUnits = ctx.prisma.unit.deleteMany();
    const deleteCourses = ctx.prisma.course.deleteMany();
    const deleteAccounts = ctx.prisma.account.deleteMany();
    const deleteUsers = ctx.prisma.user.deleteMany();

    await ctx.prisma.$transaction([
        deleteQuizzes,
        deleteVideoAssignments,
        deleteReadingAssignments,
        deleteAssignments,
        deleteUnits,
        deleteCourses,
        deleteAccounts,
        deleteUsers,
    ]);
};

export const createPersistentCourse = async (
    ctx: Context,
    amount: number = 1,
) => {
    const instructors = await ctx.prisma.user.createManyAndReturn({
        data: Array.from({ length: 3 }, () => {
            return userCreateInputFactory(Role.INSTRUCTOR);
        }),
    });

    const instructor =
        instructors[Math.floor(Math.random() * instructors.length)];

    const courses = await ctx.prisma.course.createManyAndReturn({
        data: Array.from({ length: amount }, () => {
            return {
                ...courseCreateInputWithoutInstructorFactory(),
                instructorId: instructor.id,
            };
        }),
        include: {
            instructor: true,
        },
        skipDuplicates: true,
    });

    const assignmentTypes = Object.values(AssignmentType);

    for (const course of courses) {
        const units = await ctx.prisma.unit.createManyAndReturn({
            data: Array.from(
                { length: Math.floor(Math.random() * 10) + 1 },
                () => {
                    return {
                        ...unitCreateInputWithoutCourseFactory(),
                        courseId: course.id,
                    };
                },
            ),
        });

        for (const unit of units) {
            const assignments = await ctx.prisma.assignment.createManyAndReturn(
                {
                    data: Array.from(
                        { length: Math.floor(Math.random() * 5) + 1 },
                        () => {
                            const type =
                                assignmentTypes[
                                    Math.floor(
                                        Math.random() * assignmentTypes.length,
                                    )
                                ];
                            return {
                                ...assignmentCreateInputWithoutUnitFactory(
                                    type,
                                ),
                                unitId: unit.id,
                            };
                        },
                    ),
                },
            );

            for (const assignment of assignments) {
                if (assignment.type === AssignmentType.READING) {
                    await ctx.prisma.readingAssignment.create({
                        data: {
                            assignmentId: assignment.id,
                            ...readingAssignmentCreateInputFactory(),
                        },
                    });
                }

                if (assignment.type === AssignmentType.VIDEO) {
                    await ctx.prisma.videoAssignment.create({
                        data: {
                            assignmentId: assignment.id,
                            ...videoAssignmentCreateInputFactory(),
                        },
                    });
                }
            }
        }
    }

    return courses;
};

export const createPersistentStudent = async (
    ctx: Context,
    amount: number = 1,
) => {
    return await ctx.prisma.user.createManyAndReturn({
        data: Array.from({ length: amount }, () => {
            return userCreateInputFactory(Role.STUDENT);
        }),
    });
};

export const createPersistentInstructor = async (
    ctx: Context,
    amount: number = 1,
) => {
    return await ctx.prisma.user.createManyAndReturn({
        data: Array.from({ length: amount }, () => {
            return userCreateInputFactory(Role.INSTRUCTOR);
        }),
    });
};

export const createInstructor = async () => {
    return userFactory(Role.INSTRUCTOR);
};

export const createStudent = async (amount: number = 1) => {
    return Array.from({ length: amount }, () => {
        return userFactory(Role.STUDENT);
    });
};

export const createCourses = async (amount: number = 1) => {
    return Array.from({ length: amount }, () => {
        return courseFactory();
    });
};
