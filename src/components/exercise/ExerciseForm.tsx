'use client';
import { useEffect, useMemo } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import MultiSelect from "@/components/form/MultiSelect";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { ChevronDownIcon } from "@/icons";
import { addExercise, editExercise } from "@/firebase/firestore";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/firebase/storage";
import ImagePreview from "./ImagePreview";
import AudioPreview from "./AudioPreview";
import VideoPreview from "./VideoPreview";

type ExerciseInputs = {
  name: string
  summDescription: string
  fullDescription: string
  image: File | string | null
  category: string
  tags: string[]
  mediaType: string
  audioFile: File | string | null
  videoFile: File | string | null
  slideshowFiles: { image?: File | string | null, caption?: string }[]
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
];

interface ExerciseFormProps {
  data?: {
    id: string
    name: string
    summDescription: string
    fullDescription: string
    category: string
    tags: string[]
    mediaType: string
    image?: string | null
    audioFile?: string | null
    videoFile?: string | null
    slideshowFiles?: { image: string, caption: string }[]
  }
}

export default function ExerciseForm({ data }: ExerciseFormProps) {
  const router = useRouter();

  const {
    handleSubmit,
    watch,
    setValue,
    control,
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

  const { remove: removeSlideImage, append: appendSlideImage, update: updateSlideImage } = useFieldArray({ control, name: 'slideshowFiles' });

  useEffect(() => {
    if (data) {
      setValue('name', data.name);
      setValue('summDescription', data.summDescription);
      setValue('fullDescription', data.fullDescription);
      setValue('category', data.category);
      setValue('tags', data.tags);
      setValue('mediaType', data.mediaType);
      if (data.image) {
        setValue('image', data.image);
      }
      if (data.audioFile) {
        setValue('audioFile', data.audioFile);
      }
      if (data.videoFile) {
        setValue('videoFile', data.videoFile);
      }
      if (data.slideshowFiles) {
        setValue('slideshowFiles', data.slideshowFiles);
      }
    }
  }, [data]);

  const {
    name,
    summDescription,
    fullDescription,
    image,
    category,
    tags,
    mediaType,
    audioFile,
    videoFile,
    slideshowFiles,
  } = watch();

  const onSubmit: SubmitHandler<ExerciseInputs> = async (inputs) => {
    const {
      name,
      summDescription,
      fullDescription,
      category,
      tags,
      mediaType,
      audioFile,
      image,
      slideshowFiles,
      videoFile,
    } = inputs;

    let uploadedImage: string | null = null;
    if (image) {
      uploadedImage = await uploadFile(image as File);
    }

    let uploadedAudio: string | null = null;
    if (audioFile && mediaType === 'audio') {
      uploadedAudio = await uploadFile(audioFile as File);
    }

    let uploadedVideo: string | null = null;
    if (videoFile && mediaType === 'video') {
      uploadedVideo = await uploadFile(videoFile as File);
    }

    let uploadedSlides: { image: string, caption: string }[] = [];
    if (slideshowFiles && mediaType === 'slideshow') {
      uploadedSlides = await Promise.all(slideshowFiles.map(async (slide) => {
        if (slide.image) {
          const uploadedImage = await uploadFile(slide.image as File);
          return { image: uploadedImage, caption: slide.caption || '' };
        }
        return { image: '', caption: slide.caption || '' };
      }));
    }

    if (data?.id) {
      await editExercise(data.id, {
        name,
        summDescription,
        fullDescription,
        category,
        tags,
        mediaType,
        image: uploadedImage,
        audioFile: uploadedAudio,
        videoFile: uploadedVideo,
        slideshowFiles: uploadedSlides,
      })
    } else {
      await addExercise({
        name,
        summDescription,
        fullDescription,
        category,
        tags,
        mediaType,
        image: uploadedImage,
        audioFile: uploadedAudio,
        videoFile: uploadedVideo,
        slideshowFiles: uploadedSlides,
      });
    }

    router.replace('/exercises');
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

  const handleChangeSlideImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;

    if (files) {
      Array.from(files).forEach((file) => {
        appendSlideImage({ image: file, caption: '' });
      })
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
          <AudioPreview audio={audioFile} onRemove={() => setValue('audioFile', null)} />
          {!audioFile && (
            <FileInput accept="audio/*" onChange={handleChangeFile('audioFile')} />
          )}
        </div>
      );
    }

    if (mediaType === 'video') {
      return (
        <div>
          <Label>Video File</Label>
          <VideoPreview video={videoFile} onRemove={() => setValue('videoFile', null)} />
          {!videoFile && (
            <FileInput accept="video/*" onChange={handleChangeFile('videoFile')} />
          )}
        </div>
      );
    }

    if (mediaType === 'slideshow') {
      return (
        <div>
          <Label>Slideshow Files</Label>
          <div className="flex gap-2 mb-2">
            {slideshowFiles?.map((slide, index) => (
              <div
                key={(typeof slide?.image === 'string' && slide?.image) || (slide?.image && slide?.image instanceof File && slide?.image?.name) || slide.caption}
                className="flex flex-col items-center gap-1"
              >
                <ImagePreview image={slide?.image} onRemove={() => removeSlideImage(index)} />
                <Input type="text" value={slideshowFiles[index].caption} onChange={e => updateSlideImage(index, { caption: e.target.value, image: slide?.image })} />
              </div>
            ))}
          </div>
          {slideshowFiles?.length < 5 && (
            <FileInput accept="image/*" max={5} multiple onChange={handleChangeSlideImage} />
          )}
        </div>
      );
    }

    return null;
  }, [mediaType, audioFile, videoFile, slideshowFiles]);

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
        <ImagePreview image={image} onRemove={() => setValue('image', null)} />
        {!image && (
          <FileInput accept="image/png, image/jpeg" onChange={handleImageChange} />
        )}
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
            selectedOptions={tags}
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
