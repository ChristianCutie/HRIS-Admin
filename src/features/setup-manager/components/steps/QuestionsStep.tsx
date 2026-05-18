import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

interface QuestionChoice {
  choice_text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question: string;
  choices: QuestionChoice[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface QuestionsStepProps {
  modules: Module[];
  setModules: (modules: Module[]) => void;
}

export const QuestionsStep = ({ modules, setModules }: QuestionsStepProps) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [currentQuestionForm, setCurrentQuestionForm] = useState({
    question: "",
    newChoiceText: "",
  });

  const [currentChoices, setCurrentChoices] = useState<QuestionChoice[]>([]);

  const handleAddChoice = () => {
    if (!currentQuestionForm.newChoiceText.trim()) {
      toast.error("Please enter choice text");
      return;
    }

    const newChoice: QuestionChoice = {
      choice_text: currentQuestionForm.newChoiceText,
      is_correct: false,
    };

    setCurrentChoices([...currentChoices, newChoice]);
    setCurrentQuestionForm({
      ...currentQuestionForm,
      newChoiceText: "",
    });
  };

  const handleDeleteChoice = (index: number) => {
    setCurrentChoices(currentChoices.filter((_, i) => i !== index));
  };

  const handleToggleCorrectChoice = (index: number) => {
    const updated = currentChoices.map((choice, i) =>
      i === index ? { ...choice, is_correct: !choice.is_correct } : choice
    );
    setCurrentChoices(updated);
  };

  const handleAddQuestion = () => {
    if (!currentQuestionForm.question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    if (!selectedModuleId) {
      toast.error("Please select a module");
      return;
    }

    if (currentChoices.length === 0) {
      toast.error("Please add at least one choice");
      return;
    }

    const hasCorrectAnswer = currentChoices.some((c) => c.is_correct);
    if (!hasCorrectAnswer) {
      toast.error("Please mark at least one choice as correct");
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestionForm.question,
      choices: currentChoices,
    };

    // Add question to the selected module
    const updatedModules = modules.map((module) =>
      module.id === selectedModuleId
        ? { ...module, questions: [...module.questions, newQuestion] }
        : module
    );

    setModules(updatedModules);
    setCurrentQuestionForm({ question: "", newChoiceText: "" });
    setCurrentChoices([]);
    toast.success("Question added successfully!");
  };

  const handleDeleteQuestion = (moduleId: string, questionId: string) => {
    const updatedModules = modules.map((module) =>
      module.id === moduleId
        ? {
            ...module,
            questions: module.questions.filter((q) => q.id !== questionId),
          }
        : module
    );
    setModules(updatedModules);
    toast.success("Question deleted");
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Modules List - Select Which Module Needs Questions */}
        <div className="border-b pb-6">
          <h3 className="font-semibold mb-4">Step 1: Select Module to Add Questions</h3>
          <p className="text-sm text-gray-600 mb-4">
            Choose which module needs questions added:
          </p>

          <div className="space-y-3">
            {modules.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No modules created yet</p>
            ) : (
              modules.map((module) => (
                <div
                  key={module.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedModuleId === module.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                  onClick={() => {
                    setSelectedModuleId(module.id);
                    setShowQuestionForm(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{module.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs bg-gray-100 px-3 py-1 rounded">
                          {module.questions.length} question(s)
                        </span>
                        {module.questions.length === 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded font-medium">
                            ⚠️ Needs Questions
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={selectedModuleId === module.id ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedModuleId(module.id);
                        setShowQuestionForm(true);
                      }}
                    >
                      {selectedModuleId === module.id ? "✓ Selected" : "Select"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Question Form - Only Show When Module Selected */}
        {showQuestionForm && selectedModuleId && (
          <div className="border-b pb-6 bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Step 2: Add Questions to "{modules.find((m) => m.id === selectedModuleId)?.title}"
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowQuestionForm(false);
                  setCurrentQuestionForm({ question: "", newChoiceText: "" });
                  setCurrentChoices([]);
                }}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="question-text">Question</Label>
                <Textarea
                  id="question-text"
                  placeholder="Enter your question"
                  value={currentQuestionForm.question}
                  onChange={(e) =>
                    setCurrentQuestionForm({
                      ...currentQuestionForm,
                      question: e.target.value,
                    })
                  }
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-blue-200">
                <div>
                  <Label htmlFor="choice-text">Add Choice</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="choice-text"
                      placeholder="Enter choice text"
                      value={currentQuestionForm.newChoiceText}
                      onChange={(e) =>
                        setCurrentQuestionForm({
                          ...currentQuestionForm,
                          newChoiceText: e.target.value,
                        })
                      }
                    />
                    <Button onClick={handleAddChoice} size="sm" variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {currentChoices.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 uppercase">Choices</Label>
                    {currentChoices.map((choice, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded border"
                      >
                        <Checkbox
                          id={`choice-${idx}`}
                          checked={choice.is_correct}
                          onCheckedChange={() =>
                            handleToggleCorrectChoice(idx)
                          }
                        />
                        <label htmlFor={`choice-${idx}`} className="flex-1 text-sm cursor-pointer">
                          {choice.choice_text}
                          {choice.is_correct && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Correct
                            </span>
                          )}
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteChoice(idx)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={handleAddQuestion} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Question to Module
              </Button>
            </div>
          </div>
        )}

        {/* Questions Summary by Module */}
        {modules.some((m) => m.questions.length > 0) && (
          <div>
            <h3 className="font-semibold mb-4">Questions Added</h3>
            <div className="space-y-4">
              {modules
                .filter((module) => module.questions.length > 0)
                .map((module) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-3 text-blue-600">
                      {module.title}
                    </h4>

                    <div className="space-y-3 ml-4">
                      {module.questions.map((question, idx) => (
                        <div
                          key={question.id}
                          className="border-l-2 border-blue-300 pl-4 py-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                Q{idx + 1}: {question.question}
                              </p>
                              <div className="mt-2 space-y-1">
                                {question.choices.map((choice, cIdx) => (
                                  <p
                                    key={cIdx}
                                    className={`text-xs pl-4 ${
                                      choice.is_correct
                                        ? "text-green-600 font-semibold"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {choice.is_correct ? "✓ " : "○ "}
                                    {choice.choice_text}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteQuestion(module.id, question.id)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedModuleId === module.id && showQuestionForm && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={() => {
                          setCurrentQuestionForm({ question: "", newChoiceText: "" });
                          setCurrentChoices([]);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add More Questions
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
