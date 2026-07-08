import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { REVIEW_REGULATION_MD, RESEARCH_ETHICS_MD } from "./policy-content";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const editor = await prisma.user.upsert({
    where: { email: "editor@kgpa.or.kr" },
    update: {},
    create: {
      email: "editor@kgpa.or.kr",
      passwordHash,
      name: "편집위원장",
      affiliation: "한국게임정책학회",
      phone: "02-0000-0000",
      role: "EDITOR",
    },
  });

  const reviewer1 = await prisma.user.upsert({
    where: { email: "reviewer1@kgpa.or.kr" },
    update: {},
    create: {
      email: "reviewer1@kgpa.or.kr",
      passwordHash,
      name: "심사위원A",
      affiliation: "서울대학교",
      phone: "010-1111-1111",
      role: "REVIEWER",
    },
  });

  const reviewer2 = await prisma.user.upsert({
    where: { email: "reviewer2@kgpa.or.kr" },
    update: {},
    create: {
      email: "reviewer2@kgpa.or.kr",
      passwordHash,
      name: "심사위원B",
      affiliation: "연세대학교",
      phone: "010-2222-2222",
      role: "REVIEWER",
    },
  });

  const author = await prisma.user.upsert({
    where: { email: "author@kgpa.or.kr" },
    update: {},
    create: {
      email: "author@kgpa.or.kr",
      passwordHash,
      name: "저자홍길동",
      affiliation: "고려대학교",
      phone: "010-3333-3333",
      role: "AUTHOR",
    },
  });

  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      passwordHash: adminPasswordHash,
      name: "관리자",
      affiliation: "한국게임정책학회",
      phone: "02-0000-0000",
      role: "ADMIN",
    },
  });

  const volume = await prisma.volume.upsert({
    where: { id: "seed-volume-1" },
    update: {},
    create: {
      id: "seed-volume-1",
      label: "Vol.1 No.1",
      callStartDate: new Date("2026-01-01"),
      callEndDate: new Date("2026-02-28"),
      plannedPublishDate: new Date("2026-06-30"),
      status: "OPEN",
    },
  });

  await prisma.notice.upsert({
    where: { id: "seed-notice-1" },
    update: {},
    create: {
      id: "seed-notice-1",
      title: "「인터랙티브미디어저널」 창간호 논문 투고 안내",
      content:
        "한국게임정책학회 「인터랙티브미디어저널」 창간호(Vol.1 No.1) 논문을 투고해 주시기 바랍니다. 투고 양식은 자료실에서 다운로드하실 수 있습니다.",
      isPinned: true,
      authorId: editor.id,
    },
  });

  await prisma.policy.upsert({
    where: { slug: "review-regulation" },
    update: {},
    create: {
      slug: "review-regulation",
      title: "심사규정",
      content: REVIEW_REGULATION_MD,
      effectiveDate: new Date("2026-03-01"),
      updatedById: admin.id,
    },
  });

  await prisma.policy.upsert({
    where: { slug: "research-ethics" },
    update: {},
    create: {
      slug: "research-ethics",
      title: "연구윤리규정",
      content: RESEARCH_ETHICS_MD,
      effectiveDate: new Date("2026-03-01"),
      updatedById: admin.id,
    },
  });

  console.log("Seed complete:", {
    admin: admin.email,
    editor: editor.email,
    reviewer1: reviewer1.email,
    reviewer2: reviewer2.email,
    author: author.email,
    volume: volume.label,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
