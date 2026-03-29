declare class TestCaseDto {
    input: string;
    expectedOutput: string;
}
export declare class RunCodeDto {
    code: string;
    language: string;
    testCases?: TestCaseDto[];
}
export {};
