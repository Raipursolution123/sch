import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { Printer, ShieldCheck } from 'lucide-react';
import type { StudentListItem } from '@app-types/students/student';
import type { MarksheetTemplate, AdmitCardTemplate } from '@hooks/useExamTemplates';
import type { ExamSchedule } from '@app-types/examinations/exam-schedule';
import type { ExamGroup } from '@app-types/examinations/exam-group';

interface PrintDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'marksheet' | 'admitcard';
  template: MarksheetTemplate | AdmitCardTemplate | null;
  students: StudentListItem[];
  schedules?: ExamSchedule[];
  examGroups?: ExamGroup[];
}

export function PrintDocumentModal({
  open,
  onOpenChange,
  type,
  template,
  students,
  schedules = [],
}: PrintDocumentModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  const handlePrint = () => {
    window.print();
  };

  if (!template) return null;

  const isAdmitCard = type === 'admitcard';

  const effectiveStudents = students.length > 0 ? students : [
    {
      id: 101,
      admission_no: 'ADM-2026-0042',
      roll_no: '12',
      firstname: 'Rahul',
      lastname: 'Sharma',
      full_name: 'Rahul Sharma',
      class_name: 'Class 10',
      section_name: 'A',
      father_name: 'Vikram Sharma',
      mother_name: 'Sunita Sharma',
      dob: '2010-08-15',
      gender: 'male',
      is_active: 'yes',
      created_at: '2026-01-01',
    },
    {
      id: 102,
      admission_no: 'ADM-2026-0043',
      roll_no: '15',
      firstname: 'Ananya',
      lastname: 'Verma',
      full_name: 'Ananya Verma',
      class_name: 'Class 10',
      section_name: 'A',
      father_name: 'Rajesh Verma',
      mother_name: 'Pooja Verma',
      dob: '2010-11-20',
      gender: 'female',
      is_active: 'yes',
      created_at: '2026-01-01',
    },
    {
      id: 103,
      admission_no: 'ADM-2026-0044',
      roll_no: '18',
      firstname: 'Nidhi',
      lastname: 'Sharma',
      full_name: 'Nidhi Sharma',
      class_name: 'Class 10',
      section_name: 'A',
      father_name: 'Manish Sharma',
      mother_name: 'Kavita Sharma',
      dob: '2011-03-10',
      gender: 'female',
      is_active: 'yes',
      created_at: '2026-01-01',
    }
  ];

  // Filter students based on dropdown selection
  const filteredStudents = selectedStudentId === 'all'
    ? effectiveStudents
    : effectiveStudents.filter((s) => String(s.id) === selectedStudentId);

  const activeStudents = filteredStudents;

  const studentOptions = [
    { value: 'all', label: `All Admitted Students (${effectiveStudents.length})` },
    ...effectiveStudents.map((s) => ({
      value: String(s.id),
      label: `${s.full_name} (${s.admission_no || `Roll ${s.roll_no}`})`,
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>{isAdmitCard ? 'Bulk / Individual Student Admit Card Print' : 'Bulk / Individual Student Marksheet Print'}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Student Selector Toolbar */}
        <div className="py-2 px-4 bg-muted/30 rounded-md border flex items-center gap-4 my-2">
          <div className="w-72">
            <FormField label="Select Student to View/Print" htmlFor="select_student_print">
              <Select
                id="select_student_print"
                options={studentOptions}
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              />
            </FormField>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Showing <strong className="text-foreground">{activeStudents.length}</strong> card(s) ready for printing.
          </div>
        </div>

        {/* Printable Cards Loop Container */}
        <div className="space-y-6 p-4 bg-muted/20 rounded-lg flex flex-col items-center">
          {activeStudents.map((student) => (
            <div
              key={student.id}
              className="w-[700px] min-h-[440px] bg-white text-gray-900 border-2 border-primary/20 shadow-lg p-6 rounded-md relative flex flex-col justify-between print:break-after-page mb-4"
            >
              {/* Card School Header */}
              <div className="border-b-2 border-primary pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl border">
                    {template.school_name ? template.school_name.charAt(0) : 'S'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase text-primary tracking-wide">
                      {template.school_name || 'SPRINGFIELD INTERNATIONAL SCHOOL'}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      {template.heading || template.title || (isAdmitCard ? 'ADMIT CARD - 2025-2026' : 'PROGRESS REPORT CARD')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded bg-primary/10 text-primary border border-primary/20">
                    {template.exam_name || 'Annual Examination 2026'}
                  </span>
                </div>
              </div>

              {/* Student Details Section */}
              <div className="grid grid-cols-4 gap-4 items-start mb-4">
                {/* Photo Placeholder */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="w-28 h-32 border-2 border-dashed border-gray-300 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                    {'image' in student && student.image ? (
                      <img src={String(student.image)} alt={student.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground text-center px-1 font-semibold">PASSPORT PHOTO</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 font-mono">{student.admission_no}</span>
                </div>

                {/* DB Details */}
                <div className="col-span-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-gray-500 block text-[10px] uppercase">Student Name</span>
                    <span className="font-bold text-sm text-gray-900">{student.full_name}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 block text-[10px] uppercase">Roll No.</span>
                    <span className="font-semibold text-gray-900">{student.roll_no || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 block text-[10px] uppercase">Class & Section</span>
                    <span className="font-semibold text-gray-900">
                      {student.class_name ? `${student.class_name} - ${student.section_name || ''}` : 'Class 10 - A'}
                    </span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 block text-[10px] uppercase">Father's Name</span>
                    <span className="font-semibold text-gray-900">{'father_name' in student && student.father_name ? String(student.father_name) : '—'}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 block text-[10px] uppercase">Mother's Name</span>
                    <span className="font-semibold text-gray-900">{'mother_name' in student && student.mother_name ? String(student.mother_name) : '—'}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 block text-[10px] uppercase">Date of Birth</span>
                    <span className="font-semibold text-gray-900 font-mono">{'dob' in student && student.dob ? String(student.dob) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Exam Schedules Table or Results Table */}
              {isAdmitCard ? (
                <div className="my-2 border rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                      <tr>
                        <th className="p-1.5">Date</th>
                        <th className="p-1.5">Subject Paper</th>
                        <th className="p-1.5">Time</th>
                        <th className="p-1.5">Exam Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {schedules.length > 0 ? (
                        schedules.map((sch) => (
                          <tr key={sch.id}>
                            <td className="p-1.5">{sch.date_of_exam || '2026-03-25'}</td>
                            <td className="p-1.5 font-medium">{sch.subject_name || `Subject #${sch.subject_id}`}</td>
                            <td className="p-1.5 text-gray-500">{sch.time_from ? `${sch.time_from} - ${sch.time_to || ''}` : '09:00 AM - 12:00 PM'}</td>
                            <td className="p-1.5 text-gray-500">{sch.room_no || 'Hall A'}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr>
                            <td className="p-1.5">25-03-2026</td>
                            <td className="p-1.5 font-medium">Mathematics</td>
                            <td className="p-1.5 text-gray-500">09:00 AM - 12:00 PM</td>
                            <td className="p-1.5 text-gray-500">Hall A</td>
                          </tr>
                          <tr>
                            <td className="p-1.5">27-03-2026</td>
                            <td className="p-1.5 font-medium">Science</td>
                            <td className="p-1.5 text-gray-500">09:00 AM - 12:00 PM</td>
                            <td className="p-1.5 text-gray-500">Hall B</td>
                          </tr>
                          <tr>
                            <td className="p-1.5">30-03-2026</td>
                            <td className="p-1.5 font-medium">English Literature</td>
                            <td className="p-1.5 text-gray-500">09:00 AM - 12:00 PM</td>
                            <td className="p-1.5 text-gray-500">Hall A</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="my-2 border rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
                      <tr>
                        <th className="p-1.5">Subject</th>
                        <th className="p-1.5">Max Marks</th>
                        <th className="p-1.5">Obtained Marks</th>
                        <th className="p-1.5">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-1.5 font-medium">Mathematics</td>
                        <td className="p-1.5">100</td>
                        <td className="p-1.5 font-semibold text-emerald-700">92</td>
                        <td className="p-1.5 font-bold text-emerald-600">A+</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-medium">Science</td>
                        <td className="p-1.5">100</td>
                        <td className="p-1.5 font-semibold text-emerald-700">88</td>
                        <td className="p-1.5 font-bold text-emerald-600">A</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-medium">English</td>
                        <td className="p-1.5">100</td>
                        <td className="p-1.5 font-semibold text-emerald-700">85</td>
                        <td className="p-1.5 font-bold text-emerald-600">A</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures Footer */}
              <div className="pt-4 border-t border-gray-200 mt-2 flex justify-between items-end text-[10px] text-gray-600">
                <div className="text-center border-t border-gray-400 pt-1 w-28">
                  <span>Class Teacher</span>
                </div>
                <div className="text-center border-t border-gray-400 pt-1 w-28">
                  <span>Exam Controller</span>
                </div>
                <div className="text-center border-t border-gray-400 pt-1 w-28">
                  <span>Principal Sign</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 border-t pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print ({activeStudents.length}) Document(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
