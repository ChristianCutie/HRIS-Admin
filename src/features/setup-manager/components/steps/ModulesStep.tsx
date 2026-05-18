import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
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

interface ModulesStepProps {
  modules: Module[];
  setModules: (modules: Module[]) => void;
}

export const ModulesStep = ({ modules, setModules }: ModulesStepProps) => {
  const [currentModuleForm, setCurrentModuleForm] = useState({
    title: "",
    description: "",
  });

  const handleAddModule = () => {
    if (!currentModuleForm.title.trim() || !currentModuleForm.description.trim()) {
      toast.error("Please fill in all module fields");
      return;
    }

    const newModule: Module = {
      id: Date.now().toString(),
      title: currentModuleForm.title,
      description: currentModuleForm.description,
      questions: [],
    };

    setModules([...modules, newModule]);
    setCurrentModuleForm({ title: "", description: "" });
    toast.success("Module added successfully!");
  };

  const handleDeleteModule = (id: string) => {
    setModules(modules.filter((m) => m.id !== id));
    toast.success("Module deleted");
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Add Module Form */}
        <div className="border-b pb-6">
          <h3 className="font-semibold mb-4">Add New Module</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="module-title">Module Title</Label>
              <Input
                id="module-title"
                placeholder="e.g., Introduction to React"
                value={currentModuleForm.title}
                onChange={(e) =>
                  setCurrentModuleForm({
                    ...currentModuleForm,
                    title: e.target.value,
                  })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="module-description">Module Description</Label>
              <Textarea
                id="module-description"
                placeholder="Describe the module content"
                value={currentModuleForm.description}
                onChange={(e) =>
                  setCurrentModuleForm({
                    ...currentModuleForm,
                    description: e.target.value,
                  })
                }
                className="mt-2"
                rows={4}
              />
            </div>

            <Button onClick={handleAddModule} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Module
            </Button>
          </div>
        </div>

        {/* Modules List */}
        {modules.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">
              Created Modules ({modules.length})
            </h3>
            <div className="space-y-3">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {index + 1}. {module.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {module.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {module.questions.length} question(s)
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
