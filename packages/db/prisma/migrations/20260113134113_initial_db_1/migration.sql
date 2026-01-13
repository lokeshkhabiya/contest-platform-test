-- AddForeignKey
ALTER TABLE "TestCases" ADD CONSTRAINT "TestCases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "DsaProblems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
