'use client';
import { useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import MultiSelect from "@/components/form/MultiSelect";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { ChevronDownIcon } from "@/icons";
import { addExercise } from "@/firebase/firestore";
import { useRouter } from "next/navigation";

type ExerciseInputs = {
  name: string
  summDescription: string
  fullDescription: string
  image: File | null
  category: string
  tags: string[]
  mediaType: string
  audioFile: File | null
  videoFile: File | null
  slideshowFiles: File[]
}

const categories = [
  { value: "meditation", label: "Meditation" },
  { value: "breathe", label: "Breathe" },
  { value: "move", label: "Move" },
];

const tagList = [
  { value: "quickResets", text: "Quick Resets", selected: false },
  { value: "releaseTension", text: "Release Tension", selected: false },
  { value: "vagusNerveActivation", text: "Vagus Nerve Activation", selected: false },
]

const mediaTypes = [
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "slideshow", label: "Slideshow" },
]

export default function CreateExercise() {
  const router = useRouter();

  const {
    handleSubmit,
    watch,
    setValue,
  } = useForm<ExerciseInputs>({
    defaultValues: {
      name: '',
      summDescription: '',
      fullDescription: '',
      image: null,
      category: '',
      tags: [],
      mediaType: '',
      audioFile: null,
      videoFile: null,
      slideshowFiles: [],
    }
  });

  const {
    name,
    summDescription,
    fullDescription,
    image,
    category,
    tags,
    mediaType,
  } = watch();

  const onSubmit: SubmitHandler<ExerciseInputs> = async (data) => {
    const { name, summDescription, fullDescription, category, tags } = data;

    await addExercise({
      name, summDescription, fullDescription, category, tags
    });
    router.replace('/');
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue('image', file);
    }
  };

  const handleChangeFile = (key: keyof ExerciseInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(key, file);
    }
  };

  const isMultimediaTypeAvailable = useMemo(() => {
    return category === 'meditation' || category === 'move';
  }, [category]);

  const mediaInputsContent = useMemo(() => {
    if (mediaType === 'audio') {
      return (
        <div>
          <Label>Audio File</Label>
          <FileInput accept="audio/*" onChange={handleChangeFile('audioFile')} />
        </div>
      );
    }

    if (mediaType === 'video') {
      return (
        <div>
          <Label>Video File</Label>
          <FileInput accept="video/*" onChange={handleChangeFile('videoFile')} />
        </div>
      );
    }

    if (mediaType === 'slideshow') {
      return (
        <div>
          <Label>Slideshow Files</Label>
          <FileInput accept="image/*" multiple onChange={handleChangeFile('slideshowFiles')} />
        </div>
      );
    }

    return null;
  }, [mediaType]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-1/3 gap-4">
      <div>
        <Label>Name</Label>
        <Input type="text" value={name} onChange={e => setValue('name', e.target.value)} />
      </div>
      <div>
        <Label>Summary Description</Label>
        <TextArea rows={2} value={summDescription} onChange={val => setValue('summDescription', val)} />
      </div>
      <div>
        <Label>Full Description</Label>
        <TextArea rows={3} value={fullDescription} onChange={val => setValue('fullDescription', val)} />
      </div>
      <div>
        <Label>Image</Label>
        <FileInput accept="image/png, image/jpeg" value={image?.name} onChange={handleImageChange} />
      </div>
      <div>
        <Label>Category</Label>
        <div className="relative">
          <Select
            options={categories}
            value={category}
            placeholder="Select category"
            onChange={(val: ExerciseInputs['category']) => setValue('category', val)}
            className="dark:bg-dark-900"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      </div>
      <div>
        <div className="relative">
          <MultiSelect
            label="Tags"
            options={tagList}
            placeholder="Select tags"
            defaultSelected={[]}
            onChange={(values) => setValue('tags', values)}
          />
          <p className="sr-only">
            Tags {tags.join(", ")}
          </p>
        </div>
      </div>
      {isMultimediaTypeAvailable && (
        <div className="flex flex-col gap-2">
          <div className="relative">
            <Select
              options={mediaTypes}
              value={mediaType}
              placeholder="Select media type"
              onChange={(val) => setValue('mediaType', val)}
              className="dark:bg-dark-900"
            />
            <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
              <ChevronDownIcon />
            </span>
          </div>
          {mediaInputsContent}
        </div>
      )}
      <div>

      </div>
      <Button>Submit</Button>
    </form>
  )
};
