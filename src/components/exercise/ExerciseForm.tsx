'use client';
import { useEffect, useMemo, useState } from "react";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";

import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import MultiSelect from "@/components/form/MultiSelect";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { ChevronDownIcon } from "@/icons";
import { addExercise, addStats, editExercise, getCategories, getTags } from "@/firebase/firestore";
import { uploadFile } from "@/firebase/storage";
import ImagePreview from "./ImagePreview";
import AudioPreview from "./AudioPreview";
import VideoPreview from "./VideoPreview";
import Checkbox from "../form/input/Checkbox";
import { addDoc, collection } from "firebase/firestore";
import { firestore } from "@/firebase/firebase";
import { useModal } from "@/hooks/useModal";
import { Modal } from "../ui/modal";

type ExerciseInputs = {
  visible: boolean
  name: string
  summDescription: string
  fullDescription: string
  imageType: 'Single' | 'Multiple'
  image: File | string | null
  multipleImages: {
    vertical?: File | string | null
    horizontal?: File | string | null
    fullscreen?: File | string | null
  }
  category: string
  tags: string[]
  mediaType: string
  audioFile: File | string | null
  videoFile: File | string | null
  slideshowFiles: { id?: string; image?: File | string | null, caption?: string }[]
  breathe: {
    inhale: number | string
    hold: number | string
    exhale: number | string
  }
  duration: number | string
}

export const imageTypes = [
  { value: "Single", label: "Single" },
  { value: "Multiple", label: "Multiple" },
];

export const mediaTypes = [
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "slideshow", label: "Slideshow" },
];

export interface ExerciseItem {
  id?: string
  name: string
  summDescription: string
  fullDescription: string
  category: string
  tags: string[]
  imageType: 'Single' | 'Multiple'
  mediaType: string
  image: string | null
  multipleImages: {
    vertical: string | null
    horizontal: string | null
    fullscreen: string | null
  }
  audioFile: string | null
  videoFile: string | null
  slideshowFiles?: { id?: string; image: string, caption: string }[]
  visible: boolean
  breathe: {
    inhale: number | string
    hold: number | string
    exhale: number | string
  }
  duration?: number | string
}

export interface WithStats {
  stats: {
    completions: number
    favorites: number
    starts: number
    views: number
    id?: string;
  } | null
}

export type ExerciseItemWithStats = ExerciseItem & WithStats;

export interface ExerciseFormProps {
  data?: ExerciseItem;
}

export default function ExerciseForm({ data }: ExerciseFormProps) {
  const router = useRouter();
  const { isOpen, openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<File | string | null>(null);
  const [tagList, setTagList] = useState<{ value: string; text: string; selected: boolean }[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    control,
    formState: { errors },
    setError,
  } = useForm<ExerciseInputs>({
    defaultValues: {
      visible: false,
      name: '',
      summDescription: '',
      fullDescription: '',
      imageType: 'Single',
      image: null,
      multipleImages: {
        vertical: null,
        horizontal: null,
        fullscreen: null,
      },
      category: '',
      tags: [],
      mediaType: '',
      audioFile: null,
      videoFile: null,
      slideshowFiles: [],
      breathe: {
        exhale: '',
        hold: '',
        inhale: ''
      },
      duration: '',
    },
  });

  register('visible');
  register('name', { required: true });
  register('summDescription', { required: true });
  register('fullDescription', { required: false });
  register('imageType', { required: true });
  register('image', {
    validate: {
      required: () => imageType === 'Multiple' ? true : imageType === 'Single' && image !== null,
    }
  });
  register('category', { required: true });
  register('mediaType', {
    validate: {
      required: () => category === 'breathe' ? true : mediaType !== '',
    }
  });
  register('audioFile', {
    validate: {
      required: () => mediaType !== 'audio' ? true : mediaType === 'audio' && audioFile !== null
    }
  });
  register('videoFile', {
    validate: {
      required: () => mediaType !== 'video' ? true : mediaType === 'video' && videoFile !== null,
    }
  });
  register('slideshowFiles', {
    validate: {
      required: () => mediaType !== 'slideshow' ? true : mediaType === 'slideshow' && slideshowFiles.length > 0,
    }
  });
  register('multipleImages.horizontal', {
    validate: {
      required: () => imageType === 'Single' ? true : imageType === 'Multiple' && multipleImages.horizontal !== null,
    }
  })
  register('multipleImages.vertical', {
    validate: {
      required: () => imageType === 'Single' ? true : imageType === 'Multiple' && multipleImages.vertical !== null,
    }
  })
  register('multipleImages.fullscreen', {
    validate: {
      required: () => imageType === 'Single' ? true : imageType === 'Multiple' && multipleImages.fullscreen !== null,
    }
  })
  register('breathe.inhale', {
    validate: {
      required: () => category !== 'breathe' ? true : category === 'breathe' && !!breathe?.inhale,
    }
  })
  register('breathe.hold', {
    validate: {
      required: () => category !== 'breathe' ? true : category === 'breathe' && !!breathe?.hold,
    }
  })
  register('breathe.exhale', {
    validate: {
      required: () => category !== 'breathe' ? true : category === 'breathe' && !!breathe?.exhale,
    }
  })

  const {
    remove: removeSlideImage,
    append: appendSlideImage,
    update: updateSlideImage,
  } = useFieldArray({ control, name: 'slideshowFiles' });

  useEffect(() => {
    getTags().then(tags => {
      const formattedTags = tags.map(tag => ({
        value: tag.name,
        text: tag.name,
        selected: false,
      }));
      setTagList(formattedTags);
    });

    getCategories().then(categories => {
      const formattedCategories = categories.map(category => ({
        label: category.label,
        value: category.label.toLowerCase(),
      }));
      setCategories(formattedCategories);
    })

    if (data) {
      setValue('visible', data.visible);
      setValue('name', data.name);
      setValue('summDescription', data.summDescription);
      setValue('fullDescription', data?.fullDescription ?? '');
      setValue('category', data.category);
      setValue('tags', data.tags);
      setValue('mediaType', data.mediaType);
      setValue('imageType', data.imageType);
      setValue('duration', data?.duration ?? '');
      if (data.image) {
        setValue('image', data.image);
      }
      if (data.multipleImages) {
        setValue('multipleImages', {
          vertical: data.multipleImages?.vertical ?? null,
          horizontal: data.multipleImages?.horizontal ?? null,
          fullscreen: data.multipleImages?.fullscreen ?? null,
        });
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
      if (data.breathe) {
        setValue('breathe', data.breathe);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const {
    visible,
    name,
    summDescription,
    fullDescription,
    image,
    category,
    tags,
    imageType,
    multipleImages,
    mediaType,
    audioFile,
    videoFile,
    slideshowFiles,
    breathe,
    duration,
  } = watch();

  const onSubmit: SubmitHandler<ExerciseInputs> = async (inputs) => {
    try {
      setIsLoading(true);
      const {
        image,
        audioFile,
        videoFile,
        slideshowFiles,
        multipleImages: { vertical, fullscreen, horizontal },
        ...rest
      } = inputs;

      if (slideshowFiles.length > 0) {
        const invalidSlides: number[] = [];
        slideshowFiles.forEach((slide, index) => {
          if (slide.caption?.trim() === '') {
            invalidSlides.push(index);
          }
        });
        if (invalidSlides.length > 0) {
          invalidSlides.forEach((index) => {
            setError(`slideshowFiles.${index}.caption`, { type: 'manual', message: 'Caption is required' });
          })
          setIsLoading(false);
          return;
        }
      }

      let exerciseId = data?.id;

      if (exerciseId === undefined) {
        const docRef = await addDoc(collection(firestore, 'exercises'), {});
        exerciseId = docRef.id;
        await addStats(exerciseId, { id: exerciseId, completions: 0, favorites: 0, starts: 0, views: 0 });
      }

      let uploadedImage: File | string | null = image;
      if (image && image instanceof File) {
        uploadedImage = await uploadFile(exerciseId, image as File);
      }

      const uploadedMultipleImages = {
        vertical: vertical,
        horizontal: horizontal,
        fullscreen: fullscreen,
      };

      if (vertical instanceof File && imageType === 'Multiple') {
        uploadedMultipleImages.vertical = await uploadFile(exerciseId, vertical as File)
      }

      if (horizontal instanceof File && imageType === 'Multiple') {
        uploadedMultipleImages.horizontal = await uploadFile(exerciseId, horizontal as File)
      }

      if (fullscreen instanceof File && imageType === 'Multiple') {
        uploadedMultipleImages.fullscreen = await uploadFile(exerciseId, fullscreen as File)
      }

      let uploadedAudio: File | string | null = audioFile;
      if (audioFile instanceof File && mediaType === 'audio') {
        uploadedAudio = await uploadFile(exerciseId, audioFile as File);
      }

      let uploadedVideo: File | string | null = videoFile;
      if (videoFile instanceof File && mediaType === 'video') {
        uploadedVideo = await uploadFile(exerciseId, videoFile as File);
      }

      let uploadedSlides: { image: string, caption: string }[] = [];
      if (slideshowFiles && mediaType === 'slideshow') {
        uploadedSlides = await Promise.all(slideshowFiles.map(async (slide) => {
          if (slide.image instanceof File) {
            const uploadedImage = await uploadFile(exerciseId, slide.image as File);
            return { image: uploadedImage, caption: slide.caption || '' };
          }
          return { image: slide.image ?? '', caption: slide.caption ?? '' };
        }));
      }

      if (data?.id) {
        await editExercise(data.id, {
          image: uploadedImage as string,
          audioFile: uploadedAudio as string,
          videoFile: uploadedVideo as string,
          slideshowFiles: uploadedSlides,
          multipleImages: uploadedMultipleImages as ExerciseItem['multipleImages'],
          ...rest,
        })
      } else {
        await addExercise(exerciseId, {
          image: uploadedImage as string,
          audioFile: uploadedAudio as string,
          videoFile: uploadedVideo as string,
          slideshowFiles: uploadedSlides,
          multipleImages: uploadedMultipleImages as ExerciseItem['multipleImages'],
          ...rest,
        });
      }

      router.replace('/exercises');
    } finally {
      setIsLoading(false);
    }
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

  const handleMultipleImageChange = (key: keyof ExerciseInputs['multipleImages']) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setValue(`multipleImages.${key}`, file);
    }
  }

  const handleChangeSlideImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event?.target?.files;

    if (files) {
      Array.from(files).slice(0, 5 - slideshowFiles.length).forEach((file) => {
        appendSlideImage({ image: file, caption: '' });
      })
    }
  };

  const handleImagePreview = (image?: File | string | null) => {
    if (image) {
      setPreviewImage(image);
      openModal();
    }
  }

  const isMultimediaTypeAvailable = useMemo(() => {
    return category === 'meditation' || category === 'move';
  }, [category]);

  const imageUploadContent = useMemo(() => {
    if (imageType === 'Single') {
      return (
        <div>
          <Label>Image</Label>
          <ImagePreview image={image} onClick={() => handleImagePreview(image)} onRemove={() => setValue('image', null)} />
          {!image && (
            <FileInput error={!!errors.image?.type} accept="image/png, image/jpeg" onChange={handleImageChange} />
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div>
          <Label>Vertical</Label>
          <ImagePreview image={multipleImages.vertical} onClick={() => handleImagePreview(multipleImages.vertical)} onRemove={() => setValue('multipleImages.vertical', null)} />
          {!multipleImages.vertical && (
            <FileInput error={!!errors.multipleImages?.vertical?.type} accept="image/png, image/jpeg" onChange={handleMultipleImageChange('vertical')} />
          )}
        </div>
        <div>
          <Label>Horizontal</Label>
          <ImagePreview image={multipleImages.horizontal} onClick={() => handleImagePreview(multipleImages.horizontal)} onRemove={() => setValue('multipleImages.horizontal', null)} />
          {!multipleImages.horizontal && (
            <FileInput error={!!errors.multipleImages?.horizontal?.type} accept="image/png, image/jpeg" onChange={handleMultipleImageChange('horizontal')} />
          )}
        </div>
        <div>
          <Label>Full Screen</Label>
          <ImagePreview image={multipleImages.fullscreen} onClick={() => handleImagePreview(multipleImages.fullscreen)} onRemove={() => setValue('multipleImages.fullscreen', null)} />
          {!multipleImages.fullscreen && (
            <FileInput error={!!errors.multipleImages?.fullscreen?.type} accept="image/png, image/jpeg" onChange={handleMultipleImageChange('fullscreen')} />
          )}
        </div>
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    image,
    errors.image,
    imageType,
    multipleImages.vertical,
    multipleImages.horizontal,
    multipleImages.fullscreen,
    errors.multipleImages,
    errors.multipleImages?.vertical,
    errors.multipleImages?.horizontal,
    errors.multipleImages?.fullscreen
  ]);

  const mediaInputsContent = useMemo(() => {
    if (mediaType === 'audio') {
      return (
        <div>
          <Label>Audio File</Label>
          <AudioPreview audio={audioFile} onRemove={() => setValue('audioFile', null)} />
          {!audioFile && (
            <FileInput error={!!errors.audioFile?.type} accept="audio/*" onChange={handleChangeFile('audioFile')} />
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
            <FileInput error={!!errors.videoFile?.type} accept="video/*" onChange={handleChangeFile('videoFile')} />
          )}
        </div>
      );
    }

    if (mediaType === 'slideshow') {
      return (
        <div>
          <Label>{`Slideshow Files (${slideshowFiles.length}/5)`}</Label>
          <div className="flex gap-2 mb-2 pt-2">
            {slideshowFiles?.map((slide, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1"
              >
                <ImagePreview image={slide?.image} onClick={() => handleImagePreview(slide.image)} onRemove={() => removeSlideImage(index)} />
                <Input {...register(`slideshowFiles.${index}.caption`, { required: true })} error={!!errors.slideshowFiles?.[index]?.caption} type="text" value={slideshowFiles[index].caption} onChange={e => updateSlideImage(index, { caption: e.target.value, image: slide?.image })} />
              </div>
            ))}
          </div>
          {slideshowFiles?.length < 5 && (
            <FileInput accept="image/*" error={!!errors.slideshowFiles?.root} multiple onChange={handleChangeSlideImage} />
          )}
        </div>
      );
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType, audioFile, videoFile, slideshowFiles, errors.audioFile, errors.videoFile, errors.slideshowFiles]);

  const breatheInputsContent = useMemo(() => {
    if (category === 'breathe') {
      return <div className="flex flex-col gap-2">
        <div>
          <Label>Inhale</Label>
          <Input error={!!errors.breathe?.inhale?.type} value={breathe.inhale} onChange={e => {
            const val = e.target.value;
            const num = Number(val);
            if (val === '') return setValue('breathe.inhale', '');
            if (/^\d*\.?\d*$/.test(val)) {
              const validNum = num < 0 ? 0 : num > 100 ? 100 : num;
              setValue('breathe.inhale', validNum);
            }
          }} />
        </div>
        <div>
          <Label>Hold</Label>
          <Input error={!!errors.breathe?.hold?.type} value={breathe.hold} onChange={e => {
            const val = e.target.value;
            const num = Number(val);
            if (val === '') return setValue('breathe.hold', '');
            if (/^\d*\.?\d*$/.test(val)) {
              const validNum = num < 0 ? 0 : num > 100 ? 100 : num;
              setValue('breathe.hold', validNum);
            }
          }} />
        </div>
        <div>
          <Label>Exhale</Label>
          <Input error={!!errors.breathe?.exhale?.type} value={breathe.exhale} onChange={e => {
            const val = e.target.value;
            const num = Number(val);
            if (val === '') return setValue('breathe.exhale', '');
            if (/^\d*\.?\d*$/.test(val)) {
              const validNum = num < 0 ? 0 : num > 100 ? 100 : num;
              setValue('breathe.exhale', validNum);
            }
          }} />
        </div>
      </div>
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, breathe.inhale, breathe.hold, breathe.exhale, errors.breathe, errors.breathe?.inhale, errors.breathe?.hold, errors.breathe?.exhale]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-1/3 gap-4">
      <div className="flex flex-row items-center gap-2">
        <Label className="mb-0">Active</Label>
        <Checkbox checked={visible} onChange={(checked) => setValue('visible', checked)} />
      </div>
      <div>
        <Label>Name</Label>
        <Input error={!!errors.name?.type} type="text" value={name} onChange={e => setValue('name', e.target.value)} />
      </div>
      <div>
        <Label>Summary Description</Label>
        <TextArea error={!!errors.summDescription?.type} rows={2} value={summDescription} onChange={val => setValue('summDescription', val)} />
      </div>
      <div>
        <Label>Full Description</Label>
        <TextArea rows={3} error={!!errors.fullDescription?.type} value={fullDescription} onChange={val => setValue('fullDescription', val)} />
      </div>
      <div>
        <Label>Image type</Label>
        <div className="relative">
          <Select
            options={imageTypes}
            value={imageType}
            error={!!errors.imageType?.type}
            placeholder="Select image type"
            onChange={(val) => setValue('imageType', val as ExerciseItem['imageType'])}
            className="dark:bg-dark-900"
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      </div>
      {imageUploadContent}
      <div>
        <Label>Category</Label>
        <div className="relative">
          <Select
            options={categories}
            value={category}
            error={!!errors.category?.type}
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
      <div>
        <Label>{"Duration (min)"}</Label>
        <Input error={!!errors.duration?.type} value={duration} onChange={e => {
          const val = e.target.value;
          const num = Number(val);
          if (val === '') return setValue('breathe.inhale', '');
          if (/^\d*\.?\d*$/.test(val)) {
            const validNum = num < 0 ? 0 : num > 100 ? 100 : num;
            setValue('duration', validNum);
          }
        }} />
      </div>
      {isMultimediaTypeAvailable && (
        <div className="flex flex-col gap-2">
          <div>
            <Label>Multimedia Type</Label>
            <div className="relative">
              <Select
                options={mediaTypes}
                value={mediaType}
                error={!!errors.mediaType?.type}
                placeholder="Select media type"
                onChange={(val) => setValue('mediaType', val)}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
          </div>
          {mediaInputsContent}
        </div>
      )}
      {breatheInputsContent}
      <Button isLoading={isLoading} disabled={isLoading}>Submit</Button>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10 flex justify-center items-center"
      >
        <Image
          src={typeof previewImage === 'string' ? previewImage : previewImage ? URL.createObjectURL(previewImage) : ''}
          alt={'Preview image'}
          width={400}
          height={400}
          className={`size-50object-cover rounded-xl`}
        />
      </Modal>
    </form>
  )
};
