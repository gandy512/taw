export const hostsSeed = [
  { prefix: "MELB", name: "University of Melbourne", country: "Australia", city: "Melbourne", email: "international@unimelb.edu.au" },
  { prefix: "UTOK", name: "University of Tokyo", country: "Japan", city: "Tokyo", email: "isc@adm.u-tokyo.ac.jp" },
  { prefix: "NUS", name: "National University of Singapore", country: "Singapore", city: "Singapore", email: "exchange@nus.edu.sg" },
  { prefix: "UTOR", name: "University of Toronto", country: "Canada", city: "Toronto", email: "exchange@utoronto.ca" },
  { prefix: "UCB", name: "University of California, Berkeley", country: "United States", city: "Berkeley", email: "studyabroad@berkeley.edu" },
  { prefix: "USP", name: "University of São Paulo", country: "Brazil", city: "São Paulo", email: "internacional@usp.br" },
  { prefix: "SNU", name: "Seoul National University", country: "South Korea", city: "Seoul", email: "oia@snu.ac.kr" },
  { prefix: "UCT", name: "University of Cape Town", country: "South Africa", city: "Cape Town", email: "international@uct.ac.za" },
  { prefix: "FUD", name: "Fudan University", country: "China", city: "Shanghai", email: "oia@fudan.edu.cn" },
  { prefix: "AUCK", name: "University of Auckland", country: "New Zealand", city: "Auckland", email: "international@auckland.ac.nz" },
];

export const lecturersSeed = [
  { username: "fbergamasco", password: "lecturer", name: "Filippo", surname: "Bergamasco", email: "filippo.bergamasco@unive.it" },
  { username: "amarin", password: "lecturer", name: "Andrea", surname: "Marin", email: "andrea.marin@unive.it" },
  { username: "scalzavara", password: "lecturer", name: "Stefano", surname: "Calzavara", email: "stefano.calzavara@unive.it" },
  { username: "araffaeta", password: "lecturer", name: "Alessandra", surname: "Raffaetà", email: "alessandra.raffaeta@unive.it" },
  { username: "gsantin", password: "lecturer", name: "Gabriele", surname: "Santin", email: "gabriele.santin@unive.it" },
  { username: "dpasetto", password: "lecturer", name: "Damiano", surname: "Pasetto", email: "damiano.pasetto@unive.it" },
  { username: "rgricci", password: "lecturer", name: "Roberto", surname: "Ghiselli Ricci", email: "roberto.ghiselliricci@unive.it" },
];

export const studentsSeed = [
  { username: "pzanasi", password: "student", name: "Pietro", surname: "Zanasi", course: "Informatica", email: "pietro.zanasi@stud.unive.it" },
  { username: "gcolombo", password: "student", name: "Giulia", surname: "Colombo", course: "Economia e Gestione Aziendale", email: "giulia.colombo@stud.unive.it" },
  { username: "mrossi", password: "student", name: "Marco", surname: "Rossi", course: "Informatica", email: "marco.rossi@stud.unive.it" },
  { username: "fesposito", password: "student", name: "Francesca", surname: "Esposito", course: "Lingue e Civiltà dell'Asia Orientale", email: "francesca.esposito@stud.unive.it" },
  { username: "lbianchi", password: "student", name: "Luca", surname: "Bianchi", course: "Scienze Ambientali", email: "luca.bianchi@stud.unive.it" },
  { username: "sferrari", password: "student", name: "Sara", surname: "Ferrari", course: "Statistica e Gestione delle Imprese", email: "sara.ferrari@stud.unive.it" },
  { username: "agreco", password: "student", name: "Alessia", surname: "Greco", course: "Filosofia", email: "alessia.greco@stud.unive.it" },
  { username: "dromano", password: "student", name: "Davide", surname: "Romano", course: "Informatica", email: "davide.romano@stud.unive.it" },
];

export const applicationsSeed: { studentIdx: number; lecturerIdx: number; hostIdx: number; year: number; semester: "Winter" | "Summer" | "FullYear" }[] = [
  { studentIdx: 0, lecturerIdx: 6, hostIdx: 0, year: 2024, semester: "FullYear" },
  { studentIdx: 2, lecturerIdx: 1, hostIdx: 1, year: 2025, semester: "Winter" },
  { studentIdx: 3, lecturerIdx: 0, hostIdx: 8, year: 2025, semester: "Summer" },
];

export const adminSeed = {
  username: "admin",
  password: "admin",
  name: "Overseas",
  surname: "Office",
  email: "overseas.office@unive.it",
};

const cfSubjects = [
  "Algorithms", "Data Structures", "Databases", "Operating Systems", "Computer Networks",
  "Software Engineering", "Artificial Intelligence", "Machine Learning", "Deep Learning",
  "Computer Vision", "Natural Language Processing", "Cybersecurity", "Cryptography",
  "Web Development", "Mobile Development", "Distributed Systems", "Cloud Computing",
  "Computer Graphics", "Human-Computer Interaction", "Programming Languages", "Compilers",
  "Computer Architecture", "Parallel Computing", "Embedded Systems", "Robotics",
  "Big Data", "Data Mining", "Information Retrieval", "Theory of Computation",
  "Computational Complexity", "Formal Methods", "Functional Programming", "Software Testing",
  "DevOps", "Blockchain Technology", "Internet of Things", "Quantum Computing",
  "Bioinformatics", "Game Development", "Digital Signal Processing",
];

const titleTemplates = [
  "Introduction to {s}",
  "Advanced {s}",
  "Principles of {s}",
  "{s} I",
  "{s} II",
  "Contemporary {s}",
  "{s} Theory",
  "Applied {s}",
  "Topics in {s}",
  "Comparative {s}",
];

const cfTeachers = [
  "Filippo Bergamasco", "Andrea Marin", "Stefano Calzavara",
  "Alessandra Raffaetà", "Gabriele Santin", "Damiano Pasetto", "Roberto Ghiselli Ricci",
];

const hostTeachers = [
  "Prof. John Smith", "Prof. Emily Chen", "Prof. Wei Zhang", "Prof. Yuki Tanaka",
  "Prof. Fernanda Silva", "Prof. David Lee", "Prof. Grace Nkosi", "Prof. Daniel Kim",
  "Prof. Sarah Mitchell", "Prof. Liu Wei",
];

export interface ModuleSeed {
  code: string;
  name: string;
  credits: number;
  teacher_name: string;
  host?: string;
}

export function buildCfModules(): ModuleSeed[] {
  const modules: ModuleSeed[] = [];
  for (const template of titleTemplates) {
    for (const subject of cfSubjects) {
      if (modules.length >= 100) break;
      const credits = [6, 9, 6, 6, 12][modules.length % 5];
      modules.push({
        code: `CF${String(modules.length + 1).padStart(3, "0")}`,
        name: template.replace("{s}", subject),
        credits,
        teacher_name: cfTeachers[modules.length % cfTeachers.length],
      });
    }
    if (modules.length >= 100) break;
  }
  return modules;
}

export function buildHostModules(hosts: { id: string; prefix: string }[]): ModuleSeed[] {
  const modules: ModuleSeed[] = [];
  let cursor = 0;
  for (const host of hosts) {
    for (let n = 1; n <= 10; n++) {
      const template = titleTemplates[cursor % titleTemplates.length];
      const subject = cfSubjects[(cursor * 3) % cfSubjects.length];
      const credits = [3, 4, 6, 8][n % 4];
      modules.push({
        code: `${host.prefix}-${100 + n}`,
        name: template.replace("{s}", subject),
        credits,
        teacher_name: hostTeachers[cursor % hostTeachers.length],
        host: host.id,
      });
      cursor += 1;
    }
  }
  return modules;
}
