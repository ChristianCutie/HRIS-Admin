import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  CheckCircle2,
  BookOpen,
  Clock,
  BarChart3,
  BookOpenCheck,
  Check,
  Pencil,
  X,
  Plus,
} from "lucide-react";
import { trainingAPI } from "../services/api";

export interface AssessmentRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  module_id: string;
  module_title: string;
  status: "completed" | "in-progress" | "not-started";
  score?: number;
  attempts: number;
  last_attempt?: string;
  reading?: boolean;
}

interface LessonData {
  id: number;
  lesson_title: string;
  lesson_description: string;
  modules_count: number;
  passing_rate: number;
  overall_completion_rate: number;
  completed_modules: number[];
}

type RecruitementAssessmentProps = {
  assessments?: AssessmentRecord[];
  loading?: boolean;
};

const RecruitementAssessment = ({
  assessments: propAssessments = [],
  loading: propLoading = false,
}: RecruitementAssessmentProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Employee Tracking State
  const [assessments, setAssessments] =
    useState<AssessmentRecord[]>(propAssessments);
  const [trackingLoading, setTrackingLoading] = useState(propLoading);

  // Overview State
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Edit Lesson State
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [fullLessonLoading, setFullLessonLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState<number>(0);
  const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);

  // Fetch lessons for overview
  useEffect(() => {
    const fetchLessons = async () => {
      setOverviewLoading(true);
      try {
        const response = await trainingAPI.getLessons();
        if (response.data.success && response.data.lessons) {
          setLessons(response.data.lessons);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setOverviewLoading(false);
      }
    };

    if (activeTab === "overview") {
      fetchLessons();
    }
  }, [activeTab]);

  // Fetch assessment tracking data
  useEffect(() => {
    const fetchAssessments = async () => {
      setTrackingLoading(true);
      try {
        const response = await trainingAPI.getAssessmentTracking();
        if (response.data.success && response.data.data) {
          const records = response.data.data.map(
            (record: any, index: number) => ({
              id: `${record.employee_id}-${record.module_id}-${index}`,
              employee_id: record.employee_id,
              employee_name: record.employee_name,
              module_id: record.module_id,
              module_title: record.module_title,
              status: record.status,
              score: record.score || undefined,
              attempts: record.attempts || 0,
              last_attempt: record.last_attempt || undefined,
              reading: true,
            }),
          );
          setAssessments(records);
        }
      } catch (error) {
        console.error("Error fetching assessment tracking:", error);
      } finally {
        setTrackingLoading(false);
      }
    };

    if (activeTab === "employee-tracking") {
      if (propAssessments.length === 0) {
        fetchAssessments();
      } else {
        setAssessments(propAssessments);
      }
    }
  }, [activeTab]);

  // Fetch full lesson with all modules and questions
  const fetchFullLesson = async (lessonId: number) => {
    setFullLessonLoading(true);
    try {
      const response = await trainingAPI.getLessonStructure(lessonId);
      if (response.data.success) {
        const fullLesson = response.data.lesson;
        setEditFormData(fullLesson);
        setEditingLesson(fullLesson);
        setSelectedModuleIndex(0);
        setEditModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching lesson:", error);
      alert("Failed to load lesson details");
    } finally {
      setFullLessonLoading(false);
    }
  };

  // Handle form changes for lesson data
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle module field changes
  const handleModuleChange = (
    moduleIndex: number,
    field: string,
    value: any,
  ) => {
    setEditFormData((prev: any) => {
      const updatedModules = [...(prev.modules || [])];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        [field]: value,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Add new module
  const handleAddModule = () => {
    setEditFormData((prev: any) => ({
      ...prev,
      modules: [
        ...(prev.modules || []),
        {
          id: Date.now(),
          title: "",
          description: "",
          questions: [],
        },
      ],
    }));
  };

  // Remove module
  const handleRemoveModule = (moduleIndex: number) => {
    setEditFormData((prev: any) => ({
      ...prev,
      modules: prev.modules.filter(
        (_: any, idx: number) => idx !== moduleIndex,
      ),
    }));
  };

  // Handle question field changes
  const handleQuestionChange = (
    moduleIndex: number,
    questionIndex: number,
    field: string,
    value: any,
  ) => {
    setEditFormData((prev: any) => {
      const updatedModules = [...(prev.modules || [])];
      const updatedQuestions = [
        ...(updatedModules[moduleIndex].questions || []),
      ];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value,
      };
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        questions: updatedQuestions,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Add new question to module
  const handleAddQuestion = (moduleIndex: number) => {
    setEditFormData((prev: any) => {
      const updatedModules = [...(prev.modules || [])];
      const updatedQuestions = [
        ...(updatedModules[moduleIndex].questions || []),
      ];
      updatedQuestions.push({
        id: Date.now(),
        question: "",
        choices: [],
      });
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        questions: updatedQuestions,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Remove question
  const handleRemoveQuestion = (moduleIndex: number, questionIndex: number) => {
    setEditFormData((prev: any) => {
      const updatedModules = [...(prev.modules || [])];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        questions: updatedModules[moduleIndex].questions.filter(
          (_: any, idx: number) => idx !== questionIndex,
        ),
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Handle choice field changes
  const handleChoiceChange = (
    moduleIndex: number,
    questionIndex: number,
    choiceIndex: number,
    field: string,
    value: any,
  ) => {
    setEditFormData((prev: any) => {
      const updatedModules = [...(prev.modules || [])];
      const updatedQuestions = [
        ...(updatedModules[moduleIndex].questions || []),
      ];
      const updatedChoices = [
        ...(updatedQuestions[questionIndex].choices || []),
      ];
      updatedChoices[choiceIndex] = {
        ...updatedChoices[choiceIndex],
        [field]: value,
      };
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        choices: updatedChoices,
      };
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        questions: updatedQuestions,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Add new choice to question
  const handleAddChoice = (moduleIndex: number, questionIndex: number) => {
    setEditFormData((prev: any) => {
      const updatedModules = [...(prev.modules || [])];
      const updatedQuestions = [
        ...(updatedModules[moduleIndex].questions || []),
      ];
      const updatedChoices = [
        ...(updatedQuestions[questionIndex].choices || []),
      ];
      updatedChoices.push({
        id: Date.now(),
        choice_text: "",
        is_correct: false,
      });
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        choices: updatedChoices,
      };
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        questions: updatedQuestions,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Remove choice
  const handleRemoveChoice = (
    moduleIndex: number,
    questionIndex: number,
    choiceIndex: number,
  ) => {
    setEditFormData((prev: any) => {
      const updatedModules = [...(prev.modules || [])];
      const updatedQuestions = [
        ...(updatedModules[moduleIndex].questions || []),
      ];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        choices: updatedQuestions[questionIndex].choices.filter(
          (_: any, idx: number) => idx !== choiceIndex,
        ),
      };
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        questions: updatedQuestions,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  // Submit edited lesson
  const handleSaveLesson = async () => {
    if (!editingLesson || !editFormData) return;

    if (!editFormData.lesson_title?.trim()) {
      alert("Lesson title is required");
      return;
    }

    if (!editFormData.modules || editFormData.modules.length === 0) {
      alert("At least one module is required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await trainingAPI.updateFullLesson(editingLesson.id, {
        lesson_title: editFormData.lesson_title,
        lesson_description: editFormData.lesson_description,
        modules: editFormData.modules.map((module: any) => ({
          id:
            typeof module.id === "number" && module.id > 1000000
              ? undefined
              : module.id,
          title: module.title || module.module_title,
          description: module.description || module.module_description,
          questions: (module.questions || []).map((question: any) => ({
            id:
              typeof question.id === "number" && question.id > 1000000
                ? undefined
                : question.id,
            question: question.question || question.question_text,
            choices: (question.choices || []).map((choice: any) => ({
              id:
                typeof choice.id === "number" && choice.id > 1000000
                  ? undefined
                  : choice.id,
              choice_text: choice.choice_text,
              is_correct:
                typeof choice.is_correct === "boolean"
                  ? choice.is_correct
                    ? 1
                    : 0
                  : choice.is_correct,
            })),
          })),
        })),
      });

      if (response.data.success) {
        alert("Lesson updated successfully!");
        setEditModalOpen(false);
        setEditFormData(null);
        setEditingLesson(null);
        // Refresh lessons list
        const refreshResponse = await trainingAPI.getLessons();
        if (refreshResponse.data.success && refreshResponse.data.lessons) {
          setLessons(refreshResponse.data.lessons);
        }
      } else {
        alert(response.data.message || "Failed to update lesson");
      }
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      alert(error.response?.data?.message || "Failed to save lesson");
    } finally {
      setSubmitting(false);
    }
  };

  // Overview Stats
  const overviewStats = {
    totalModules: lessons.length,
    completedCount: lessons.filter((l) => l.overall_completion_rate === 100)
      .length,
    avgCompletion:
      lessons.length > 0
        ? Math.round(
            lessons.reduce((sum, l) => sum + l.overall_completion_rate, 0) /
              lessons.length,
          )
        : 0,
    newEmployees: 4,
  };

  // Employee Tracking Stats
  const trackingStats = {
    completed: assessments.filter((a) => a.status === "completed").length,
    inProgress: assessments.filter((a) => a.status === "in-progress").length,
    notStarted: assessments.filter((a) => a.status === "not-started").length,
    avgScore:
      assessments.length > 0
        ? Math.round(
            assessments.reduce((sum, a) => sum + (a.score || 0), 0) /
              assessments.length,
          )
        : 0,
  };

  const filteredAssessments = assessments.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.employee_name.toLowerCase().includes(q) ||
      a.module_title.toLowerCase().includes(q)
    );
  });

  const handleViewDetails = (assessment: AssessmentRecord) => {
    setSelectedAssessment(assessment);
    setIsModalOpen(true);
  };

  const getModuleBadgeColor = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("company")) return "bg-blue-100 text-blue-800";
    if (titleLower.includes("safety")) return "bg-red-100 text-red-800";
    if (titleLower.includes("compliance"))
      return "bg-purple-100 text-purple-800";
    if (titleLower.includes("privacy")) return "bg-indigo-100 text-indigo-800";
    if (titleLower.includes("harassment")) return "bg-pink-100 text-pink-800";
    return "bg-gray-100 text-gray-800";
  };

  const getModuleCategory = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("company")) return "company";
    if (titleLower.includes("safety")) return "safety";
    if (titleLower.includes("compliance")) return "compliance";
    if (titleLower.includes("privacy")) return "privacy";
    if (titleLower.includes("harassment")) return "hr";
    return "general";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            in-progress
          </Badge>
        );
      case "not-started":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            not-started
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Assessment Tracking</h2>
        <p className="text-muted-foreground">
          Monitor employee training progress
        </p>
      </div>

      {/* TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="employee-tracking"
            className="flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Employee Tracking
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Modules
                    </p>
                    <p className="text-2xl font-bold">
                      {overviewStats.totalModules}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available training modules
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      New Employees
                    </p>
                    <p className="text-2xl font-bold">
                      {overviewStats.newEmployees}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      In onboarding
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">
                      {overviewStats.completedCount}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Assessments passed
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Completion
                    </p>
                    <p className="text-2xl font-bold">
                      {overviewStats.avgCompletion}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Overall progress
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Training Modules Overview */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">
                Training Modules Overview
              </h3>
              <p className="text-sm text-muted-foreground">
                Policy and compliance training modules for new employees
              </p>
            </div>

            <div className="space-y-4">
              {overviewLoading ? (
                <Card>
                  <CardContent className="p-4 text-center">
                    Loading modules...
                  </CardContent>
                </Card>
              ) : lessons.length === 0 ? (
                <Card>
                  <CardContent className="p-4 text-center text-muted-foreground">
                    No training modules found.
                  </CardContent>
                </Card>
              ) : (
                lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">
                              {lesson.lesson_title}
                            </h4>
                            <Badge
                              className={getModuleBadgeColor(
                                lesson.lesson_title,
                              )}
                            >
                              {getModuleCategory(lesson.lesson_title)}
                            </Badge>
                            {lesson.passing_rate > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                Mandatory
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {lesson.lesson_description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <BookOpenCheck className="w-3 h-3 mr-1" />{" "}
                              {lesson.modules_count} modules
                            </span>
                            <span className="flex items-center">
                              <Check className="w-3 h-3 mr-1" /> Passing{" "}
                              {lesson.passing_rate || 0}%
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-right mb-3">
                            <p className="text-sm font-semibold">
                              {lesson.overall_completion_rate}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.completed_modules.length}/
                              {lesson.modules_count} completed
                            </p>
                          </div>
                          <Progress
                            value={lesson.overall_completion_rate}
                            className="h-2 w-48 mb-3"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => fetchFullLesson(lesson.id)}
                              className="flex items-center gap-1"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* EMPLOYEE TRACKING TAB */}
        <TabsContent value="employee-tracking" className="space-y-6 mt-6">
          {/* Header with Search */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Assessment Tracking</h2>
              <p className="text-muted-foreground">
                Monitor employee training progress
              </p>
            </div>
            <Input
              placeholder="Search employee or module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{trackingStats.completed}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{trackingStats.inProgress}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Not Started</p>
                <p className="text-2xl font-bold">{trackingStats.notStarted}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{trackingStats.avgScore}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Assessment Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reading</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {trackingLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredAssessments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No assessments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssessments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">
                          {a.employee_name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{a.module_title}</p>
                            <Badge
                              className={getModuleBadgeColor(a.module_title)}
                            >
                              {getModuleCategory(a.module_title)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(a.status)}</TableCell>
                        <TableCell>
                          {a.reading ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                          )}
                        </TableCell>
                        <TableCell>
                          {a.score !== undefined ? `${a.score}%` : "-"}
                        </TableCell>
                        <TableCell>{a.attempts}</TableCell>
                        <TableCell>
                          {a.last_attempt ? a.last_attempt.split("T")[0] : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDetails(a)}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DETAIL MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assessment Details</DialogTitle>
          </DialogHeader>
          {selectedAssessment && (
            <div className="space-y-4">
              {/* Assessment Status */}
              {selectedAssessment.status === "completed" &&
              selectedAssessment.score &&
              selectedAssessment.score >= 80 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="font-semibold text-green-700 mb-2">
                    Assessment Passed!
                  </p>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    {selectedAssessment.score}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Passing score: 80%
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-semibold">
                    Status: {selectedAssessment.status}
                  </p>
                  {selectedAssessment.score && (
                    <p className="text-2xl font-bold">
                      {selectedAssessment.score}%
                    </p>
                  )}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-2 border-t pt-4">
                <p>
                  <strong>Employee:</strong> {selectedAssessment.employee_name}
                </p>
                <p>
                  <strong>Module:</strong> {selectedAssessment.module_title}
                </p>
              </div>

              {/* Attempt Info */}
              <div className="space-y-2 border-t pt-4">
                <p>
                  <strong>Total Attempts:</strong> {selectedAssessment.attempts}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600 font-medium">
                    {selectedAssessment.status}
                  </span>
                </p>
              </div>

              {/* Certificate */}
              {selectedAssessment.status === "completed" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Certificate Issued
                  </span>
                </div>
              )}

              {/* Attempt History */}
              <div className="border-t pt-4">
                <p className="font-semibold mb-3">Attempt History</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <p className="text-sm font-medium">
                        Attempt {selectedAssessment.attempts}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedAssessment.last_attempt?.split("T")[0]}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {selectedAssessment.score}%
                      </p>
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* EDIT LESSON MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
       <DialogContent className="w-3/5 !max-w-none max-h-screen overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>

          {fullLessonLoading ? (
            <div className="flex items-center justify-center py-8">
              <p>Loading lesson details...</p>
            </div>
          ) : editFormData ? (
            <Tabs
              defaultValue="lesson"
              className="flex-1 overflow-hidden flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lesson">Lesson Info</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
              </TabsList>

              {/* TAB 1: LESSON INFO */}
              <TabsContent
                value="lesson"
                className="flex-1 overflow-y-auto space-y-4 py-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lesson Title *
                    </label>
                    <Input
                      value={editFormData.lesson_title || ""}
                      onChange={(e) =>
                        handleEditFormChange("lesson_title", e.target.value)
                      }
                      placeholder="Enter lesson title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lesson Description
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editFormData.lesson_description || ""}
                      onChange={(e) =>
                        handleEditFormChange(
                          "lesson_description",
                          e.target.value,
                        )
                      }
                      placeholder="Enter lesson description"
                      rows={5}
                    />
                  </div>

                  <Button
                    onClick={handleSaveLesson}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? "Saving..." : "Save Lesson"}
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 2: MODULES */}
              <TabsContent
                value="modules"
                className="flex-1 overflow-y-auto space-y-4 py-4"
              >
                <div className="space-y-4">
                  {editFormData.modules && editFormData.modules.length > 0 ? (
                    <div className="space-y-3">
                      {editFormData.modules.map(
                        (module: any, moduleIndex: number) => (
                          <div
                            key={moduleIndex}
                            className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-blue-50 transition"
                          >
                            {editingModuleIndex === moduleIndex ? (
                              // EDIT MODE
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Module Title *</label>
                                  <input
                                    type="text"
                                    value={module.title || module.module_title || ''}
                                    onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                                    placeholder="Enter module title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">Module Description</label>
                                  <textarea
                                    value={module.description || module.module_description || ''}
                                    onChange={(e) => handleModuleChange(moduleIndex, 'description', e.target.value)}
                                    placeholder="Enter module description"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingModuleIndex(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                      if (!module.title?.trim()) {
                                        alert('Module title is required');
                                        return;
                                      }
                                      setEditingModuleIndex(null);
                                    }}
                                  >
                                    Save Module
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // VIEW MODE
                              <div
                                className="cursor-pointer"
                                onClick={() => setSelectedModuleIndex(moduleIndex)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {module.title ||
                                        module.module_title ||
                                        "(Untitled Module)"}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {module.description ||
                                        module.module_description ||
                                        "No description"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      {module.questions?.length || 0} question
                                      {(module.questions?.length || 0) !== 1
                                        ? "s"
                                        : ""}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingModuleIndex(moduleIndex);
                                      }}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveModule(moduleIndex);
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No modules yet
                    </p>
                  )}

                  <Button
                    onClick={handleAddModule}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Module
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 3: QUESTIONS */}
              <TabsContent
                value="questions"
                className="flex-1 overflow-y-auto space-y-4 py-4"
              >
                <div className="space-y-4">
                  {editFormData.modules && editFormData.modules.length > 0 ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Select Module
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedModuleIndex}
                          onChange={(e) =>
                            setSelectedModuleIndex(Number(e.target.value))
                          }
                        >
                          {editFormData.modules.map(
                            (module: any, idx: number) => (
                              <option key={idx} value={idx}>
                                {module.title ||
                                  module.module_title ||
                                  `Module ${idx + 1}`}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      {editFormData.modules[selectedModuleIndex] && (
                        <>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-900">
                              Module:{" "}
                              {editFormData.modules[selectedModuleIndex]
                                .title ||
                                editFormData.modules[selectedModuleIndex]
                                  .module_title ||
                                "(Untitled)"}
                            </p>
                          </div>

                          {editFormData.modules[selectedModuleIndex]
                            .questions &&
                          editFormData.modules[selectedModuleIndex].questions
                            .length > 0 ? (
                            <div className="space-y-3">
                              {editFormData.modules[
                                selectedModuleIndex
                              ].questions.map(
                                (question: any, questionIndex: number) => (
                                  <div
                                    key={questionIndex}
                                    className="border border-gray-200 rounded-lg p-4 bg-white"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <input
                                          type="text"
                                          value={
                                            question.question ||
                                            question.question_text ||
                                            ""
                                          }
                                          onChange={(e) =>
                                            handleQuestionChange(
                                              selectedModuleIndex,
                                              questionIndex,
                                              "question",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="Enter question"
                                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          handleRemoveQuestion(
                                            selectedModuleIndex,
                                            questionIndex,
                                          )
                                        }
                                        className="ml-2"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>

                                    {/* ANSWER CHOICES */}
                                    <div className="border-t pt-3 mt-3">
                                      <label className="text-xs font-medium">
                                        Answer Choices
                                      </label>
                                      <div className="space-y-2 mt-2">
                                        {question.choices &&
                                        question.choices.length > 0 ? (
                                          question.choices.map(
                                            (
                                              choice: any,
                                              choiceIndex: number,
                                            ) => (
                                              <div
                                                key={choiceIndex}
                                                className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                                              >
                                                <input
                                                  type="text"
                                                  value={
                                                    choice.choice_text || ""
                                                  }
                                                  onChange={(e) =>
                                                    handleChoiceChange(
                                                      selectedModuleIndex,
                                                      questionIndex,
                                                      choiceIndex,
                                                      "choice_text",
                                                      e.target.value,
                                                    )
                                                  }
                                                  placeholder="Choice text"
                                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <label className="flex items-center cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={
                                                      choice.is_correct || false
                                                    }
                                                    onChange={(e) =>
                                                      handleChoiceChange(
                                                        selectedModuleIndex,
                                                        questionIndex,
                                                        choiceIndex,
                                                        "is_correct",
                                                        e.target.checked,
                                                      )
                                                    }
                                                    className="w-4 h-4"
                                                  />
                                                  <span className="ml-1 text-xs">
                                                    Correct
                                                  </span>
                                                </label>
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() =>
                                                    handleRemoveChoice(
                                                      selectedModuleIndex,
                                                      questionIndex,
                                                      choiceIndex,
                                                    )
                                                  }
                                                >
                                                  <X className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            ),
                                          )
                                        ) : (
                                          <p className="text-xs text-gray-500">
                                            No choices yet
                                          </p>
                                        )}
                                      </div>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleAddChoice(
                                            selectedModuleIndex,
                                            questionIndex,
                                          )
                                        }
                                        className="mt-2 w-full"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Choice
                                      </Button>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-8">
                              No questions in this module yet
                            </p>
                          )}

                          <Button
                            onClick={() =>
                              handleAddQuestion(selectedModuleIndex)
                            }
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Question
                          </Button>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Create modules first to add questions
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : null}

          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruitementAssessment;
