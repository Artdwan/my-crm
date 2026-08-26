-- Splits the payer (Client) from the learner (Student). Clients are usually
-- parents, so grade/subject never belonged on them, and a subscription is
-- really bought for one child.
--
-- Hand-edited from `prisma migrate diff`: the generated version dropped
-- Client.grade and Subscription.clientId outright, which would have thrown
-- away every existing subscription's owner. This version backfills instead.

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "kabinetStudentId" TEXT,
    "kabinetSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_kabinetStudentId_key" ON "Student"("kabinetStudentId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one student per existing client, carrying over the grade that
-- used to live on the client. Existing rows describe a single learner, so
-- one student each is the faithful reading.
INSERT INTO "Student" ("clientId", "name", "grade", "createdAt")
SELECT "id", "name", COALESCE(NULLIF("grade", ''), 'Класс не указан'), "createdAt"
FROM "Client";

-- Repoint subscriptions at students, going through the client they used to
-- belong to. Nullable first so the backfill has somewhere to land.
ALTER TABLE "Subscription" ADD COLUMN "studentId" INTEGER;

UPDATE "Subscription" sub
SET "studentId" = st."id"
FROM "Student" st
WHERE st."clientId" = sub."clientId";

-- Any subscription that somehow found no student would violate the FK below;
-- fail loudly here instead, while the old column is still around to inspect.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Subscription" WHERE "studentId" IS NULL) THEN
    RAISE EXCEPTION 'Subscription rows left without a student — aborting migration';
  END IF;
END $$;

ALTER TABLE "Subscription" ALTER COLUMN "studentId" SET NOT NULL;

-- Now the old ownership can go.
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_clientId_fkey";
DROP INDEX "Subscription_clientId_subject_periodStart_key";
ALTER TABLE "Subscription" DROP COLUMN "clientId";

-- Same guard as before, per student rather than per client: two siblings may
-- now take the same subject in the same month, which the old constraint
-- wrongly forbade.
CREATE UNIQUE INDEX "Subscription_studentId_subject_periodStart_key" ON "Subscription"("studentId", "subject", "periodStart");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- grade/subject now live on the student.
ALTER TABLE "Client" DROP COLUMN "grade", DROP COLUMN "subject";
