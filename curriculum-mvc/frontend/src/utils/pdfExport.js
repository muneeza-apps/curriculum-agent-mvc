// frontend/src/utils/pdfExport.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PRIMARY = [99, 102, 241];
const DARK    = [15,  23,  42];

export function exportCurriculumPDF(curriculum) {
  const doc = new jsPDF();
  const { meta, objectives, lessonPlans, quizzes, weeklyProject, progression } = curriculum;
  let y = 20;

  // Cover
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 210, 50, "F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(20); doc.setFont("helvetica","bold");
  doc.text(meta.topic, 14, 22);
  doc.setFontSize(10); doc.setFont("helvetica","normal");
  doc.text(`${meta.ageGroup} · ${meta.difficulty} · ${meta.specialNeeds !== "None" ? meta.specialNeeds : ""}`, 14, 32);
  doc.text(`Generated ${new Date(meta.generatedAt).toLocaleDateString()} · Foundry IQ Agent`, 14, 40);
  y = 60;

  // Objectives
  doc.setTextColor(...DARK); doc.setFontSize(14); doc.setFont("helvetica","bold");
  doc.text("Learning Objectives", 14, y); y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Day","Objective","Bloom's Level"]],
    body: objectives?.objectives?.map((o) => [`Day ${o.day}`, o.objective, o.bloom_level]) || [],
    headStyles: { fillColor: PRIMARY }, styles: { fontSize: 9 }, margin: { left:14, right:14 },
  });
  y = doc.lastAutoTable.finalY + 12;

  // Lesson plans
  doc.setFontSize(14); doc.setFont("helvetica","bold");
  doc.text("Daily Lesson Plans", 14, y); y += 6;
  lessonPlans?.forEach((l) => {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFillColor(241,245,249); doc.rect(14, y, 182, 8, "F");
    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(...PRIMARY);
    doc.text(`Day ${l.day}: ${l.title}`, 16, y + 5.5); y += 12;
    autoTable(doc, {
      startY: y,
      head: [["Phase","Duration","Description"]],
      body: Object.entries(l.lesson_plan || {}).map(([k,v]) => [k.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()), v.duration||"", v.description||""]),
      headStyles: { fillColor: [30,41,59] }, styles: { fontSize: 8 }, margin: { left:14, right:14 },
    });
    y = doc.lastAutoTable.finalY + 10;
  });

  // Quizzes
  doc.addPage(); y = 20;
  doc.setTextColor(...DARK); doc.setFontSize(14); doc.setFont("helvetica","bold");
  doc.text("Assessments & Quizzes", 14, y); y += 8;
  quizzes?.forEach((quiz) => {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(...PRIMARY);
    doc.text(`Day ${quiz.day} Quiz  (Difficulty: ${quiz.difficulty_score}/10)`, 14, y); y += 6;
    quiz.questions?.forEach((q, i) => {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(...DARK);
      doc.text(`Q${i+1}: ${q.question}`, 14, y, { maxWidth:182 }); y += 6;
      q.options?.forEach((opt) => { doc.setFont("helvetica","normal"); doc.text(`  ${opt}`, 14, y); y += 5; });
      doc.setTextColor(...PRIMARY);
      doc.text(`  ✓ ${q.correct_answer}: ${q.explanation}`, 14, y, { maxWidth:182 }); y += 8;
    });
    y += 4;
  });

  // Progression
  if (progression?.progression) {
    doc.addPage(); y = 20;
    doc.setTextColor(...DARK); doc.setFontSize(14); doc.setFont("helvetica","bold");
    doc.text("Difficulty Progression", 14, y); y += 8;
    autoTable(doc, {
      startY: y,
      head: [["Day","Score","Stage","Focus","Load"]],
      body: progression.progression.map((p) => [`Day ${p.day}`, `${p.score}/10`, p.label, p.focus, p.cognitive_load]),
      headStyles: { fillColor: PRIMARY }, styles: { fontSize: 9 }, margin: { left:14, right:14 },
    });
  }

  // Weekly project
  if (weeklyProject) {
    doc.addPage(); y = 20;
    doc.setTextColor(...DARK); doc.setFontSize(14); doc.setFont("helvetica","bold");
    doc.text("Weekly Project", 14, y); y += 8;
    doc.setFontSize(12); doc.setTextColor(...PRIMARY);
    doc.text(weeklyProject.title, 14, y); y += 7;
    doc.setFontSize(9); doc.setTextColor(...DARK); doc.setFont("helvetica","normal");
    doc.text(weeklyProject.description, 14, y, { maxWidth:182 }); y += 12;
    doc.setFont("helvetica","bold"); doc.text("Rubric:", 14, y); y += 5;
    weeklyProject.rubric?.forEach((r) => { doc.setFont("helvetica","normal"); doc.text(`  • ${r}`, 14, y); y += 5; });
  }

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(148,163,184);
    doc.text(`Curriculum Builder Agent · Foundry IQ · Page ${i} of ${pages}`, 14, 290);
  }

  doc.save(`${meta.topic.replace(/\s+/g,"_")}_curriculum.pdf`);
}
