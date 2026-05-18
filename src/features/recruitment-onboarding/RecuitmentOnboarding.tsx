import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RecruitmentOverview from "./tabs/RecruitmentOverview";
import RecruitmentPipeline from "./tabs/RecruitmentPipeline";
import RecruitmentInterviews from "./tabs/RecruitmentInterviews";
import RecruitementAssessment from "./tabs/RecruitementAssessment";
import RecruitmentHired from "./tabs/RecruitmentHired";
import InterviewDialog from "./components/InterviewDialog";
import CandidateDialog from "./components/CandidateDialog";
import { useRecruitmentData } from "./hooks/useRecruitmentData";
import { useRecruitmentDialogs } from "./hooks/useRecruitmentDialog";
import { useRecruitmentActions } from "./hooks/useRecruitmentAction";
import { useInterviewers } from "./hooks/useInterviewers";
import { useDepartments } from "./hooks/useDepartments";
import { usePositions } from "./hooks/usePositions";
import { useEmployees } from "./hooks/useEmployees";
import { toast } from "sonner";
import axios from "axios";
const RecruitmentOnboarding = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const {
    applicants,
    interviews,
    hiredEmployees,
    loading,
    searchTerm,
    setSearchTerm,
    fetchApplicants,
    fetchHiredApplicants,
    fetchInterviews,
  } = useRecruitmentData(activeTab);

  const {
    setShowJobDialog,
    showInterviewDialog,
    setShowInterviewDialog,
    showCandidateDialog,
    setShowCandidateDialog,
    selectedCandidate,
    setSelectedCandidate,
    newInterview,
    setNewInterview,
  } = useRecruitmentDialogs();

  const {
    moveCandidateToStage,
    scheduleInterview,
    updateInterviewStatus,
    submitInterviewFeedback,
    loading: actionsLoading,
  } = useRecruitmentActions({
    fetchApplicants,
    fetchHiredApplicants,
    fetchInterviews,
  });

  // Get interviewers data
  const { interviewers, loading: interviewersLoading } = useInterviewers();

  // Get departments, positions, and employees for hire form
  const { departments, loading: departmentsLoading } = useDepartments();
  const { positions, loading: positionsLoading } = usePositions();
  const { employees: managers, loading: managersLoading } =
    useEmployees("manager");
  const { employees: supervisors, loading: supervisorsLoading } =
    useEmployees("supervisor");
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const API_BASE_URL = "https://api-hris.slarenasitsolutions.com/public/api";
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  // Handler for opening candidate detail
  const handleOpenCandidateDetail = (candidate: any) => {
    setSelectedCandidate(candidate);
    setShowCandidateDialog(true);
  };

  const fetchLessons = async () => {
    setLessonsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/training/lessons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }); // your backend endpoint
      
      console.log("Lessons API Response:", res.data);
      
      // Handle different response structures
      let lessonsData = [];
      if (res.data.success && res.data.lessons) {
        lessonsData = res.data.lessons;
      } else if (Array.isArray(res.data)) {
        lessonsData = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        lessonsData = res.data.data;
      }
      
      console.log("Processed lessons:", lessonsData);
      setLessons(lessonsData);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Failed to load lessons");
    } finally {
      setLessonsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Handler for opening interview dialog with candidate
  const handleOpenInterviewDialog = (candidate: any) => {
    setSelectedCandidate(candidate);
    setNewInterview({
      ...newInterview,
      candidateId: candidate.id,
      candidateName: candidate.name,
      position: candidate.position,
      interviewer: "",
      type: "Technical",
      date: "",
      time: "",
      status: "scheduled",
      location: "",
      meetingLink: "",
      notes: "",
    });
    setShowInterviewDialog(true);
  };

  // Handler for scheduling interview
  const handleScheduleInterview = async (interviewData: any) => {
    const success = await scheduleInterview(interviewData);
    if (success) {
      setShowInterviewDialog(false);
      setNewInterview({
        candidateId: "",
        candidateName: "",
        position: "",
        interviewer: "",
        type: "Technical",
        date: "",
        time: "",
        status: "scheduled",
        location: "",
        meetingLink: "",
        notes: "",
      });
    }
    return success;
  };

  // Handler for moving candidate stage
  const handleMoveCandidateStage = async (
    candidateId: string,
    stage: string,
  ) => {
    return await moveCandidateToStage(candidateId, stage);
  };

  // Handler for hiring candidate (for RecruitmentPipeline - opens dialog)
  const handleHireCandidate = async (candidateId: string) => {
    // Find the candidate and open the dialog for detailed hiring
    const candidate = applicants.find((app: any) => app.id === candidateId);
    if (candidate) {
      setSelectedCandidate(candidate);
      setShowCandidateDialog(true);
    }
    return true;
  };

  // Handler for hiring candidate with data (for CandidateDialog)
  const handleHireCandidateWithData = async (
    candidateId: string,
    hireData: any,
  ) => {
    try {
      // Format the data for your API
      const formattedData = {
        ...hireData,
        base_salary: parseFloat(hireData.base_salary),
        // Add any other formatting needed for your API
      };

      // Call your API directly here since hireApplicant only takes candidateId
      const response = await api.post(
        `/applicants/${candidateId}/hire`,
        {
          candidate_id: candidateId,
          ...formattedData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.isSuccess) {
        // Refresh the data
        toast.success("HIRED SUCCESSFULLY");
        await fetchApplicants();
        await fetchHiredApplicants();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error hiring candidate:", error);
      return false;
    }
  };

  // Combined loading state
  const isLoading =
    loading ||
    actionsLoading ||
    interviewersLoading ||
    departmentsLoading ||
    positionsLoading ||
    managersLoading ||
    supervisorsLoading ||
    lessonsLoading;

  // Debug: Log all applicants and filter info
  console.log('All applicants:', applicants);
  console.log('Applicants with assessment stage:', applicants.filter((a: any) => a.stage === "assessment"));
  console.log('Lessons loaded:', lessons.length, lessons);

  // NOTE: Assessment data is now fetched directly in the RecruitementAssessment component
  // from the /assessments/tracking endpoint

  return (
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Recruitment</h1>
            <p className="text-muted-foreground">Manage your hiring process</p>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Candidates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
          <TabsTrigger value="hired">Hired</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <RecruitmentOverview
            applicants={applicants}
            interviews={interviews}
            loading={isLoading}
            onOpenCandidateDetail={handleOpenCandidateDetail}
            onShowJobDialog={setShowJobDialog}
            onShowInterviewDialog={() => setShowInterviewDialog(true)}
            onSetActiveTab={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <RecruitmentPipeline
            applicants={applicants}
            loading={isLoading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchApplicants}
            onOpenCandidateDetail={handleOpenCandidateDetail}
            onMoveCandidateStage={handleMoveCandidateStage}
            onHireCandidate={handleHireCandidate}
            onScheduleInterview={handleScheduleInterview}
            onOpenInterviewDialog={handleOpenInterviewDialog}
            interviewers={interviewers}
          />
        </TabsContent>

        <TabsContent value="interviews" className="mt-6">
          <RecruitmentInterviews
            interviews={interviews}
            candidates={applicants}
            onShowInterviewDialog={() => setShowInterviewDialog(true)}
            onUpdateInterviewStatus={updateInterviewStatus}
            onSubmitInterviewFeedback={submitInterviewFeedback}
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="hired" className="mt-6">
          <RecruitmentHired
            hiredEmployees={hiredEmployees}
            onSearchChange={setSearchTerm}
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="assessments" className="mt-6">
          <RecruitementAssessment />
        </TabsContent>
      </Tabs>

      {/* Interview Dialog */}
      <InterviewDialog
        open={showInterviewDialog}
        onOpenChange={setShowInterviewDialog}
        newInterview={newInterview}
        onNewInterviewChange={setNewInterview}
        candidates={applicants}
        onScheduleInterview={handleScheduleInterview}
        loading={isLoading}
        interviewers={interviewers}
      />

      {/* Candidate Detail Dialog - UPDATED with hire functionality */}
      <CandidateDialog
        open={showCandidateDialog}
        onOpenChange={setShowCandidateDialog}
        candidate={selectedCandidate}
        onMoveCandidateStage={handleMoveCandidateStage}
        onScheduleInterview={() => {
          setShowCandidateDialog(false);
          if (selectedCandidate) {
            setNewInterview({
              ...newInterview,
              candidateId: selectedCandidate.id,
              candidateName: selectedCandidate.name,
              position: selectedCandidate.position,
              status: "scheduled",
            });
          }
          setShowInterviewDialog(true);
        }}
        onHireCandidate={handleHireCandidateWithData}
        departments={departments}
        positions={positions}
        managers={managers}
        supervisors={supervisors}
      />
    </div>
  );
};

export default RecruitmentOnboarding;
