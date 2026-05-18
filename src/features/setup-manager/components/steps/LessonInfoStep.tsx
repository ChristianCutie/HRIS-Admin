import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface LessonData {
  title: string;
  description: string;
}

interface LessonInfoStepProps {
  lessonData: LessonData;
  setLessonData: (data: LessonData) => void;
}

export const LessonInfoStep = ({ lessonData, setLessonData }: LessonInfoStepProps) => {
  const handleTitleChange = (value: string) => {
    setLessonData({ ...lessonData, title: value });
  };

  const handleDescriptionChange = (value: string) => {
    setLessonData({ ...lessonData, description: value });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div>
          <Label htmlFor="lesson-title">Lesson Title</Label>
          <Input
            id="lesson-title"
            placeholder="Enter lesson title"
            value={lessonData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="lesson-description">Lesson Description</Label>
          <Textarea
            id="lesson-description"
            placeholder="Enter lesson description"
            value={lessonData.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="mt-2"
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
};
