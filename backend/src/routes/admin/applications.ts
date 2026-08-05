import { Router } from "express";
import { Types } from "mongoose";
import { Application } from "../../models/Application";
import { IStudent } from "../../models/Student";
import { ILecturer } from "../../models/Lecturer";
import { IHost } from "../../models/Host";
import { Mapping } from "../../models/Mapping";
import { IModule } from "../../models/Module";

const router = Router();

function isTerminal(application: { admin_status: string }): boolean {
  return application.admin_status === "canceled" || application.admin_status === "terminated";
}

router.get("/", async (_req, res) => {
  const applications = await Application.find()
    .populate<{ student: IStudent }>("student", "name surname username")
    .populate<{ lecturer: ILecturer }>("lecturer", "name surname username")
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
      status: application.admin_status,
    }))
  );
});

router.get("/:id", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findById(req.params.id)
    .populate<{ student: IStudent }>("student", "name surname username email")
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

  res.json({
    id: application._id.toString(),
    student: {
      id: application.student._id.toString(),
      name: application.student.name,
      surname: application.student.surname,
      username: application.student.username,
      email: application.student.email,
    },
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
    transcript_of_records: application.transcript_of_records,
    last_decision: application.last_decision,
    last_decision_reason: application.last_decision_reason,
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
    status: application.admin_status,
  });
});

router.post("/:id/terminate", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (isTerminal(application)) {
    res.status(409).json({ error: "Application is not in a state that can be terminated" });
    return;
  }

  if (!application.grades_approved_date) {
    res.status(409).json({ error: "Grades have not been approved by the referent lecturer yet" });
    return;
  }

  application.admin_status = "terminated";
  await application.save();

  res.json({ status: application.admin_status });
});

router.post("/:id/cancel", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (isTerminal(application)) {
    res.status(409).json({ error: "Application is not in a state that can be canceled" });
    return;
  }

  application.admin_status = "canceled";
  await application.save();

  res.json({ status: application.admin_status });
});

router.post("/:id/verify-pre-departure", async (req, res) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const application = await Application.findById(req.params.id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (application.admin_status !== "default") {
    res.status(409).json({ error: "Application is not awaiting pre-departure verification" });
    return;
  }

  if (application.last_decision !== "acceptance") {
    res.status(409).json({ error: "The referent lecturer has not approved this application yet" });
    return;
  }

  application.admin_status = "pre_departure_verified";
  await application.save();

  res.json({ status: application.admin_status });
});

export default router;
