-- CreateIndex
CREATE INDEX "families_family_name_idx" ON "families"("family_name");

-- CreateIndex
CREATE INDEX "families_head_name_idx" ON "families"("head_name");

-- CreateIndex
CREATE INDEX "members_family_id_idx" ON "members"("family_id");

-- CreateIndex
CREATE INDEX "members_name_idx" ON "members"("name");

-- CreateIndex
CREATE INDEX "members_nik_idx" ON "members"("nik");
