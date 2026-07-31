import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Select } from '@components/ui/select';
import { FormField } from '@components/forms/FormField';
import { Printer, ShieldCheck } from 'lucide-react';
import type { StudentListItem } from '@app-types/students/student';
import type { MarksheetTemplate, AdmitCardTemplate } from '@app-types/examinations/exam-templates';
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

  const effectiveStudents =
    students.length > 0
      ? students
      : [
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
          },
        ];

  // Filter students based on dropdown selection
  const filteredStudents =
    selectedStudentId === 'all'
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
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="flex items-center justify-between pr-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>
                {isAdmitCard
                  ? 'Bulk / Individual Student Admit Card Print'
                  : 'Bulk / Individual Student Marksheet Print'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Student Selector Toolbar */}
        <div className="my-2 flex items-center gap-4 rounded-md border bg-muted/30 px-4 py-2">
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
          <div className="mt-4 text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{activeStudents.length}</strong> card(s)
            ready for printing.
          </div>
        </div>

        {/* Printable Cards Loop Container */}
        <div className="flex flex-col items-center space-y-6 rounded-lg bg-muted/20 p-4">
          {activeStudents.map((student) => (
            <div
              key={student.id}
              className="relative mb-4 flex min-h-[440px] w-[700px] flex-col justify-between rounded-md border-2 border-primary/20 bg-white p-6 text-gray-900 shadow-lg print:break-after-page"
            >
              {/* Card School Header */}
              <div className="mb-4 flex items-center justify-between border-b-2 border-primary pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-primary/10 text-xl font-bold text-primary">
                    {template.school_name ? template.school_name.charAt(0) : 'S'}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wide text-primary">
                      {template.school_name || 'SPRINGFIELD INTERNATIONAL SCHOOL'}
                    </h2>
                    <p className="text-xs font-medium text-muted-foreground">
                      {template.heading ||
                        template.title ||
                        (isAdmitCard ? 'ADMIT CARD - 2025-2026' : 'PROGRESS REPORT CARD')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {template.exam_name || 'Annual Examination 2026'}
                  </span>
                </div>
              </div>

              {/* Student Details Section */}
              <div className="mb-4 grid grid-cols-4 items-start gap-4">
                {/* Photo Placeholder */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="flex h-32 w-28 items-center justify-center overflow-hidden rounded border-2 border-dashed border-gray-300 bg-gray-50">
                    {'image' in student && student.image ? (
                      <img
                        src={String(student.image)}
                        alt={student.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-1 text-center text-[10px] font-semibold text-muted-foreground">
                        PASSPORT PHOTO
                      </span>
                    )}
                  </div>
                  <span className="mt-1 font-mono text-[10px] text-gray-500">
                    {student.admission_no}
                  </span>
                </div>

                {/* DB Details */}
                <div className="col-span-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-gray-500">
                      Student Name
                    </span>
                    <span className="text-sm font-bold text-gray-900">{student.full_name}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-gray-500">
                      Roll No.
                    </span>
                    <span className="font-semibold text-gray-900">{student.roll_no || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-gray-500">
                      Class & Section
                    </span>
                    <span className="font-semibold text-gray-900">
                      {student.class_name
                        ? `${student.class_name} - ${student.section_name || ''}`
                        : 'Class 10 - A'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-gray-500">
                      Father's Name
                    </span>
                    <span className="font-semibold text-gray-900">
                      {'father_name' in student && student.father_name
                        ? String(student.father_name)
                        : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-gray-500">
                      Mother's Name
                    </span>
                    <span className="font-semibold text-gray-900">
                      {'mother_name' in student && student.mother_name
                        ? String(student.mother_name)
                        : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase text-gray-500">
                      Date of Birth
                    </span>
                    <span className="font-mono font-semibold text-gray-900">
                      {'dob' in student && student.dob ? String(student.dob) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Exam Schedules Table or Results Table */}
              {isAdmitCard ? (
                <div className="my-2 overflow-hidden rounded border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-gray-100 font-semibold text-gray-700">
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
                            <td className="p-1.5 font-medium">
                              {sch.subject_name || `Subject #${sch.subject_id}`}
                            </td>
                            <td className="p-1.5 text-gray-500">
                              {sch.start_time
                                ? `${sch.start_time} - ${sch.end_time || ''}`
                                : '09:00 AM - 12:00 PM'}
                            </td>
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
                <div className="my-2 overflow-hidden rounded border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-gray-100 font-semibold text-gray-700">
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
              <div className="mt-2 flex items-end justify-between border-t border-gray-200 pt-4 text-[10px] text-gray-600">
                <div className="w-28 border-t border-gray-400 pt-1 text-center">
                  <span>Class Teacher</span>
                </div>
                <div className="w-28 border-t border-gray-400 pt-1 text-center">
                  <span>Exam Controller</span>
                </div>
                <div className="w-28 border-t border-gray-400 pt-1 text-center">
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
