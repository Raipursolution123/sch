import { useMemo } from 'react';
import { useAssignedIncidents } from '@hooks/useBehaviour';
import { ModuleListPack } from '@workflow-packs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { DataTable, type DataTableColumn } from '@components/data/DataTable';
import { Award, Users, AlertCircle, TrendingUp } from 'lucide-react';

interface StudentRankItem {
  rank: number;
  name: string;
  class: string;
  points: number;
  count: number;
}

interface ClassRankItem {
  rank: number;
  class_name: string;
  points: number;
  count: number;
}

interface IncidentStatItem {
  title: string;
  points: number;
  count: number;
}

export function IncidentReportsPage() {
  const { data: assigned = [], isLoading, isError, error, refetch } = useAssignedIncidents();

  // Aggregate metrics
  const totalIncidents = assigned.length;
  const positiveIncidents = assigned.filter((a) => a.incident_point > 0).length;
  const negativeIncidents = assigned.filter((a) => a.incident_point < 0).length;
  const totalPoints = assigned.reduce((acc, curr) => acc + curr.incident_point, 0);

  // Student Leaderboard (rank report)
  const studentRank = useMemo<StudentRankItem[]>(() => {
    const map: Record<string, { name: string; class: string; points: number; count: number }> = {};
    assigned.forEach((a) => {
      if (!map[a.student_id]) {
        map[a.student_id] = { name: a.student_name, class: `${a.class_name} (${a.section_name})`, points: 0, count: 0 };
      }
      map[a.student_id].points += a.incident_point;
      map[a.student_id].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.points - a.points)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [assigned]);

  // Class Leaderboard
  const classRank = useMemo<ClassRankItem[]>(() => {
    const map: Record<string, { class_name: string; points: number; count: number }> = {};
    assigned.forEach((a) => {
      if (!map[a.class_name]) {
        map[a.class_name] = { class_name: a.class_name, points: 0, count: 0 };
      }
      map[a.class_name].points += a.incident_point;
      map[a.class_name].count += 1;
    });
    return Object.values(map)
      .sort((a, b) => b.points - a.points)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [assigned]);

  // Incident statistics
  const incidentStats = useMemo<IncidentStatItem[]>(() => {
    const map: Record<string, { title: string; points: number; count: number }> = {};
    assigned.forEach((a) => {
      if (!map[a.incident_title]) {
        map[a.incident_title] = { title: a.incident_title, points: a.incident_point, count: 0 };
      }
      map[a.incident_title].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [assigned]);

  const studentColumns: DataTableColumn<StudentRankItem>[] = [
    { id: 'rank', header: 'Rank', cell: (row) => row.rank },
    { id: 'name', header: 'Student Name', cell: (row) => row.name },
    { id: 'class', header: 'Class', cell: (row) => row.class },
    {
      id: 'points',
      header: 'Behavior Points',
      cell: (row) => (
        <span className={row.points < 0 ? 'text-destructive font-semibold' : 'text-success font-semibold'}>
          {row.points}
        </span>
      ),
    },
    { id: 'count', header: 'Total Incidents', cell: (row) => row.count },
  ];

  const classColumns: DataTableColumn<ClassRankItem>[] = [
    { id: 'rank', header: 'Rank', cell: (row) => row.rank },
    { id: 'class_name', header: 'Class Name', cell: (row) => row.class_name },
    {
      id: 'points',
      header: 'Total Points',
      cell: (row) => (
        <span className={row.points < 0 ? 'text-destructive font-semibold' : 'text-success font-semibold'}>
          {row.points}
        </span>
      ),
    },
    { id: 'count', header: 'Incidents Logged', cell: (row) => row.count },
  ];

  const incidentColumns: DataTableColumn<IncidentStatItem>[] = [
    { id: 'title', header: 'Incident Title', cell: (row) => row.title },
    {
      id: 'points',
      header: 'Single Point Value',
      cell: (row) => (
        <span className={row.points < 0 ? 'text-destructive font-semibold' : 'text-success font-semibold'}>
          {row.points}
        </span>
      ),
    },
    { id: 'count', header: 'Frequency', cell: (row) => row.count },
  ];

  return (
    <ModuleListPack
      title="Behaviour Reports"
      description="Track behavior ranks and frequencies."
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => void refetch()}
    >
      {/* Top Cards Section */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm border-l-4 border-l-primary">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Logs</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalIncidents}</div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm border-l-4 border-l-success">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Positive Behavior</span>
            <Award className="h-4 w-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-success">{positiveIncidents}</div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm border-l-4 border-l-destructive">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Negative Behavior</span>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive">{negativeIncidents}</div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm border-l-4 border-l-info">
          <div className="flex flex-row items-center justify-between pb-2">
            <span className="text-sm font-medium text-muted-foreground">Net Points Balance</span>
            <TrendingUp className="h-4 w-4 text-info" />
          </div>
          <div className={`text-2xl font-bold ${totalPoints < 0 ? 'text-destructive' : 'text-success'}`}>
            {totalPoints}
          </div>
        </div>
      </div>

      {/* Ranks Tabs */}
      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">Student Leaderboard</TabsTrigger>
          <TabsTrigger value="classes">Class Ranks</TabsTrigger>
          <TabsTrigger value="incidents">Incident Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <DataTable data={studentRank} columns={studentColumns} getRowKey={(r) => r.name} />
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <DataTable data={classRank} columns={classColumns} getRowKey={(r) => r.class_name} />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <DataTable data={incidentStats} columns={incidentColumns} getRowKey={(r) => r.title} />
        </TabsContent>
      </Tabs>
    </ModuleListPack>
  );
}
