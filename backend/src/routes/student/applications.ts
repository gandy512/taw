import { Router } from "express";
import { Types } from "mongoose";
import { Application, IApplication } from "../../models/Application";
import { Host, IHost } from "../../models/Host";
import { Lecturer, ILecturer } from "../../models/Lecturer";
import { Module, IModule } from "../../models/Module";
import { Mapping } from "../../models/Mapping";
import { NewMapping } from "../../models/NewMapping";
import { upload, uploadsDir } from "../../middleware/upload";

const router = Router();

const SEMESTERS = ["Winter", "Summer", "FullYear"];
const MIN_CREDITS_PER_SIDE = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const DURATION_BOUNDS: Record<string, [number, number]> = {
  Winter: [120, 240],
  Summer: [120, 240],
  FullYear: [300, 400],
};

async function findOwnApplication(id: string, studentId: string) {
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }
  return Application.findOne({ _id: id, student: studentId });
}

function isMutable(application: IApplication): boolean {
  return application.admin_status !== "canceled" && application.admin_status !== "terminated";
}

function isDecided(application: IApplication): boolean {
  return application.last_decision != null;
}

function isApproved(application: IApplication): boolean {
  return application.last_decision === "acceptance";
}

function mobilityStarted(application: IApplication): boolean {
  return !!application.start && new Date() > application.start;
}

async function hasBegunCompletion(application: IApplication): Promise<boolean> {
  if (application.finish || application.transcript_of_records) {
    return true;
  }
  return !!(await Mapping.exists({ application: application._id, grade: { $ne: null } }));
}

async function hasPendingModification(application: IApplication): Promise<boolean> {
  if (application.new_learning_agreement) {
    return true;
  }
  return !!(await NewMapping.exists({ application: application._id }));
}

function parseModuleIds(raw: unknown): string[] | null {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(value) || value.length === 0 || !value.every((m) => typeof m === "string" && Types.ObjectId.isValid(m))) {
    return null;
  }
  return value;
}

async function validateModules(moduleIds: string[]): Promise<{ error: string } | { modules: IModule[] }> {
  const foundModules = await Module.find({ _id: { $in: moduleIds } });
  if (foundModules.length !== moduleIds.length) {
    return { error: "One or more modules were not found" };
  }

  const cfCredits = foundModules.filter((m) => !m.host).reduce((sum, m) => sum + m.credits, 0);
  const overseasCredits = foundModules.filter((m) => !!m.host).reduce((sum, m) => sum + m.credits, 0);

  if (cfCredits < MIN_CREDITS_PER_SIDE || overseasCredits < MIN_CREDITS_PER_SIDE || cfCredits > overseasCredits) {
    return {
      error: `Mapping must total at least ${MIN_CREDITS_PER_SIDE} Ca' Foscari credits and ${MIN_CREDITS_PER_SIDE} overseas credits, with Ca' Foscari credits no greater than overseas credits (got ${cfCredits} CF / ${overseasCredits} overseas)`,
    };
  }

  return { modules: foundModules };
}

router.get("/", async (req, res) => {
  const applications = await Application.find({ student: req.user!.id })
    .populate<{ lecturer: ILecturer }>("lecturer", "name surname username")
    .populate<{ host: IHost }>("host", "name country city");

  res.json(
    applications.map((application) => ({
      id: application._id.toString(),
      lecturer: {
        id: application.lecturer._id.toString(),
        name: application.lecturer.name,
        surname: application.lecturer.surname,
        username: application.lecturer.username,
      },
      host: {
        id: application.host._id.toString(),
        name: application.host.name,
        country: application.host.country,
        city: application.host.city,
      },
      year: application.year,
      semester: application.semester,
      status: application.admin_status,
    }))
  );
});

router.post("/", async (req, res) => {
  const { host, lecturer, year, semester } = req.body ?? {};

  if (
    typeof host !== "string" ||
    !Types.ObjectId.isValid(host) ||
    typeof lecturer !== "string" ||
    !Types.ObjectId.isValid(lecturer) ||
    typeof year !== "number" ||
    !SEMESTERS.includes(semester)
  ) {
    res.status(400).json({ error: "Invalid application data" });
    return;
  }

  const [hostExists, lecturerExists] = await Promise.all([
    Host.exists({ _id: host }),
    Lecturer.exists({ _id: lecturer }),
  ]);

  if (!hostExists || !lecturerExists) {
    res.status(400).json({ error: "Host or lecturer not found" });
    return;
  }

  const application = await Application.create({
    student: req.user!.id,
    host,
    lecturer,
    year,
    semester,
  });

  res.status(201).json({ id: application._id.toString() });
});

router.get("/:id", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, student: req.user!.id })
    .populate<{ lecturer: ILecturer }>("lecturer", "name surname username")
    .populate<{ host: IHost }>("host", "name country city");

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const mappings = await Mapping.find({ application: application._id }).populate<{ module: IModule }>(
    "module",
    "code name credits host"
  );
  const newMappings = await NewMapping.find({ application: application._id }).populate<{ module: IModule }>(
    "module",
    "code name credits host"
  );

  res.json({
    id: application._id.toString(),
    lecturer: {
      id: application.lecturer._id.toString(),
      name: application.lecturer.name,
      surname: application.lecturer.surname,
      username: application.lecturer.username,
    },
    host: {
      id: application.host._id.toString(),
      name: application.host.name,
      country: application.host.country,
      city: application.host.city,
    },
    year: application.year,
    semester: application.semester,
    start: application.start,
    finish: application.finish,
    learning_agreement: application.learning_agreement,
    new_learning_agreement: application.new_learning_agreement,
    modification_reason: application.modification_reason,
    transcript_of_records: application.transcript_of_records,
    last_decision: application.last_decision,
    last_decision_reason: application.last_decision_reason,
    last_modification_decision: application.last_modification_decision,
    last_modification_decision_reason: application.last_modification_decision_reason,
    grades_approved_date: application.grades_approved_date,
    mapping: mappings.map((mapping) => ({
      id: mapping._id.toString(),
      module: {
        id: mapping.module._id.toString(),
        code: mapping.module.code,
        name: mapping.module.name,
        credits: mapping.module.credits,
        host: mapping.module.host ? mapping.module.host.toString() : null,
      },
      grade: mapping.grade,
      grade_cf: mapping.grade_cf,
      exam_date: mapping.exam_date,
    })),
    new_mapping: newMappings.map((mapping) => ({
      id: mapping._id.toString(),
      module: {
        id: mapping.module._id.toString(),
        code: mapping.module.code,
        name: mapping.module.name,
        credits: mapping.module.credits,
        host: mapping.module.host ? mapping.module.host.toString() : null,
      },
    })),
    status: application.admin_status,
  });
});

router.get("/:id/learning-agreement", async (req, res) => {
  const application = await findOwnApplication(req.params.id, req.user!.id);
  if (!application?.learning_agreement) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendFile(application.learning_agreement, { root: uploadsDir });
});

router.get("/:id/new-learning-agreement", async (req, res) => {
  const application = await findOwnApplication(req.params.id, req.user!.id);
  if (!application?.new_learning_agreement) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendFile(application.new_learning_agreement, { root: uploadsDir });
});

router.get("/:id/transcript-of-records", async (req, res) => {
  const application = await findOwnApplication(req.params.id, req.user!.id);
  if (!application?.transcript_of_records) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendFile(application.transcript_of_records, { root: uploadsDir });
});

router.post("/:id/cancel", async (req, res) => {
  const application = await findOwnApplication(req.params.id, req.user!.id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  if (!isMutable(application) || !isApproved(application) || mobilityStarted(application)) {
    res.status(409).json({ error: "This application cannot be canceled" });
    return;
  }

  application.admin_status = "canceled";
  await application.save();

  res.json({ status: application.admin_status });
});

// Single-confirm submission of start + mapping + Learning Agreement (pre-decision).
router.post("/:id/plan", upload.single("file"), async (req, res) => {
  const application = await findOwnApplication(req.params.id, req.user!.id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  if (!isMutable(application) || isDecided(application)) {
    res.status(409).json({ error: "This application can no longer be modified" });
    return;
  }

  const { start } = req.body ?? {};
  if (typeof start !== "string" || Number.isNaN(Date.parse(start))) {
    res.status(400).json({ error: "Invalid start date" });
    return;
  }

  const moduleIds = parseModuleIds(req.body?.modules);
  if (!moduleIds) {
    res.status(400).json({ error: "Invalid module list" });
    return;
  }

  const result = await validateModules(moduleIds);
  if ("error" in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  if (!req.file && !application.learning_agreement) {
    res.status(400).json({ error: "A Learning Agreement PDF is required" });
    return;
  }

  application.start = new Date(start);
  if (req.file) {
    application.learning_agreement = req.file.filename;
  }
  await Mapping.deleteMany({ application: application._id });
  await Mapping.insertMany(result.modules.map((module) => ({ application: application._id, module: module._id })));
  await application.save();

  res.json({ ok: true });
});

// Single-confirm submission of a mapping/LA modification proposal (post-start).
router.post("/:id/propose-modification", upload.single("file"), async (req, res) => {
  const application = await findOwnApplication(req.params.id, req.user!.id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  if (
    !isMutable(application) ||
    !isApproved(application) ||
    !mobilityStarted(application) ||
    (await hasBegunCompletion(application))
  ) {
    res.status(409).json({ error: "A modification cannot be proposed at this time" });
    return;
  }

  const moduleIds = parseModuleIds(req.body?.modules);
  if (!moduleIds) {
    res.status(400).json({ error: "Invalid module list" });
    return;
  }

  const { modification_reason } = req.body ?? {};
  if (typeof modification_reason !== "string" || modification_reason.trim().length === 0) {
    res.status(400).json({ error: "A description of the modification is required" });
    return;
  }

  const result = await validateModules(moduleIds);
  if ("error" in result) {
    res.status(400).json({ error: result.error });
    return;
  }

  if (!req.file && !application.new_learning_agreement) {
    res.status(400).json({ error: "A Learning Agreement PDF is required" });
    return;
  }

  if (req.file) {
    application.new_learning_agreement = req.file.filename;
  }
  application.modification_reason = modification_reason.trim();
  await NewMapping.deleteMany({ application: application._id });
  await NewMapping.insertMany(result.modules.map((module) => ({ application: application._id, module: module._id })));
  await application.save();

  res.json({ ok: true });
});

// Single-confirm submission of finish + overseas grades + Transcript of Records.
router.post("/:id/complete", upload.single("file"), async (req, res) => {
  const application = await findOwnApplication(req.params.id, req.user!.id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  if (
    !isMutable(application) ||
    !isApproved(application) ||
    !mobilityStarted(application) ||
    (await hasPendingModification(application)) ||
    application.grades_approved_date
  ) {
    res.status(409).json({ error: "The mobility cannot be completed at this time" });
    return;
  }

  const { finish } = req.body ?? {};
  if (typeof finish !== "string" || Number.isNaN(Date.parse(finish))) {
    res.status(400).json({ error: "Invalid finish date" });
    return;
  }

  const finishDate = new Date(finish);
  if (application.start && finishDate <= application.start) {
    res.status(400).json({ error: "Finish date must be after the start date" });
    return;
  }
  if (application.start) {
    const durationDays = (finishDate.getTime() - application.start.getTime()) / DAY_MS;
    const [min, max] = DURATION_BOUNDS[application.semester];
    if (durationDays < min || durationDays > max) {
      res.status(400).json({
        error: `Mobility duration must be consistent with the selected semester (${application.semester}): expected between ${min} and ${max} days, got ${Math.round(durationDays)}`,
      });
      return;
    }
  }

  let grades: { mappingId: string; grade: number; examDate: string }[];
  try {
    const raw = typeof req.body?.grades === "string" ? JSON.parse(req.body.grades) : req.body?.grades;
    if (!Array.isArray(raw)) throw new Error();
    grades = raw.map((g: any) => {
      if (
        typeof g?.mappingId !== "string" ||
        !Types.ObjectId.isValid(g.mappingId) ||
        typeof g?.grade !== "number" ||
        typeof g?.examDate !== "string" ||
        Number.isNaN(Date.parse(g.examDate))
      ) {
        throw new Error();
      }
      return g;
    });
  } catch {
    res.status(400).json({ error: "Invalid grades data" });
    return;
  }

  const overseasMappings = await Mapping.find({ application: application._id }).populate<{ module: IModule }>(
    "module",
    "host"
  );
  const overseasMappingIds = overseasMappings.filter((m) => m.module.host).map((m) => m._id.toString());
  const providedIds = new Set(grades.map((g) => g.mappingId));
  const missing = overseasMappingIds.filter((id) => !providedIds.has(id));
  if (missing.length > 0) {
    res.status(400).json({ error: "A grade is required for every overseas exam" });
    return;
  }

  if (!req.file && !application.transcript_of_records) {
    res.status(400).json({ error: "A Transcript of Records PDF is required" });
    return;
  }

  application.finish = finishDate;
  if (req.file) {
    application.transcript_of_records = req.file.filename;
  }
  await application.save();

  const byId = new Map(overseasMappings.map((m) => [m._id.toString(), m]));
  for (const g of grades) {
    if (!overseasMappingIds.includes(g.mappingId)) continue;
    const mapping = byId.get(g.mappingId)!;
    mapping.grade = g.grade;
    mapping.exam_date = new Date(g.examDate);
    await mapping.save();
  }

  res.json({ ok: true });
});

export default router;
