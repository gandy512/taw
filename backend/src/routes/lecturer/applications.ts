import { Router } from "express";
import { Types } from "mongoose";
import { Application } from "../../models/Application";
import { IStudent } from "../../models/Student";
import { IHost } from "../../models/Host";
import { Mapping } from "../../models/Mapping";
import { NewMapping } from "../../models/NewMapping";
import { IModule } from "../../models/Module";
import { uploadsDir } from "../../middleware/upload";

const router = Router();

function isTerminal(application: { admin_status: string }): boolean {
  return application.admin_status === "canceled" || application.admin_status === "terminated";
}

router.get("/", async (req, res) => {
  const applications = await Application.find({ lecturer: req.user!.id })
    .populate<{ student: IStudent }>("student", "name surname username")
    .populate<{ host: IHost }>("host", "name country city");

  res.json(
    applications.map((application) => ({
      id: application._id.toString(),
      student: {
        id: application.student._id.toString(),
        name: application.student.name,
        surname: application.student.surname,
        username: application.student.username,
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

router.get("/:id", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, lecturer: req.user!.id })
    .populate<{ student: IStudent }>("student", "name surname username email")
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
    student: {
      id: application.student._id.toString(),
      name: application.student.name,
      surname: application.student.surname,
      username: application.student.username,
      email: application.student.email,
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

router.post("/:id/decision", async (req, res) => {
  const { decision, reason } = req.body ?? {};

  if (decision !== "acceptance" && decision !== "rejection") {
    res.status(400).json({ error: "Decision must be 'acceptance' or 'rejection'" });
    return;
  }
  if (reason !== undefined && typeof reason !== "string") {
    res.status(400).json({ error: "Reason must be a string" });
    return;
  }
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, lecturer: req.user!.id });
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const hasMapping = await Mapping.exists({ application: application._id });
  const isReadyForDecision =
    !isTerminal(application) &&
    !!hasMapping &&
    !!application.start &&
    !!application.learning_agreement &&
    application.last_decision == null;

  if (!isReadyForDecision) {
    res.status(409).json({ error: "Application is not awaiting a decision" });
    return;
  }

  application.last_decision = decision;
  application.last_decision_date = new Date();
  application.last_decision_reason = reason;
  await application.save();

  res.json({ status: application.admin_status });
});

router.get("/:id/learning-agreement", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, lecturer: req.user!.id });
  if (!application?.learning_agreement) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendFile(application.learning_agreement, { root: uploadsDir });
});

router.get("/:id/new-learning-agreement", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, lecturer: req.user!.id });
  if (!application?.new_learning_agreement) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendFile(application.new_learning_agreement, { root: uploadsDir });
});

router.post("/:id/modification-decision", async (req, res) => {
  const { decision, reason } = req.body ?? {};

  if (decision !== "acceptance" && decision !== "rejection") {
    res.status(400).json({ error: "Decision must be 'acceptance' or 'rejection'" });
    return;
  }
  if (reason !== undefined && typeof reason !== "string") {
    res.status(400).json({ error: "Reason must be a string" });
    return;
  }
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, lecturer: req.user!.id });
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (isTerminal(application)) {
    res.status(409).json({ error: "This application can no longer be modified" });
    return;
  }

  const newMappings = await NewMapping.find({ application: application._id });
  if (newMappings.length === 0 || !application.new_learning_agreement) {
    res.status(409).json({ error: "No pending modification to decide on" });
    return;
  }

  if (decision === "acceptance") {
    await Mapping.deleteMany({ application: application._id });
    await Mapping.insertMany(newMappings.map((mapping) => ({ application: application._id, module: mapping.module })));
    await NewMapping.deleteMany({ application: application._id });
    application.learning_agreement = application.new_learning_agreement;
    application.new_learning_agreement = undefined;
  } else {
    await NewMapping.deleteMany({ application: application._id });
    application.new_learning_agreement = undefined;
  }

  application.modification_reason = undefined;
  application.last_modification_decision = decision;
  application.last_modification_decision_date = new Date();
  application.last_modification_decision_reason = reason;
  await application.save();

  res.json({ status: application.admin_status });
});

router.get("/:id/transcript-of-records", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, lecturer: req.user!.id });
  if (!application?.transcript_of_records) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.sendFile(application.transcript_of_records, { root: uploadsDir });
});

router.patch("/:id/mapping/:mappingId/grade", async (req, res) => {
  const { grade_cf } = req.body ?? {};

  if (typeof grade_cf !== "number") {
    res.status(400).json({ error: "Invalid grade data" });
    return;
  }
  if (!Types.ObjectId.isValid(req.params.id) || !Types.ObjectId.isValid(req.params.mappingId)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const application = await Application.findOne({ _id: req.params.id, lecturer: req.user!.id });
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const hasPendingModification =
    !!application.new_learning_agreement || (await NewMapping.exists({ application: application._id }));

  if (
    isTerminal(application) ||
    application.last_decision !== "acceptance" ||
    !application.start ||
    new Date() <= application.start ||
    !application.finish ||
    !application.transcript_of_records ||
    !!application.grades_approved_date ||
    hasPendingModification
  ) {
    res.status(409).json({ error: "The Ca' Foscari grade cannot be set at this time" });
    return;
  }

  const mapping = await Mapping.findOne({ _id: req.params.mappingId, application: application._id }).populate<{
    module: IModule;
  }>("module", "host");
  if (!mapping) {
    res.status(404).json({ error: "Mapping not found" });
    return;
  }
  if (!mapping.module.host) {
    res.status(400).json({ error: "Only overseas exams can have a converted grade" });
    return;
  }

  mapping.grade_cf = grade_cf;
  await mapping.save();

  // Entering the last missing Ca' Foscari grade IS the acceptance of the Transcript of
  // Records: no separate confirmation step from the lecturer is required.
  const overseasMappings = await Mapping.find({ application: application._id }).populate<{ module: IModule }>(
    "module",
    "host"
  );
  const allGraded = overseasMappings.every((m) => !m.module.host || m.grade_cf != null);
  if (allGraded) {
    application.grades_approved_date = new Date();
    await application.save();
  }

  res.json({ grade_cf: mapping.grade_cf });
});

export default router;
